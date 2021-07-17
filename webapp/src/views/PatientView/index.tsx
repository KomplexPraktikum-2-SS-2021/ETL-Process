import {AdminView} from '../../components/AdminView'
import './index.css';
import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { Bundle, Condition, Encounter, Observation, Patient } from 'fhir/r4';
import { oauth2 as SMART } from "fhirclient";
import {Callout, Tab, Tabs} from '@blueprintjs/core'
import { DevelopmentTable } from 'components/DevelopmentTable';
import { constructReferenceMap } from 'utils';

async function getPatientData(id: string): Promise<PatientViewData> {
    const client = await SMART.ready();
    
    const patient: Patient = await client.request(`Patient/${id}`);
    console.debug(patient)

    const bundle: Bundle = await client.request(`http://localhost:8080/fhir/Encounter?subject=Patient/${id}&_revinclude=Condition:encounter&_revinclude=Observation:encounter`);
    const bundle_resources = (bundle.entry?.map(entry => entry.resource)) ?? []; // defaulting to empty list if no entry is available
    
    const conditions = bundle_resources.filter(res => res?.resourceType == 'Condition') as Condition[];
    const encounters = bundle_resources.filter(res => res?.resourceType == 'Encounter') as Encounter[];
    const observations = bundle_resources.filter(res => res?.resourceType == 'Observation') as Observation[];

    const conditionMap = constructReferenceMap(conditions, 'encounter');
    const observationMap = constructReferenceMap(observations, 'encounter');

    return {
        patient,
        encounters,
        conditionMap,
        observationMap
    }
}

type PatientViewData = {
    patient: Patient
    encounters: Encounter[],
    conditionMap: Map<string, Condition[]>,
    observationMap: Map<string, Observation[]>,
};


export const PatientView = () => {
    const { id }: Params = useParams();
    const [state, setState] = useState({
        data: null as PatientViewData|null, // In case of failing data fetching the data property should remain null, but the loading should be set to false.
        loading: true
    });

    // Get the patient from the server
    useEffect(() => {
        getPatientData(id)
            .then((patient_data) => setState({...state, data: patient_data, loading: false}))
            .catch( () => setState({...state, data: null, loading: false}))
    }, []);

        return (
            <div className="patient-view-container">
                {
                    state.loading ?
                        <></> : 
                    state.data === null ?
                        <div style={{height: 100, marginTop: 80}}>
                            <Callout intent="danger" title="Es ist ein Fehler aufgetreten!">
                                Bitte überprüfen sie Ihre eingaben oder versuchen sie es später erneut.
                            </Callout>
                        </div>
                         :
                        <div className="patient-view">
                            <h1>Patients View</h1>
                            <AdminView 
                                patient={state.data.patient}
                            />
                            <Tabs id="patient_view_selection" large={true} renderActiveTabPanelOnly={true} defaultSelectedTabId={"patient_view_details"} className={`patient-view-selection`}>
                                <Tab id="patient_view_details" title="Detailinformationen" panel={<div>Detailinformationen</div>}/>
                                <Tab id="patient_view_progress" title="Verlaufsinformationen" panel={<DevelopmentTable
                                        encounters={state.data.encounters}
                                        conditionMap={state.data.conditionMap}
                                        observationMap={state.data.observationMap}
                                    />}
                                />
                            </Tabs>
                        </div>

                }
                
            </div>
        )
}


interface Params {
    [id: string]: any
}