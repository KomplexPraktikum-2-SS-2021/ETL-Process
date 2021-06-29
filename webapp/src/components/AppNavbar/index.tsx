import React from 'react';
import { Alignment, Button, Navbar } from "@blueprintjs/core";
import { ThemeContext } from '../../contexts/theme';
import { useHistory } from "react-router-dom";
import './index.css'

export const AppNavbar = () => {
    const {state, dispatch} = React.useContext(ThemeContext) 
    const history = useHistory();
    
    return (
        <Navbar >
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading
                    onClick={()=>history.push('/')}
                    className="AppNavbar-logo">
                    SomnoSearch
                </Navbar.Heading>
                <Navbar.Divider />
                <Button className="bp3-minimal" icon="home" text="Home" />
                <Button className="bp3-minimal" icon="person" text="Profile" />
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
                <Button minimal icon={state.isDarkTheme ? 'flash' : 'moon'} onClick={() => dispatch({type: 'TOGGLE_THEME'})} />
            </Navbar.Group>
        </Navbar>
    )
}