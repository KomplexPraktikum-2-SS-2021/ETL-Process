import React, { useState } from "react";
import { Intent, Button, Card, Elevation, Text, FormGroup, InputGroup, ControlGroup, Switch, Tooltip, Classes, Position } from '@blueprintjs/core';
import './index.css';
import { oauth2 as SMART } from "fhirclient";
import { PatientTable } from '../../components/PatientTable'
import { Patient, Bundle } from 'fhir/r4';


async function getData() {
    console.log('hi')
    const client = await SMART.ready()
    const res: Bundle = await client.request('Patient/')
    console.log(res)
    const entries = res.entry
    const patients = (entries?.map(entry => entry.resource) || []) as Patient[]
    return patients 
}

export const PatientOverview = () => {
   const [state, setState] = useState({patients: [] as Patient[], loading: true})

    return (
        <div className="PatientOverview-container">
            {/* {state.loading ? <Spinner/> : null} */}
            <FormGroup
                // helperText="Helper text with details..."
                labelFor="text-input"
                // labelInfo="(required)"
            >
                <ControlGroup fill={true} vertical={false}>
                    <InputGroup placeholder="Find filters..." />
                    <Button icon="filter">Filter</Button>
                </ControlGroup>
                <Switch labelElement={(
                    <div>Only show <Tooltip
                        className={Classes.TOOLTIP_INDICATOR}
                        position={Position.RIGHT}
                        content={<span>BRRAAAIINS</span>}>
                        active patients
                        </Tooltip>
                    </div>)} />
                <Button
                    intent={Intent.PRIMARY}
                    onClick={async () => {
                        setState({loading: true, patients: state.patients})
                        setState({patients: await getData(), loading: false})
                    
                    }}>
                    Submit
            </Button>
            </FormGroup>
            <PatientTable patients={state.patients}/>
            
        </div>
    )
}