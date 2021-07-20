import { ItemPredicate, ItemRenderer, IItemRendererProps} from '@blueprintjs/select'
import { MenuItem } from '@blueprintjs/core'
import { Encounter, Condition, Procedure, Observation } from "fhir/r4";
import { Key } from 'readline';


/**
 *  Utility Functions
 */

function getDateTime(fhir_datetime: string) {
    const split_1 = fhir_datetime.split("T", 2);

    // split_1[0] is the date
    return split_1[0] + " " + split_1[1].split(".", 2)[0]
}

export function getMiliseconds(fhir_datetime: string) {
    return new Date(fhir_datetime.split(".", 2)[0]).getTime();
}

function createObservEntry(observ: Observation) {
    let mapping_code_name = new Map()
    mapping_code_name.set('90562-0', 'Apnea Index');
    mapping_code_name.set('90561-2', 'Hypnopnea Index');
    mapping_code_name.set('90565-3', 'RERA Index');
    mapping_code_name.set('69990-0', 'AHI');
    mapping_code_name.set('90566-1', 'RDI');
    mapping_code_name.set('93832-4', 'Totale Schlafzeit');
    mapping_code_name.set('418763003', 'PLM Index');
    mapping_code_name.set('72863001', 'Schnarchzeit');
    mapping_code_name.set('Schlaflatenz', 'Schlaflatenz');

    return {name: mapping_code_name.get(getObsCode(observ)), code: getObsCode(observ), unit: getObsUnit(observ), value: getObsValue(observ)};
}

// returns the Poly Data filtered by the selected procedure id
export function getSelPolyData(observations :Map<String, Observation[]>, fhir_proc_id: string) {
    const fhir_observations: Observation[] = checkObservIsValid(observations.get("Procedure/" + fhir_proc_id));
    const new_observations: IObservEntry[] = [];
    let RDI: number = 0;
    let AHI: number = 0;
    let Schnarchzeit: number = 0;
    let totaleSchlafzeit: number = 0;

    const calculateRDIpAHI = () => {
        if (RDI === 0 || AHI === 0) {
            return 0;
        } else {
            return Number((RDI / AHI).toFixed(2));
        }
    }

    const calculateTotalSchnarchen = () => {
        if (Schnarchzeit === 0 || totaleSchlafzeit === 0) {
            return 0;
        } else {
            return Number((Schnarchzeit / totaleSchlafzeit * 100).toFixed(2));
        }
    }

    const createObservAndAppend = (observ: Observation) => {
        const a_observ: IObservEntry = createObservEntry(observ);
        new_observations.push(a_observ);
        if (a_observ.code === '69990-0') {
            AHI = a_observ.value;
        } else if (a_observ.code === '90566-1') {
            RDI = a_observ.value;
        } else if (a_observ.code === '72863001') {
            Schnarchzeit = a_observ.value;
        } else if (a_observ.code === '93832-4') {
            totaleSchlafzeit = a_observ.value;
        }
    }

    fhir_observations.forEach(x => createObservAndAppend(x));
    new_observations.push({name: "RDI / AHI", value: calculateRDIpAHI(), code: "", unit: "n/h"});
    new_observations.push({name: "Schnarchen Total", value: calculateTotalSchnarchen(), code: "", unit: "%TST"});

    return new_observations;
}


/**
 *  Getter Functions for Creating Case Objects
 */

export function getStart(enc: Encounter) {
    if (enc.period) {
        if (enc.period.start) {
            const start = enc.period.start;
            return start;
        } else {
            return "No Start Period exists";
        }
    } else {
        return "No Period exists";
    }
}

export function getEnd(enc: Encounter) {
    if (enc.period) {
        if (enc.period) {
            if (enc.period.end) {
                const end = enc.period.end;
                return end;
            } else {
                return "";
            }
        } else {
            return "No End Period exists";
        }
    } else {
        return "No Period exists";
    }
}

export function getCaseId(enc: Encounter) {
    if (enc.identifier) {
        if (enc.identifier[0].value) {
            const ident = enc.identifier[0].value;
            return ident;
        } else {
            return "No Identifier value exists";
        }
    } else {
        return "No Identifier exists";
    }
}

/**
 *  Getter Functions for Creating Diagnosis Objects
 */

export function getDiagCode(cond: Condition) {
    if (cond.code) {
        if (cond.code.coding) {
            if (cond.code.coding[0].code) {
                const code = cond.code.coding[0].code;
                return code;
            } else {
                return "";
            }
        }
        else {
            return "";
        }
    } else {
        return "";
    }
}

