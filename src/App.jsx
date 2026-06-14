import React, { useRef, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./AuthContext";

import Login from './Auth/Login';
import Mainpage from './Main/Mainpage';
import Arena from './Main/Arena';
import ProfilePage from './Main/Profile';
import MindmapPage from './Main/Mindmap';
import Userpage from './Main/Userpage';
import Blogpage from './Main/Blogpage';
import Header from './Header';
import DebatesAI from './Main/Score';
import DebateRandomizer from './Main/RandomTopic';
import CreatePost from './Post/CreatePost';
import PostView from './Post/ViewPost';

// Gomen amanai
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

const MUSIC_URL = "/assets/bg_music.mp3";

const MusicButton = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio ref={audioRef} src={MUSIC_URL} loop />
      <button
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          background: isPlaying
            ? "linear-gradient(135deg, #e0c897, #c8a86b)"
            : "#2a2a2a",
          color: isPlaying ? "#2a2a2a" : "#e0c897",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
        aria-label={isPlaying ? "Tắt nhạc" : "Mở nhạc"}
        title={isPlaying ? "Tắt nhạc" : "Mở nhạc"}
      >
        {isPlaying ? "♫" : "♪"}
      </button>
    </>
  );
};

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Header />
      <MusicButton />
      <div style={{ paddingTop: "calc(11vh + 32px)" }}>
        <Routes location={location}>
          
          {/* Các trang công khai */}
          <Route path="/" element={<Mainpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blogs" element={<Blogpage />} />
          <Route path="/random-topic" element={<DebateRandomizer />} />
          <Route path="/post/:id" element={<PostView />} />


          {/* Các trang yêu cầu ĐĂNG NHẬP */}
          <Route path="/mindmap" element={<PrivateRoute><MindmapPage /></PrivateRoute>} />
          <Route path="/arena" element={<PrivateRoute><Arena /></PrivateRoute>} />
          <Route path="/user" element={<PrivateRoute><Userpage /></PrivateRoute>} />
          <Route path="/ai-scores" element={<PrivateRoute><DebatesAI /></PrivateRoute>} />
          <Route path="/createpost" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;