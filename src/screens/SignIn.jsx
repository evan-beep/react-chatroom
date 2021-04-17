import React, { useState } from "react";
import { Link } from "@reach/router";
import { auth, signInWithGoogle } from '../firebase';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signInWithEmailAndPasswordHandler =
    (event, email, password) => {
      event.preventDefault();
      auth.signInWithEmailAndPassword(email, password).then(

      ).catch(err => {
        alert(err.message);
      })
    };

  const onChangeHandler = (event) => {
    const { name, value } = event.currentTarget;

    if (name === 'userEmail') {
      setEmail(value);
    }
    else if (name === 'userPassword') {
      setPassword(value);
    }
  };

  return (
    <div className="base">
      <h1>Sign In</h1>
      <div>
        <form className="signForm" style={{ justifyContent: "space-between" }}>
          <label htmlFor="userEmail" className="formLabel">
            Email:
          </label>
          <input
            className="formInput"
            type="email"
            name="userEmail"
            value={email}
            placeholder="Your email"
            id="userEmail"
            onChange={(event) => onChangeHandler(event)}
          />
          <label htmlFor="userPassword" className="formLabel">
            Password:
          </label>
          <input
            className="formInput"
            type="password"
            name="userPassword"
            value={password}
            placeholder="Your Password"
            id="userPassword"
            onChange={(event) => onChangeHandler(event)}
          />
          <button onClick={(event) => { signInWithEmailAndPasswordHandler(event, email, password) }}>
            Sign in
          </button>
        </form>
        <p>or</p>
        <button onClick={signInWithGoogle}>
          Sign in with Google
        </button>
        <p>
          Don't have an account?{" "}
          <Link to="signUp">
            Sign up here
          </Link>{" "}
          <br />{" "}
          <Link to="passwordReset">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
};
export default SignIn;