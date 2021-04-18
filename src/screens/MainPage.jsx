import React, { useContext, useState } from "react";
import { UserContext } from "../providers/UserProvider";
import firebase, { auth, firestore } from "../firebase";
import '../styles/index.sass'
import ReactDOMServer from 'react-dom/server';
import icon from '../person.png';

const MainPage = () => {
  const user = useContext(UserContext);
  const { photoURL, displayName, email } = user;
  const [chat, setChat] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [message, setMessage] = useState('');
  const [roomName, setRoomName] = useState('');

  const updateChat = (rID) => {

    let roomHistory = firestore.collection("chatrooms").doc(rID).collection('messages').orderBy('timestamp');
    let unsubscribe = roomHistory.onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        var message = change.doc.data();
        if (message.timestamp !== null && message.timestamp) {
          displayMessage(message);
          var objDiv = document.getElementById("textBox");
          objDiv.scrollTop = objDiv.scrollHeight;
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

  function getUserEmail() {
    return auth.currentUser.email;
  }

  function getUserProfileImg() {
    return auth.currentUser.photoURL;
  }

  function sendMessage() {
    firestore.collection('chatrooms').doc(roomID).collection('messages').add({
      name: getUserName(),
      text: message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      id: getUserEmail(),
      ImgSrc: getUserProfileImg()
    }
    )
    document.getElementById('message').value = '';
  }


  function displayMessage(m) {
    let s = document.createElement('div');
    s.innerHTML = ReactDOMServer.renderToString(buildMsgBox(m));
    document.getElementById('textBox').appendChild(s);
  }

  function buildMsgBox(item) {
    return (
      item.id === getUserEmail() ?
        <div className="msgBox" style={{ justifyContent: 'flex-end' }}>


          <div className="msgText">
            <div className="profileName">{item.name}</div>
            <div className="msg" style={{ backgroundColor: '#a17100' }}>{item.text}</div>
          </div>
          <div className="profilePic">
            <img src={item.ImgSrc ? item.ImgSrc : icon} alt={item.name + "profpic"} className="profPic" />
          </div>

        </div>
        :
        <div className="msgBox" >

          <div className="profilePic">
            <img src={item.ImgSrc ? item.ImgSrc : icon} alt={item.name + "profpic"} className="profPic" />
          </div>
          <div className="msgText">
            <div className="profileName">{item.name}</div>
            <div className="msg" >{item.text}</div>
          </div>

        </div>
    )
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
          id: getUserEmail(),
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

  function changeName() {

  }

  async function copyRoomID() {
    await navigator.clipboard.writeText(roomID);
  }

  return (
    chat ?
      <div className="base">
        <div className='textBoxTitle'>
          <button className='textBoxTitleButton' onClick={leaveRoom}>Leave Room</button>
          <div className='textBoxTitleText'>{roomName}</div>
          {navigator.clipboard
            ? <button className="copyButton" onClick={copyRoomID}>Copy room ID</button>
            : <div ></div>}
        </div>
        <div className="textBox" id="textBox">

        </div>
        <div className="inputZone">
          <input
            type="string"
            value={message}
            placeholder="Enter Message"
            id="message"
            className="inputBar"
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
          <button onClick={sendMessage} className="inputButton">Send</button>
        </div>


      </div>
      : <div className="base">
        <div>
          <h2>{displayName} <button onClick={changeName()}>Edit</button></h2>
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