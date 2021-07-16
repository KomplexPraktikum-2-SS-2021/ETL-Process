import { FormGroup, InputGroup, Intent, Toaster } from '@blueprintjs/core';
import { Button, Card, Elevation } from "@blueprintjs/core";
import './index.css';
import { oauth2 as SMART } from "fhirclient";
import { useState } from 'react';


async function FHIRStuff(url: string) {
    // Add error message on failing authorization
    try{
        await SMART.authorize({
            clientId: "my-client-id",
            scope: "launch launch/patient patient/read offline_access",
            redirectUri: "/patient_overview",
            iss: url,
      
            // WARNING: completeInTarget=true is needed to make this work
            // in the codesandbox frame. It is otherwise not needed if the
            // target is not another frame or window but since the entire
            // example works in a frame here, it gets confused without
            // setting this!
            completeInTarget: true
        });
    } catch {
        const toaster = Toaster.create({});    
        toaster.show({
            message: 'Could not connect to server!',
            intent: Intent.DANGER,
            icon: 'warning-sign',
            timeout: 5000
        })
    }
  
    // const patient = await client.patient.read()
    // console.log(patient)
  }


export const Login = () => {
    const [state, setState] = useState({sourceURL: 'http://localhost:8080/fhir'})


    return (
        <div className="Login-card-container">
            <Card interactive={true} elevation={Elevation.TWO}>
                <FormGroup
                    // helperText="Helper text with details..."
                    label="Enter Data Source"
                    labelFor="text-input"
                    // labelInfo="(required)"
                >
                    <InputGroup id="text-input" placeholder="Server URL..." value={state.sourceURL} onChange={evnt => setState({sourceURL: evnt.target.value})}/>
                    <Button
                        intent={Intent.PRIMARY}
                        onClick={() => {
                            FHIRStuff(state.sourceURL);
                           
                        }}>
                        
                        Submit
                    </Button>
                </FormGroup>
            </Card>
        </div>
    )
}