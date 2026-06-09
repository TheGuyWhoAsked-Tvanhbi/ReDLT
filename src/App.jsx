import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./AuthContext";

import Login from './Auth/Login';
import Mainpage from './Main/Mainpage';
import Arena from './Main/Arena';
import MindmapPage from './Main/Mindmap';
import Userpage from './Main/Userpage';
import Blogpage from './Main/Blogpage';
import Header from './Header';
import DebatesAI from './Main/Score';
import DebateRandomizer from './Main/RandomTopic';

// Gomen amanai
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Header />
      <div style={{ paddingTop: "calc(11vh + 32px)" }}>
        <Routes location={location}>
          
          {/* Các trang công khai */}
          <Route path="/" element={<Mainpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blogs" element={<Blogpage />} />
          <Route path="/random-topic" element={<DebateRandomizer />} />


          {/* Các trang yêu cầu ĐĂNG NHẬP */}
          <Route path="/mindmap" element={<PrivateRoute><MindmapPage /></PrivateRoute>} />
          <Route path="/arena/ai-scores" element={<PrivateRoute><Arena /></PrivateRoute>} />
          <Route path="/arena" element={<PrivateRoute><Arena /></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><Userpage /></PrivateRoute>} />
          <Route path="/ai-scores" element={<PrivateRoute><DebatesAI /></PrivateRoute>} />
          
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
