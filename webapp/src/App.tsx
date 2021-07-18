import React from 'react';
import './App.css';
import { ThemeContext } from './contexts/theme';
import { Login } from './views/Login';
import { AppNavbar } from './components/AppNavbar';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PatientOverview } from './views/PatientOverview';
import { PatientView } from './views/PatientView';


function App() {
  const {state} = React.useContext(ThemeContext)

  return (
    <Router>
      <div className={state.isDarkTheme ? "bp3-dark" : ""}>
        <div className="App">
          <AppNavbar />
          <div className="App-view-container">
            <div className="App-view-background"/>
            <div className="App-view-content-container">
              <Switch>
                <Route path='/' exact component={Login} />
                <Route path='/patient_overview' component={PatientOverview} />
                <Route path='/patient/:id' component={PatientView} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
