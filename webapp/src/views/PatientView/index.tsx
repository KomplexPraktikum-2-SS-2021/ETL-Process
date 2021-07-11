import {AdminView} from '../../components/AdminView'
import './index.css';
import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { Bundle, Patient } from 'fhir/r4';
import { oauth2 as SMART } from "fhirclient";

async function getPatientData(id: string): Promise<[Patient]> {
    const client = await SMART.ready();
    //const bundle: Bundle = await client.request('Patient/?_id=' + id + '&_count=1');
    const bundle: Bundle = await client.request('Patient/?_revinclude=Condition:subject');
    const bundle_resources = (bundle.entry?.map(entry => entry.resource)) ?? [];

    // Filter results
    const checkPatientId = (res: Patient) => {
        if(res.identifier) {
            if (res.identifier[0].value === id) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    const patient_list = bundle_resources.filter(res => (res?.resourceType === 'Patient' && checkPatientId(res))) as Patient[];
    const patient = patient_list[0];

    return [patient]
}

export const PatientView = () => {
    const { id }: Params = useParams();
    const [state, setState] = useState({
        patient: {} as Patient,
        loading: true
    });

    // Get the patient from the server
    useEffect(() => {
        getPatientData(id).then(([patient_admin_data]) => setState({...state, patient: patient_admin_data, loading: false}))
    }, []);

    if (state.loading === true) {
        return (<div>...is loading</div>)
    } else {
        return (
            <div className={`patient-view-container`}>
                <div className={`patient-view`}>
                    <h1>Patients View</h1>
                    <AdminView 
                        patient={state.patient}
                    />
                </div>
            </div>
        )
    }
}

interface Params {
    [id: string]: any
}

interface MyObject {
    data: Patient[]
}