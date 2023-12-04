// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './HomePage';
import Login from './login';
import Signup from './signup';
import MainPage from './MainPage'; // Ensure this is the correct path to your MainPage.js
import VerifiedMainPage from './verifiedMainPage'; 
import Lists from './lists'; // Typically component names are capitalized
import DemoLists from './DemoLists';
import UpdatePassword from './updatePassword';
import adminDashboard from './adminDashboard';
import privacy from './Privacy';


function App() {

  return (
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/MainPage" component={MainPage} />
          <Route path="/verifiedMainPage" component={VerifiedMainPage} />
          <Route path="/lists" component={Lists} />
          <Route path="/DemoLists" component={DemoLists} />
          <Route path="/updatePassword" component={UpdatePassword} />
          <Route path="/adminDashboard" component={adminDashboard} />
          <Route path="/privacy" component={privacy} />

        </Switch>
      </Router>
  );
}

export default App;
