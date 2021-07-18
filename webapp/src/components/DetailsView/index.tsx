import './index.css';

import {useState, useCallback, useEffect} from 'react';
import { Condition, Encounter, Observation, Procedure } from "fhir/r4";

import { Select } from '@blueprintjs/select';
import { Button } from '@blueprintjs/core';
import { ICase, IDiag, IObserv, IObservEntry, IProc,
        renderCase, renderProc,
        getStart, getEnd, getCaseId, setText, getType, getDiagCode, getDiagName, getFhirCaseId, getMiliseconds,
        getFhirCaseIdProc, getProcId, getFhirProcId, getSelPolyData } from './utils';
import { DiagnosisRow, PolySomnoView } from './elements';


const CaseSelect = Select.ofType<ICase>();
const ProcSelect = Select.ofType<IProc>();

function transformIntoArray(fhir_res_array: Encounter[]):ICase[] {

    const cases: ICase[] = [];

    // Creates Case Object and inserts into the list
    const createCaseAndAppend = (el: Encounter) => {
        const a_case: ICase = {start: getStart(el), end: getEnd(el), case_id: getCaseId(el), fhir_id: el.id};
        cases.push(a_case);
    }
    fhir_res_array.forEach(x => createCaseAndAppend(x));

    // Sort the cases descending (most recently case at first)
    cases.sort((a, b) => {
        return getMiliseconds(b.start) - getMiliseconds(a.start);
    })

    return cases
}

function transformIntoDiagArray(fhir_res_array: Map<string, Condition[]>):IDiag[] {
    const diagnoses:  IDiag[] = [];

    const createDiagAndAppend = (cond_list: Condition[]) => {
        let i = 0;
        while (i < cond_list.length) {
            const a_diag: IDiag = {type: getType(cond_list[i]), code: getDiagCode(cond_list[i]), 
                                    name: getDiagName(cond_list[i]), fhir_case_id: getFhirCaseId(cond_list[i])};
            diagnoses.push(a_diag);
            i += 1;
        }
    }
    fhir_res_array.forEach(x => createDiagAndAppend(x));

    return diagnoses;
}

function transformIntoProcObsArray(fhir_proc_array: Procedure[]):IProc[] {
    const procedures: IProc[] = [];

    const createProcAndAppend = (proc: Procedure) => {
        const a_proc: IProc = {fhir_case_id: getFhirCaseIdProc(proc), proc_id: getProcId(proc), timestamp: "", fhir_proc_id: getFhirProcId(proc)};
        procedures.push(a_proc);
    }

    fhir_proc_array.forEach(x => createProcAndAppend(x));

    return procedures;
}

function transformIntoPolyArray(fhir_poly_smno_array: Observation[]) {
    const observations: IObserv[] = [];

    return observations;
}

/**  <select>{data.map((x, y) => <option key={y}>{x}</option>)}</select>  */
/*
const Selection = ({cases}: SelectedProps) => {

    // For setting the case on the top of the selection list
    const [selected_case, setCase] = useState(cases[0]);

    const handleItemSelect = useCallback((a_case: ICaseEntry) => {
        setCase(a_case);
    }, []);

    return (
        <CaseSelect
            items={cases}
            itemRenderer={renderCase}   /** renderCase: determines, how the case entry is displayed in the Selection List */
            /*onItemSelect={handleItemSelect}
        >
            <Button 
                rightIcon="caret-down"
                text={selected_case ? ` ${selected_case.start} - ${selected_case.end}` + Array(2).fill('\xa0').join('') + `( ${selected_case.id} )` : "No Selection"}
            />
        </CaseSelect>
    )
}*/

const Label = ({text}: LabelProps) => {
    return (
        <div className={`details-view-label`}>
            {text}
        </div>
    )
}

