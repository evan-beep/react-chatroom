import React, { useContext } from 'react';
import { Router } from "@reach/router";
import SignIn from './screens/SignIn.jsx'
import SignUp from './screens/SignUp.jsx'
import MainPage from './screens/MainPage.jsx'
import { UserContext } from "./providers/UserProvider";
function Application() {
  const user = useContext(UserContext);
  return (
    user ?
      <MainPage />
      :
      <Router>
        <SignUp path="signUp" />
        <SignIn path="/" />
      </Router>

  );
}

export default Application;
