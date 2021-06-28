import { FormGroup, InputGroup, Intent } from '@blueprintjs/core';
import { Button, Card, Elevation } from "@blueprintjs/core";
import './index.css';
import { oauth2 as SMART } from "fhirclient";


async function FHIRStuff() {
    // Add error message on failing authorization
    await SMART.authorize({
        clientId: "my-client-id",
        scope: "launch launch/patient patient/read offline_access",
        redirectUri: "./patient_overview",
        iss: "http://localhost:8080/fhir",
  
        // WARNING: completeInTarget=true is needed to make this work
        // in the codesandbox frame. It is otherwise not needed if the
        // target is not another frame or window but since the entire
        // example works in a frame here, it gets confused without
        // setting this!
        completeInTarget: true
    });
  
    // const patient = await client.patient.read()
    // console.log(patient)
  }


export const Login = () => {
    return (
        <div className="Login-card-container">
            <Card interactive={true} elevation={Elevation.TWO}>
            <FormGroup
                // helperText="Helper text with details..."
                label="Login"
                labelFor="text-input"
                // labelInfo="(required)"
            >
                <InputGroup id="text-input" placeholder="User name" />
                <InputGroup id="text-input" placeholder="Password" />
                <Button
                    intent={Intent.PRIMARY}
                    onClick={() => FHIRStuff()}>
                    
                    Submit
                </Button>
            </FormGroup>
            </Card>
        </div>
    )
}