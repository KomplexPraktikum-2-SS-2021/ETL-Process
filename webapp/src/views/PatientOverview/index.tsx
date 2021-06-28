import React from "react";
import { FormGroup, InputGroup, Intent } from '@blueprintjs/core';
import { Button, Card, Elevation } from "@blueprintjs/core";
import './index.css';
import FHIR from 'fhirclient';


export const PatientOverview = () => {
    return (
        <div className="Login-card-container">
            <Card interactive={true} elevation={Elevation.TWO}>
            <FormGroup
                // helperText="Helper text with details..."
                label="Patient Overview"
                labelFor="text-input"
                // labelInfo="(required)"
            >
                <InputGroup id="text-input" placeholder="User name" />
                <InputGroup id="text-input" placeholder="Password" />
                <Button
                    intent={Intent.PRIMARY}
                    onClick={() => FHIR.oauth2.authorize({
                        'redirectUri': '#/foo',
                        'fhirServiceUrl': 'localhost:8080/foo',
                        "client_id": "foo",
                        "scope": "patient/*.read"
                      })}>
                    
                    Submit
                </Button>
            </FormGroup>
            </Card>
        </div>
    )
}