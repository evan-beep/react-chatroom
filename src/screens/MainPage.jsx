import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../providers/UserProvider";
import firebase, { auth, database, firestore } from "../firebase";
import '../styles/index.sass'
import ReactDOMServer from 'react-dom/server';
import icon from '../images/person.png';
import backIcon from '../images/backArrow.png'
import copy from '../images/copy.png'
import bell from '../images/bell.png'
import enter from '../images/enter.png'
import newRoom from '../images/newRoom.png'
import logout from '../images/logout.png'
import send from '../images/send.png'


const MainPage = () => {
  const user = useContext(UserContext);
  const { displayName, email } = user;
  const [chat, setChat] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [message, setMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [recRooms, setRecRooms] = useState([]);

  const d = new Date()

  const updateChat = (rID) => {

    let roomHistory = firestore.collection("chatrooms").doc(rID).collection('messages').orderBy('timestamp');
    let unsubscribe = roomHistory.onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        var message = change.doc.data();
        if (message.timestamp !== null && message.timestamp) {
          displayMessage(message);
          var objDiv = document.getElementById("textBox");
          objDiv.scrollTop = objDiv.scrollHeight;
          if (message.timestamp.seconds > d.getTime() / 1000 && message.name !== getUserName()) {
            let n = new Notification(message.name + ": " + message.text);
          }

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

  async function sendMessage() {
    await firestore.collection('chatrooms').doc(roomID).collection('messages').add({
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
    if (roomID === '') {
      alert("Please enter room ID");
      return;
    }
    updateChat(roomID);
    setRecentRooms();
    setChat(true);
  }

  function cheapEnterRoom(id) {
    if (id === '') {
      alert("Please enter room ID");
      return;
    }
    updateChat(id);
    cheapSetRecentRooms(id);
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
    document.getElementById('copyTXT').innerHTML = "(Copied to Clipboard)";
  }

  function InfoCard() {
    return (
      <div className="infoCard">
        <h1>Your Profile</h1>
        <img className="profIMG pseudoButton" src={auth.currentUser.photoURL ? auth.currentUser.photoURL : icon} alt="user profile" />
        <h2>{displayName} <button className="pseudoButton" onClick={changeName()}>Edit</button></h2>
        <h3>{email}</h3>

        <img className="enterButton pseudoButton" src={logout} alt="Logout" onClick={() => { auth.signOut() }} />

      </div>
    )
  }

  function setRecentRooms() {
    let obj = database.ref().child('users').child(auth.currentUser.uid)
    obj.get().then(
      (ss) => {
        if (ss.val() !== null) {
          console.log(ss.val());

          let idss = ss.val().ids;
          for (var i = idss.length - 1; i >= 0; i--) {
            if (idss[i] === roomID) {
              idss.splice(i, 1);
            }
          }
          idss.push(roomID);
          obj.set({
            ids: idss
          })
          setRecRooms(idss);

        } else {
          console.log('data empty');
          obj.set(
            {
              ids: [roomID]
            }
          )
          setRecRooms([roomID]);
        }
      }
    ).catch((err) => {
      alert(err.message);
    })
  }

  function cheapSetRecentRooms(id) {
    let obj = database.ref().child('users').child(auth.currentUser.uid)
    obj.get().then(
      (ss) => {
        if (ss.val() !== null) {
          console.log(ss.val());

          let idss = ss.val().ids;
          for (var i = idss.length - 1; i >= 0; i--) {
            if (idss[i] === id) {
              idss.splice(i, 1);
            }
          }
          idss.push(id);
          obj.set({
            ids: idss
          })
          setRecRooms(idss);

        } else {
          console.log('data empty');
          obj.set(
            {
              ids: [id]
            }
          )
          setRecRooms([id]);
        }
      }
    ).catch((err) => {
      alert(err.message);
    })
  }

  async function getRecentRooms() {
    let obj = database.ref().child('users').child(auth.currentUser.uid)
    await obj.get().then(
      (ss) => {
        if (ss.val() !== null) {
          setRecRooms(ss.val().ids)
        } else {
          setRecRooms([]);
        }
      }
    )
  }

  function RecRoomBox(i, index) {
    return (
      <div onClick={() => {
        setRoomID(i);
        cheapEnterRoom(i);
      }} className="recentRoom pseudoButton" key={i}>
        {i}
      </div>
    )
  }

  useEffect(() => {
    getRecentRooms();
  }, [])

  function handleNotiPermission() {
    Promise.resolve(Notification.requestPermission()).then(function (permission) {
      if (permission === 'granted') {
        alert("You already have notifications on");
      }
    });
  }
  return (
    chat ?
      <div className="base">
        <div className='textBoxTitle'>
          <img src={backIcon} className='textBoxTitleButton pseudoButton' alt="back" onClick={leaveRoom} />
          <div className='textBoxTitleText'>{roomName}</div>
          {navigator.clipboard
            ? <img src={copy} className="textBoxTitleButton pseudoButton" alt="copyID" onClick={copyRoomID}></img>
            : <div ></div>} <div id="copyTXT" className="titleCopyText">(Copy Room ID to share!)</div>
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
          <img src={send} alt="Send" onClick={sendMessage} className="enterButton pseudoButton" />
        </div>


      </div>
      :
      <div className="base">
        <InfoCard />
        <h2>Recent Rooms <img className="bellIMG" onClick={handleNotiPermission} src={bell} alt="notifications" /></h2>
        <div className="recentBox">
          {recRooms[0]
            ? recRooms.map((i, index) => {
              return RecRoomBox(recRooms[recRooms.length - index - 1], index)
            })
            : <p>You have no recent rooms</p>
          }
        </div>
        <div className="inputContainer">
          <img className="enterButton pseudoButton" src={newRoom} alt="New room" onClick={createRoom} />
          <input
            type="string"
            value={roomID}
            placeholder="Enter Room ID"
            id="roomID"
            className="roomIDInput"
            onChange={(event) => setRoomID(event.currentTarget.value)}
          />
          <img className="enterButton pseudoButton" src={enter} alt="Enter room" onClick={enterRoom} />
        </div>

      </div>
  )
};
export default MainPage;

