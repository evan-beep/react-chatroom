import React, { useState } from "react";
import { Link } from "@reach/router";
import { signInWithGoogle, auth } from '../firebase';

function createUser(e, p, n) {
  auth.createUserWithEmailAndPassword(e, p).then(
    function (result) {
      return result.user.updateProfile({
        displayName: n
      })
    }).catch(err => {
      alert(err.message);
    });
}

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const createUserWithEmailAndPasswordHandler = (event, email, password) => {
    event.preventDefault();
    try {
      createUser(email, password, displayName);
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (err) {
      console.log(err.message);
    }

  };
  const onChangeHandler = event => {
    const { name, value } = event.currentTarget;
    if (name === "userEmail") {
      setEmail(value);
    } else if (name === "userPassword") {
      setPassword(value);
    } else if (name === "displayName") {
      setDisplayName(value);
    }
  };
  return (
    <div className="base">
      <h1>Sign Up</h1>
      <div>
        <form className="signForm" style={{ justifyContent: "space-between" }}>
          <label className="formLabel">
            Display Name:
          </label>
          <input
            className="formInput"
            type="text"
            name="displayName"
            value={displayName}
            placeholder="Display Name"
            id="displayName"
            onChange={event => onChangeHandler(event)}
          />
          <label className="formLabel">
            Email:
          </label>
          <input
            className="formInput"
            type="email"
            name="userEmail"
            value={email}
            placeholder="Your email"
            id="userEmail"
            onChange={event => onChangeHandler(event)}
          />
          <label className="formLabel">
            Password:
          </label>
          <input
            className="formInput"
            type="password"
            name="userPassword"
            value={password}
            placeholder="Your Password"
            id="userPassword"
            onChange={event => onChangeHandler(event)}
          />
          <button
            onClick={event => {
              createUserWithEmailAndPasswordHandler(event, email, password);
            }}
          >
            Sign up
          </button>
        </form>
        <p>or</p>
        <button onClick={signInWithGoogle}>
          Sign In with Google
        </button>
        <p >
          Already have an account?{" "}
          <Link to="/" >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
export default SignUp;