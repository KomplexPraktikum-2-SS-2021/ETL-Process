import React from 'react';
import './App.css';
import { ThemeContext } from './contexts/theme';
import { Login } from './views/Login';
import { AppNavbar } from './components/AppNavbar';
 

function App() {
  const {state} = React.useContext(ThemeContext)

  return (
    <div className={state.isDarkTheme ? "bp3-dark" : ""}>
      <div className="App">
        <AppNavbar />
        <div className="App-view-container">
          {/* TODO: Do routing here */}
          <Login /> 
        </div>
      </div>
    </div>
  );
}

export default App;
