import { Classes, Intent } from '@blueprintjs/core';
import { Patient, Bundle } from 'fhir/r4';
import './index.css';

interface PatientTableProps {
    patients: Patient[]
}

const EMPTY_CELL_STR = '---';

export const PatientTable = (props: PatientTableProps) => {
    return (
        <div className="PatientTable-container">
            <table className="PatientTable-table">
                <tr>
                    <th>Patient ID</th>
                    <th>Last Name</th>
                    <th>First Name</th>
                    <th>Gender</th>
                    <th>Birthdate (+Age)</th>
                    <th>Last diagnose</th>
                    <th>Last change</th>
                    <th>Status</th>
                </tr>
                {
                    props.patients.length > 0 ?
                    props.patients.map((patient, idx) => (
                        <tr key={idx}>
                            <td>{patient.identifier?.[0].value ?? EMPTY_CELL_STR}</td>
                            <td>{patient.name?.[0].family ?? EMPTY_CELL_STR}</td>
                            <td>{patient.name?.[0].given?.join(' ') ?? EMPTY_CELL_STR}</td>
                            <td>{patient.gender ?? EMPTY_CELL_STR}</td>
                            <td>{patient.birthDate ?? EMPTY_CELL_STR}</td>
                            <td>---</td>
                            <td>---</td>
                            <td>---</td>
                        </tr>
                    )) :
                    (
                        <tr>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            <td> <div className={Classes.SKELETON}>---</div> </td>
                            
                        </tr>
                    )
                }
            </table>
        </div>
    )
}