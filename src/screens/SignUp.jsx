import React, { useState } from "react";
import { Link } from "@reach/router";
import { signInWithGoogle, auth } from '../firebase';

async function createUser(e, p) {
  await auth.createUserWithEmailAndPassword(e, p);
  console.log('done');
}

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const createUserWithEmailAndPasswordHandler = (event, email, password) => {
    event.preventDefault();
    try {
      createUser(email, password);
    } catch (err) {
      console.log(err.message);
    }
    setEmail("");
    setPassword("");
    setDisplayName("");
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
    <div>
      <h1>Sign Up</h1>
      <div>
        <form>
          <label>
            Display Name:
          </label>
          <input
            type="text"
            name="displayName"
            value={displayName}
            placeholder="Display Name"
            id="displayName"
            onChange={event => onChangeHandler(event)}
          />
          <label>
            Email:
          </label>
          <input
            type="email"
            name="userEmail"
            value={email}
            placeholder="Your email"
            id="userEmail"
            onChange={event => onChangeHandler(event)}
          />
          <label>
            Password:
          </label>
          <input
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