import React, { useContext } from 'react';
import { Router } from "@reach/router";
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import MainPage from './MainPage.jsx'
import { UserContext } from "./UserProvider";

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
