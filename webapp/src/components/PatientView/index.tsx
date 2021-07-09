import { useState } from 'react'
import React from 'react'
import { useParams } from "react-router-dom";
import './index.css';

const DataCol = (props: ColProps) => {
    const {elements} = props;

    return ( 
        <div className={`patient-view-administrative-col`}>
            {elements.map((element, i) => {
                return (<div>{element}</div>)
            })}
        </div>
    )
}

const TableRow = (props: RowProps) => {
    let {attrib_name1, attrib_name2, attrib_value1, attrib_value2} = props;

    return (
        <tr className={`border-less-tr`}>
            <td className={`attrib-title border-less-td`}>{attrib_name1}</td>
            <td className={`border-less-td`}>{attrib_value1}</td>
            <td className={`attrib-title border-less-td`}>{attrib_name2}</td>
            <td className={`border-less-td`}>{attrib_value2}</td>
        </tr>

    )
}

/*
export const PatientView = () => {
    const { id }: Params = useParams();

    const patient_object = {name: "Olaf", forename:"Olaf1", gender: "male", birthdate: "01.02.1997", address: "01069 Dresden Nürnberger Straße 14"}

    return (
        <div className={`patient-view-container`}>
            <div className={`patient-view`}>
                <h1>Patients View</h1>
                <div className={`patient-view-administrative-container`}>
                    <h2>Allgemeine Informationen</h2>
                    <div className={`patient-view-administrative-container`}>
                        <DataCol elements={["Name", "Geburtsdatum", "Wohnadresse"]} />
                        <DataCol elements={[patient_object.name, patient_object.birthdate, patient_object.address]} />
                        <DataCol elements={["Vorname", "Geschlecht"]} />
                        <DataCol elements={[patient_object.forename, patient_object.gender]} />
                    </div>
                </div>
            </div>
        </div>
    )
}*/

export const PatientView = () => {
    const { id }: Params = useParams();

    const patient_object = {name: "Olaf", forename:"Olaf1", gender: "male", birthdate: "01.02.1997", address: "01069 Dresden Nürnberger Straße 14"}

    return (
        <div className={`patient-view-container`}>
            <div className={`patient-view`}>
                <h1>Patients View</h1>
                <div className={`patient-view-administrative-container`}>
                    <div>
                        <h2>Allgemeine Informationen</h2>
                    </div>
                    <table className={`patient-view-table-style`}>
                        <TableRow attrib_name1={"Name"} attrib_name2={"Vorname"} attrib_value1={patient_object.name} attrib_value2={patient_object.forename} />
                        <TableRow attrib_name1={"Geburtsdatum"} attrib_name2={"Geschlecht"} attrib_value1={patient_object.birthdate} attrib_value2={patient_object.gender} />
                        <TableRow attrib_name1={"Wohnadresse"} attrib_value1={patient_object.address} />
                    </table>
                </div>
            </div>
        </div>
    )
}

const DetailsView = () => {

}

const ProgressView = () => {

}

interface Params {
    [id: string]: any
}

interface ColProps {
    elements: string[]
}

interface RowProps {
    attrib_name1: string,
    attrib_value1: string,
    attrib_name2?: string,
    attrib_value2?: string
}