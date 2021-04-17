import firebase from 'firebase'

import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyCqiCfqZUMFtx9gqn2w0wreU4LtinxXad8",
  authDomain: "chatroom-99f4d.firebaseapp.com",
  databaseURL: "https://chatroom-99f4d-default-rtdb.firebaseio.com",
  projectId: "chatroom-99f4d",
  storageBucket: "chatroom-99f4d.appspot.com",
  messagingSenderId: "377396754679",
  appId: "1:377396754679:web:622bfb95d8b72416003bf2",
  measurementId: "G-XCN9NQ1CKG"

};

firebase.initializeApp(config);
const provider = new firebase.auth.GoogleAuthProvider();

export default firebase;
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export function signInWithGoogle() {
  console.log('trying...');
  auth.signInWithPopup(provider);
};

