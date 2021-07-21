import React, { useEffect, useState } from 'react';
import { Alignment, Button, Navbar } from "@blueprintjs/core";
import { ThemeContext } from 'contexts/theme';
import { useHistory } from "react-router-dom";
import { oauth2 as SMART } from "fhirclient";
import './index.css'

async function getServerURL() {
    try {
        const client = await SMART.ready();
        return client.state.serverUrl;
    } catch {
        return null
    }
}

export const AppNavbar = () => {
    const [urlState, setUrl] = useState({serverUrl: null as string|null})
    const {state, dispatch} = React.useContext(ThemeContext) 
    const history = useHistory();

    useEffect(() => {
        getServerURL().then(url => setUrl({serverUrl: url}))
    }, [])
    // console.log(client.state)
    
    return (
        <Navbar >
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading
                    onClick={()=>history.push( urlState.serverUrl !== null ? '/patient_overview' : '/')}
                    className="AppNavbar-logo">
                    SomnoSearch
                </Navbar.Heading>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>

            <Navbar.Heading>
                    {
                        urlState.serverUrl !== null ?
                        <>
                            <b>{'Aktuell verbunden mit: '}</b>
                            {urlState.serverUrl}
                            <Button text="Ausloggen" minimal intent="warning" onClick={() => {window.sessionStorage.removeItem('SMART_KEY');setUrl({serverUrl: null}); history.push('/')}} />
                        </> 
                        : null
                    }
                    </Navbar.Heading>

                <Button minimal icon={state.isDarkTheme ? 'flash' : 'moon'} onClick={() => dispatch({type: 'TOGGLE_THEME'})} />
            </Navbar.Group>
        </Navbar>
    )
}