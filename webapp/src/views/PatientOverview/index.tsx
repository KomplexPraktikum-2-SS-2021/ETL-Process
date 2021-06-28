import React, { useState } from "react";
import { FormGroup, InputGroup, Intent, Spinner } from '@blueprintjs/core';
import { Button, Card, Elevation, Text } from "@blueprintjs/core";
import './index.css';
import FHIR from 'fhirclient';
import { oauth2 as SMART } from "fhirclient";

async function getData() {
    console.log('hi')
    const client = await SMART.ready()
    const patient = await client.request('Patient/')
    console.log(patient)
    return patient.entry
}

export const PatientOverview = () => {
   const [state, setState] = useState({patients: [] as any[], loading: true})

    return (
        <div className="PatientOverview-container">
            {/* {state.loading ? <Spinner/> : null} */}
            <Button
                intent={Intent.PRIMARY}
                onClick={async () => {
                    setState({loading: true, patients: state.patients})
                    setState({patients: await getData(), loading: false})
                
                }}>
                
                Submit
            </Button>
            {
                state.patients.map((patient, idx) => (
                        <Card elevation={Elevation.TWO} className="PatientOverview-patient-card">
                            <Text key={idx}>{patient.resource.name[0].family}</Text>
                        </Card>
                ))
            }

        </div>
    )
}