export const DetailsView = ({
    encounters,
    conditionMap,
    observationMap,
    procedures
}: DetailProps) => {

    const cases = transformIntoArray(encounters);
    const diagnoses = transformIntoDiagArray(conditionMap);
    const m_procedures = transformIntoProcObsArray(procedures);
    console.log("ObservationMap: ", observationMap);
    console.log("Proceudres: ", m_procedures);

    const [selected_case, setCase] = useState(cases[0]);
    const [diag, setDiagState] = useState({
        admission: {name: "", code: "", type: "admission", fhir_case_id: ""} as IDiag,
        discharge: {name: "", code: "", type: "discharge", fhir_case_id: ""} as IDiag,
    });
    const [proc_list, setProcList] = useState([] as IProc[])
    const [selected_proc, setProc] = useState(m_procedures.filter(proc => proc.fhir_case_id === selected_case.fhir_id)[0]);
    const [poly_somno_data, setPolySomnoData] = useState(getSelPolyData(observationMap, selected_proc.fhir_proc_id));

    function polyDataIsLoading() {
        if (poly_somno_data === []) {
            console.log("poly_data: ", poly_somno_data);
            return true;
        } else {
            console.log("poly_data: ", poly_somno_data);
            return false;
        }
    }

    useEffect(() => {
        /*Update view by searching the respective */
        const adm_diag: IDiag[] = diagnoses.filter(diag => diag.fhir_case_id === selected_case.fhir_id && diag.type === "admission");
        const dis_diag: IDiag[] = diagnoses.filter(diag => diag.fhir_case_id === selected_case.fhir_id && diag.type === "discharge");
        if (dis_diag.length === 0) {
            const default_diag: IDiag = {name: "", code: "", type: "discharge", fhir_case_id: ""}
            setDiagState({admission: adm_diag[0], discharge: default_diag});
        } else {
            setDiagState({admission: adm_diag[0], discharge: dis_diag[0]});
        }
        /* Updating  */
        const filtered_proc = m_procedures.filter(proc => proc.fhir_case_id === selected_case.fhir_id);
        setProcList(filtered_proc);
        setProc(filtered_proc[0]);
        setPolySomnoData(getSelPolyData(observationMap, filtered_proc[0].fhir_proc_id));
        console.log("Selected Case has changed");
    }, [selected_case])


    useEffect(() => {
        setPolySomnoData(getSelPolyData(observationMap, selected_proc.fhir_proc_id));
    }, [selected_proc])

    const handleCaseSelect = useCallback(
        (a_case: ICase) => {
            setCase(a_case);
        },
        [],
    )

    const handleProcSelect = useCallback(
        (a_proc: IProc) => {
            setProc(a_proc);
        },
        [],
    )

    return (
        <div className={`details-view-container`}>
            <h2>Detailinformationen</h2>
            <div className={`details-view-info-container`}>
                <div className={`details-view__label-selection-element`}>
                    <Label text="Fall"/>
                    <CaseSelect
                        items={cases}
                        itemRenderer={renderCase}   /** renderCase: determines, how the case entry is displayed in the Selection List */
                        onItemSelect={handleCaseSelect}
                    >
                        <Button 
                            rightIcon="caret-down"
                            text={selected_case ? setText(selected_case.start, selected_case.end, selected_case.case_id) : "No Selection"}
                        />
                    </CaseSelect>
                </div>
                <h3>Diagnose</h3>
                <DiagnosisRow
                    diag_name_admission={diag.admission.name}
                    diag_code_admission={diag.admission.code}
                    diag_name_discharge={diag.discharge.name}
                    diag_code_discharge={diag.discharge.code}
                />
                <h3>Polysomnographie Befunde</h3>
                <div className={`details-view__label-selection-element`}>
                    <Label text="Befund"/>
                    <ProcSelect
                        items={proc_list}
                        itemRenderer={renderProc}   /** renderCase: determines, how the case entry is displayed in the Selection List */
                        onItemSelect={handleProcSelect}
                        filterable={false}
                    >
                        <Button 
                            rightIcon="caret-down"
                            text={selected_proc ? "( " + selected_proc.proc_id + " )" : "No Selection"}
                        />
                    </ProcSelect>
                </div>
                {
                    polyDataIsLoading() ? (
                        null
                    ) : (
                        <PolySomnoView observations={poly_somno_data}/>
                    )
                }
            </div>
        </div>
    )
}

interface LabelProps {
    text: string
}

interface SelectedProps {
    cases: ICase[]
}

interface DetailProps {
    encounters: Encounter[],
    procedures: Procedure[],
    conditionMap: Map<string, Condition[]>,
    observationMap: Map<string, Observation[]>,
}
