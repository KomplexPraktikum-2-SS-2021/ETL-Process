import React from "react";
import { FormGroup, InputGroup, Intent } from '@blueprintjs/core';
import { Button, Card, Elevation } from "@blueprintjs/core";
import './index.css';

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
                <Button intent={Intent.PRIMARY}>Submit</Button>
            </FormGroup>
            </Card>
        </div>
    )
}