import React from 'react';
import { useAuth } from '/src/AuthContext'; // Nhớ thay đường dẫn cho đúng
import { useNavigate } from 'react-router-dom';

export default function Userpage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      // Chuyển hướng người dùng về trang đăng nhập sau khi đăng xuất thành công
      navigate('/login');
    } catch (error) {
      console.error("Đăng xuất thất bại:", error.message);
    }
  }

  return (
    <button onClick={handleLogout} className="btn-logout">
      Đăng xuất
    </button>
  );
}2