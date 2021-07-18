import { ItemPredicate, ItemRenderer, IItemRendererProps} from '@blueprintjs/select'
import { MenuItem } from '@blueprintjs/core'
import { Encounter, Condition, Procedure, Observation } from "fhir/r4";


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
 *  Getter Functions for Creating Diagnosis Objects
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
    fhir_case_id: string
}

export interface IObserv {
    proc_id: string,               // Proceudre-Id
    observations: IObservEntry[]
}

export interface IObservEntry {
    code: string,   // Code of the observation
    value: string,  // 
    unit:string
}

export interface FilterProps {
    query: string,
    case: ICase
}