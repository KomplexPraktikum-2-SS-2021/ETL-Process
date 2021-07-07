import { useEffect, useState } from "react";
import { FormGroup, InputGroup, ControlGroup, Switch, Tooltip, Classes, Position } from '@blueprintjs/core';
import './index.css';
import { oauth2 as SMART } from "fhirclient";
import { PatientTable } from 'components/PatientTable'
import { Patient, Bundle, Condition } from 'fhir/r4';
import { Tooltip2 } from '@blueprintjs/popover2';
import { DefaultMap } from 'utils/index'


/**
 * This method fetches the fhir data needed to display the patient overview.
 * It returns an tuple of (1) The list of all patients (2) a map relating a patient (by id) to all his diagnoses
 */
async function getData(): Promise<[Patient[], Map<string, Condition[]>]> {
    const client = await SMART.ready();
    const bundle: Bundle = await client.request('Patient/?_revinclude=Condition:subject');
    console.debug(bundle);
    const bundle_resources = (bundle.entry?.map(entry => entry.resource)) ?? []; // defaulting to empty list if no entry is available

    // Filter results
    const patients = bundle_resources.filter(res => res?.resourceType == 'Patient') as Patient[];
    const conditions = bundle_resources.filter(res => res?.resourceType == 'Condition') as Condition[];

    const conditionMap = new DefaultMap<string, Condition[]>(() => []);
    
    conditions.forEach(cond => {
        const ref = cond.subject.reference;
        if(ref === undefined) return;

        conditionMap.get(ref).push(cond);
    })

    console.debug('conditionMap', conditionMap);

    return [patients, conditionMap];
}

export const PatientOverview = () => {
   const [state, setState] = useState({
       onlyActive: true,
       patients: [] as Patient[],
       conditions: new Map<string, Condition[]>(),
       loading: true
    })

    useEffect(() => {
        if(state.loading) {
            getData().then(([patients, conditions]) => setState({...state, patients, conditions, loading: false}))
        } 
    }, [state.loading])

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
                    {/* <Button icon="filter">Filter</Button> */}
                </ControlGroup>
                <Switch 
                    checked={state.onlyActive}
                    onChange={event => {setState({...state, onlyActive: !state.onlyActive, loading: true})}}
                    labelElement={(
                    <div>Only show <Tooltip2
                        className={Classes.TOOLTIP_INDICATOR}
                        position={Position.RIGHT}
                        content={<span>BRRAAAIINS</span>}>
                        active patients
                        </Tooltip2>
                    </div>)} />
                {/* <Button
                    intent={Intent.PRIMARY}
                    onClick={async () => {
                        setState({loading: true, patients: state.patients})
                        setState({patients: await getData(), loading: false})
                    
                    }}>
                    Submit
            </Button> */}
            </FormGroup>
            <PatientTable patients={state.patients}/>
            
        </div>
    )
}