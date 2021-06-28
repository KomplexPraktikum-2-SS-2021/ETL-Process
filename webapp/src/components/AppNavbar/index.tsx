import React from 'react';
import { Alignment, Button, Intent, Navbar, Spinner } from "@blueprintjs/core";
import { ThemeContext } from '../../contexts/theme';
 

export const AppNavbar = () => {
    const {state, dispatch} = React.useContext(ThemeContext) 
    
    return (
        <Navbar >
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading style={{fontSize: 24, fontFamily: 'PoiretOne-Regular'}}>SomnoSearch</Navbar.Heading>
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