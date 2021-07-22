import { Classes } from '@blueprintjs/core';
import { Condition, Encounter, Patient } from 'fhir/r4';
import './index.scss';
import { getResourcePath, arrayMax, calculateAge, levenshteinDistance, transformIntoGenderSymbol } from 'utils/index';
import { useHistory } from 'react-router-dom';

interface PatientTableProps {
    patients: Patient[]
    conditionMap: Map<string, Condition[]>
    encounterMap: Map<string, Encounter[]>
}

const EMPTY_CELL_STR = '---';

//TODO: Check if expression has right sign
const sortCriterion = (crit: 'start'|'end') => (e1: Encounter, e2: Encounter) => Date.parse(e1.period?.[crit]??'')-Date.parse(e2.period?.[crit]??''); 

const toBirtdateAgeStr = (birthday?: string) => {
    if(birthday){

        const date = new Date(birthday)
        return `${date.toLocaleDateString('de')} (${calculateAge(date)})`
    } else 
        return undefined
}

export const PatientTable = (props: PatientTableProps) => {

    const history = useHistory();

    return (
        <div className="PatientTable-container">
            <table className="PatientTable-table">
                <thead>
                    <tr>
                        <th>Patienten ID</th>
                        <th>Nachname</th>
                        <th>Vorname</th>
                        <th>Geschlecht</th>
                        <th>Geburtstag (+Alter)</th>
                        <th>Letzte Diagnose</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.patients.length > 0 ?
                        props.patients.map((patient, idx) => {
                            const activeEncounters = props.encounterMap.get(getResourcePath(patient)??'')
                                ?.filter(enc => enc.status === 'in-progress') ?? [];


                            let isActive = false;
                            let mostRecentEncounter: Encounter|undefined;
                            if(activeEncounters.length > 1) {
                                console.warn(`Patient ${patient.id} has multiple active cases!`)
                                mostRecentEncounter = arrayMax(activeEncounters, sortCriterion('start'));
                                isActive = true;
                            } else if(activeEncounters.length == 1) {
                                mostRecentEncounter = activeEncounters[0];
                                isActive = true;
                            } else if(activeEncounters.length == 0) {
                                mostRecentEncounter = arrayMax(props.encounterMap.get(getResourcePath(patient)??'')??[], sortCriterion('end'));
                                isActive = false;
                            }

                            const conditions = mostRecentEncounter ? props.conditionMap.get(getResourcePath(mostRecentEncounter)??'') : undefined;
                            let mostRecentCondition = conditions?.find(cond => cond.note?.[0].text === 'discharge') ??
                                conditions?.find(cond => cond.note?.[0].text === 'admission');


                            return(
                                <tr key={idx} onClick={()=>history.push(`/patient/${patient.id}`, patient.id)}>
                                    <td>{patient.identifier?.[0].value ?? EMPTY_CELL_STR}</td>
                                    <td>{patient.name?.[0].family ?? EMPTY_CELL_STR}</td>
                                    <td>{patient.name?.[0].given?.join(' ') ?? EMPTY_CELL_STR}</td>
                                    <td>{transformIntoGenderSymbol(patient.gender) ?? EMPTY_CELL_STR}</td>
                                    <td>{toBirtdateAgeStr(patient.birthDate) ?? EMPTY_CELL_STR}</td>
                                    <td>{mostRecentCondition?.code?.coding?.[0].display ?? EMPTY_CELL_STR}</td>
                                    <td>{isActive ? 'aktiv' : 'inaktiv'}</td>
                                </tr>
                            )}) :
                        (
                            <tr>
                                <td> {EMPTY_CELL_STR} </td>
                                <td> {EMPTY_CELL_STR} </td>
                                <td> {EMPTY_CELL_STR} </td>
                                <td> {EMPTY_CELL_STR} </td>
                                <td> {EMPTY_CELL_STR} </td>
                                <td> {EMPTY_CELL_STR} </td>
                                <td> {EMPTY_CELL_STR} </td>
                                {/* <td> <div className={Classes.SKELETON}>---</div> </td> */}
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}