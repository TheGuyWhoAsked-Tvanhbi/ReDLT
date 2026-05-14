import React from 'react';
import Login from './Auth/Login';

import Mainpage from './Main/Mainpage';
import Arena from './Main/Arena';
import MindmapPage from './Main/Mindmap';
import Userpage from './Main/Userpage';
import Blogpage from './Main/Blogpage';

import Header from './Header';
import { Routes,Route, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCz-FPkOfqcdenQoQD5QVDLBvdtVlp0he4",
  authDomain: "redlt-4a5c8.firebaseapp.com",
  projectId: "redlt-4a5c8",
  storageBucket: "redlt-4a5c8.firebasestorage.app",
  messagingSenderId: "74648469314",
  appId: "1:74648469314:web:a033b225e978c7794d12db",
  measurementId: "G-B58K7SGDN9"
});

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const location = useLocation();

  //const user = useAuthState(auth);

  return (
    <>
      <Header />
      <div style={{ paddingTop: "calc(11vh + 32px)" }}>
        <Routes location={location}>
          <Route path="/" element={<Mainpage />} />
          <Route path="/mindmap" element={<MindmapPage />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<Userpage />} />
          <Route path="/blogs" element={<Blogpage />} />
        </Routes>
      </div>
    </>
  )
}

function Signin() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

export default App