export function getDiagName(cond: Condition) {
    if (cond.code) {
        if (cond.code.coding) {
            if (cond.code.coding[0].display) {
                return cond.code.coding[0].display;
            } else {
                return "";
            }
        }
        else {
            return "";
        }
    } else {
        return "";
    }
}

export function getFhirCaseId(cond: Condition) {
    if (cond.encounter) {
        if (cond.encounter.reference) {
            return cond.encounter.reference.split("/")[1];
        } else {
            return "";
        }
    } else {
        return "";
    }
}

export function getType(cond: Condition) {
    if (cond.note) {
        if (cond.note[0].text) {
            return cond.note[0].text;
        } else {
            return "No text in note exists";
        }
    } else {
        return "No Note exists";
    }
}

/**
 *  Getter Functions for Creating Procedure Objects
 */

export function getFhirCaseIdProc(proc: Procedure) {
    if (proc.encounter) {
        if (proc.encounter.reference) {
            return proc.encounter.reference.split("/")[1];
        } else {
            return "";
        }
    } else {
        return "";
    }
}

export function getProcId(proc: Procedure) {
    if (proc.identifier) {
        if (proc.identifier[0].value) {
            const ident = proc.identifier[0].value;
            return ident;
        } else {
            return "No Identifier value exists";
        }
    } else {
        return "No Identifier exists";
    }
}

export function getFhirProcId(proc: Procedure) {
    if (proc.id) {
        return proc.id;
    } else {
        return "";
    }
}

/**
 *  Getter Functions for Creating Procedure Objects
 */

function checkObservIsValid(observations?: Observation[]) {
    if (observations) {
        return observations;
    } else {
        return [] as Observation[];
    }
}

function getObsValue(observ: Observation) {
    if (observ.valueQuantity) {
        if (observ.valueQuantity.value) {
            return observ.valueQuantity.value;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

function getObsCode(observ: Observation) {
    if (observ.valueQuantity) {
        if (observ.valueQuantity.code) {
            return observ.valueQuantity.code;
        } else {
            return "";
        }
    } else {
        return ""
    }
}

function getObsUnit(observ: Observation) {
    if (observ.valueQuantity) {
        if (observ.valueQuantity.unit) {
            return observ.valueQuantity.unit;
        } else {
            return "";
        }
    } else {
        return ""
    }
}

function getObsName(observ: Observation) {
    if (observ.code) {
        if (observ.code.coding) {
            if (observ.code.coding[0].display) {
                return observ.code.coding[0].display;
            } else {
                return "";
            }
        } else {
            return "";
        }
    } else {
        return ""
    }
}





/**
 * Functions for Rendering the Selection
 */

export function setText(start: string, end: string, case_id: string) {

    let text = "";
    const spaces = 2;

    if (end === "") {
        text = `${getDateTime(start)} - ...` + `( ${case_id} )`;
    } else {
        text = `${getDateTime(start)}` + Array(spaces).fill('\xa0').join('') + "-" + Array(spaces).fill('\xa0').join('') + `${getDateTime(end)}` + Array(spaces).fill('\xa0').join('') + `( ${case_id} )`;
    }
    return text;
}

const filterCase: ItemPredicate<ICase> = (query: string, item: ICase) => {
    if (item.case_id) {
        return item.case_id.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    } else {
        // If there is no case_id, it will be filtered
        return false;
    }
}

export const renderCase: ItemRenderer<ICase> = (item: ICase, itemProps: IItemRendererProps) => {
    if (!itemProps.modifiers.matchesPredicate) {
        return null;
    }

    return (
        <MenuItem
            key={item.case_id}
            onClick={itemProps.handleClick}
            text={setText(item.start, item.end, item.case_id)}
        />
    )
};

export const renderProc: ItemRenderer<IProc> = (item: IProc, itemProps: IItemRendererProps) => {
    if (!itemProps.modifiers.matchesPredicate) {
        return null;
    }

    return (
        <MenuItem
            key={item.proc_id}
            onClick={itemProps.handleClick}
            text={"(" + item.proc_id + ")"}
        />
    )
};

/**
 * Types
 */

export interface IDiag {
    type: string,   // discharge or admission diagnosis
    code: string,   // diagnosis code
    name: string,   // name of the diagnosis
    fhir_case_id: string,
}

export interface ICase {
    start: string,
    end: string
    case_id: string,
    fhir_id?: string
}

export interface IProc {
    timestamp: string,  
    proc_id: string,               // Proceudre-Id
    fhir_case_id: string,
    fhir_proc_id: string
}

export interface IObserv {
    proc_id: string,               // Proceudre-Id
    observations: IObservEntry[]
}

export interface IObservEntry {
    code: string,   // Code of the observation
    value: number,  // 
    unit:string,
    name: string
}

export interface FilterProps {
    query: string,
    case: ICase
}