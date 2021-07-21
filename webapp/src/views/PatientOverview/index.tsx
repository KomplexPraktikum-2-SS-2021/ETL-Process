import { useEffect, useState } from "react";
import { FormGroup, InputGroup, ControlGroup, Switch, Tooltip, Classes, Position, Button, Icon, Spinner } from '@blueprintjs/core';
import './index.css';
import { oauth2 as SMART } from "fhirclient";
import { PatientTable } from 'components/PatientTable'
import { Patient, Bundle, Condition, Encounter } from 'fhir/r4';
import { Tooltip2 } from '@blueprintjs/popover2';
import { binaryChainReferenceMaps, constructReferenceMap, DefaultMap } from 'utils/index'


/**
 * This method fetches the fhir data needed to display the patient overview.
 * It returns an tuple of (1) The list of all patients (2) a map relating a patient (by id) to all his diagnoses
 */
async function getData(onlyActive: boolean, patientIdSearch: string, lastName: string): Promise<[Patient[], Map<string, Condition[]>, Map<string,Encounter[]>]> {

    const onlyActiveQuery = onlyActive ? '_has:Encounter:subject:status=in-progress' : ''
    const client = await SMART.ready();
    const bundle: Bundle = await client.request(`Patient/?${onlyActiveQuery}&_revinclude=Encounter:subject&_revinclude:iterate=Condition:encounter`);
    console.debug(bundle);
    const bundle_resources = (bundle.entry?.map(entry => entry.resource)) ?? []; // defaulting to empty list if no entry is available

    // Filter results
    let patients = bundle_resources.filter(res => res?.resourceType == 'Patient') as Patient[];
    patients = patients.filter(pat => pat.identifier?.[0].value?.startsWith(patientIdSearch));
    patients = patients.filter(pat => pat.name?.[0].family?.startsWith(lastName));

    const conditions = bundle_resources.filter(res => res?.resourceType == 'Condition') as Condition[];
    const encounters = bundle_resources.filter(res => res?.resourceType == 'Encounter') as Encounter[];
    
    const conditionMap = constructReferenceMap(conditions, 'encounter');
    const encounterMap = constructReferenceMap(encounters, 'subject');

    console.debug('encounterMap', encounterMap)
    console.debug('conditionMap', conditionMap);
    console.debug('patient2condition', binaryChainReferenceMaps(encounterMap, conditionMap))

    return [patients, conditionMap, encounterMap];
}

enum LOAD_STATE {
    firstLoad,
    loading,
    finished
}

export const PatientOverview = () => {
   const [state, setState] = useState({
        patientIdSearch: '',
        lastName: '',
        firstName: '',
        onlyActive: true,

        patients: [] as Patient[],
        conditions: new Map<string, Condition[]>(),
        encounterMap: new Map<string, Encounter[]>(),
        loading: LOAD_STATE.firstLoad
    })

    useEffect(() => {
        if(state.loading !== LOAD_STATE.finished) {
            getData(state.onlyActive, state.patientIdSearch, state.lastName)
            .then(([patients, conditions, encounterMap]) => setState({...state, patients, conditions, encounterMap, loading: LOAD_STATE.finished}))
        } 
    }, [state.loading])

    useEffect(() => {
        if(state.loading !== LOAD_STATE.firstLoad) {
            const delayDebounceFn = setTimeout(() => {
            //   console.log(state.patientIdSearch)
              setState({...state, loading: LOAD_STATE.loading})
              // Send Axios request here
            }, 400)
        
            return () => clearTimeout(delayDebounceFn)
        }}, [state.patientIdSearch, state.lastName])

    return (
        <div className="PatientOverview-container">
            <h1>Patientenübersicht</h1>
            <FormGroup
                // helperText="Helper text with details..."
                labelFor="text-input"
                // labelInfo="(required)"
            >
                <ControlGroup fill={true} vertical={false}>
                    <InputGroup placeholder="Patienten ID..." onChange={event => setState({...state, patientIdSearch: event.target.value})}/>
                    <InputGroup placeholder="Nachname..." onChange={event => setState({...state, lastName: event.target.value})}/>
                    <InputGroup placeholder="Vorname..." />
                    {/* <Button icon="search"></Button> */}
                </ControlGroup>
                <Switch 
                    checked={state.onlyActive}
                    onChange={event => {setState({...state, onlyActive: !state.onlyActive, loading: LOAD_STATE.loading})}}
                    labelElement={(<>Nur <Tooltip
                        className={Classes.TOOLTIP_INDICATOR}
                        position={Position.RIGHT}
                        content={<span>Aktive Patienten sind jene Patienten, <br/> deren letzter Behandlungsfall nicht abgeschlossen ist</span>}>
                        aktive Patienten
                        </Tooltip></>)}
                />
                {/* <Button
                    intent={Intent.PRIMARY}
                    onClick={async () => {
                        setState({loading: true, patients: state.patients})
                        setState({patients: await getData(), loading: false})
                    
                    }}>
                    Submit
            </Button> */}
            </FormGroup>
            {
                state.loading === LOAD_STATE.firstLoad ?
                <>...</> :
                state.patients.length > 0 ? 
                <span>Es wurden {state.patients.length} Patienten gefunden <Icon icon="tick" intent="success"></Icon></span> :
                <span>Es wurden keine Patienten gefunden <Icon icon="cross" intent="danger"></Icon></span>
            }
            {/* {state.loading ? <Spinner/> : <></> } */}
            <PatientTable patients={state.patients} conditionMap={state.conditions} encounterMap={state.encounterMap}/>
            
        </div>
    )
}