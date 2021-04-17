import React, { useContext, useState } from "react";
import { UserContext } from "../providers/UserProvider";
import firebase, { auth, firestore } from "../firebase";
import '../styles/index.sass'

const MainPage = () => {
  const user = useContext(UserContext);
  const { photoURL, displayName, email } = user;
  const [chat, setChat] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [message, setMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [msgs, setMsgs] = useState([]);

  const updateChat = (rID) => {

    let roomHistory = firestore.collection("chatrooms").doc(rID).collection('messages').orderBy('timestamp');
    let unsubscribe = roomHistory.onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        var message = change.doc.data();
        if (message.timestamp !== null && message.timestamp) {
          displayMessage(message.timestamp, message.name, message.text);
        }
        if (message.timestamp === null && message.text === 'exit') {
          unsubscribe();
        }
      });
    });
    firestore.collection("chatrooms").doc(rID).get().then(
      doc => {
        setRoomName(doc.data().name);
      }
    )
  }

  function getUserName() {
    return auth.currentUser.displayName;
  }

  async function getRoomName() {
    return await firestore.collection('chatrooms').doc(roomID).data().name;
  }
  function getUserEmail() {
    return auth.currentUser.email;
  }
  function htmlEnc(s) {
    return s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&#34;');
  }

  function sendMessage() {
    firestore.collection('chatrooms').doc(roomID).collection('messages').add({
      name: getUserName(),
      text: htmlEnc(message),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      id: getUserEmail()
    }
    )
    document.getElementById('message').value = '';
  }

  function displayMessage(time, name, text) {
    let msg = document.createElement('div');
    msg.innerHTML = time.toDate().toString() + name + text;
    document.getElementById('textBox').appendChild(msg);
  }

  function enterRoom() {
    updateChat(roomID);
    setChat(true);
  }

  function createRoom() {
    firestore.collection('chatrooms').add({
      name: getUserName() + "'s room"
    }).then(async ref => {
      console.log(ref.id);
      setRoomID(ref.id);
      await firestore.collection('chatrooms').doc(ref.id).collection('messages').add(
        {
          name: getUserName(),
          text: 'created room',
          timestamp: null,
          id: getUserEmail()
        }
      )
    }
    )
  }

  async function leaveRoom() {
    let space = firestore.collection('chatrooms').doc(roomID).collection('messages').doc(getUserEmail() + 'logout');
    space.set({
      name: getUserName(),
      text: 'exit',
      timestamp: null,
      id: getUserEmail()
    })
    await space.delete();
    document.getElementById('textBox').innerHTML = '';
    setMessage('');
    setRoomID('');
    setChat(false);
  }
  return (
    chat ?
      <div className="base">
        <h1 id='textBoxTitle'>{roomName} id: {roomID}</h1>
        <div id="textBox">

        </div>

        <input
          type="string"
          value={message}
          placeholder="Enter Message"
          id="message"
          onChange={(event) => setMessage(event.currentTarget.value)}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={leaveRoom}>Leave Room</button>
      </div>
      : <div className="base">
        <div>
          <h1 className="pageName">
            Profile Page
          </h1>

          <h2>{displayName} <button>Edit</button></h2>

          <h3>{email}</h3>
        </div>
        <div className="">
          <input
            type="string"
            value={roomID}
            placeholder="Enter Room ID"
            id="roomID"
            onChange={(event) => setRoomID(event.currentTarget.value)}
          />
          <button onClick={enterRoom}>Enter Room</button>
        </div>
        <button onClick={createRoom}> Create Room</button>
        <button onClick={() => { auth.signOut() }}>Sign out</button>

      </div>
  )
};
export default MainPage;