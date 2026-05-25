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


function App() {

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

export default App
