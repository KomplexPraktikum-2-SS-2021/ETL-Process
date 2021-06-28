import React from 'react';
import './App.css';
import { ThemeContext } from './contexts/theme';
import { Login } from './views/Login';
import { AppNavbar } from './components/AppNavbar';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PatientOverview } from './views/PatientOverview';
 

function App() {
  const {state} = React.useContext(ThemeContext)

  return (
    <Router>
      <div className={state.isDarkTheme ? "bp3-dark" : ""}>
        <div className="App">
          <AppNavbar />
          <div className="App-view-container">
            <Switch>
              <Route path='/' exact component={Login} />
              <Route path='/patient_overview' component={PatientOverview} />
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
