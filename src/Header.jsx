import React, { useState, useEffect, useRef, use } from 'react';
import { AiFillHome, AiFillBook, AiFillBulb } from "react-icons/ai";
import { GiAxeSword } from "react-icons/gi";
import { useLocation } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Header = () => {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const navItems = [
    { href: "/",        label: "Trang Chủ", icon: <AiFillHome /> },
    { href: "/blogs",   label: "Bài đăng",  icon: <AiFillBook /> },
    { href: "/arena",   label: "Đấu Trường",icon: <GiAxeSword /> },
    { href: "/mindmap", label: "Mindmap",   icon: <AiFillBulb /> },
  ];

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10)                          setVisible(true);
      else if (currentY > lastScrollY.current + 6) setVisible(false);
      else if (currentY < lastScrollY.current - 6) setVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');

        /* ── Keyframes ── */
        @keyframes headerSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes headerCollapseUp {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-110%); opacity: 0; }
        }
        @keyframes navItemDrop {
          from { transform: translateY(-14px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes logoSpin {
          from { transform: rotate(-15deg) scale(0.8); opacity: 0; }
          to   { transform: rotate(0deg)  scale(1);   opacity: 1; }
        }

        /* ── User icon: pop + glow vào lần đầu ── */
        @keyframes userIconPop {
          0%   { transform: scale(0.4) rotate(-20deg); opacity: 0; filter: blur(4px); }
          60%  { transform: scale(1.18) rotate(6deg);  opacity: 1; filter: blur(0); }
          80%  { transform: scale(0.94) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg);     opacity: 1; }
        }

        /* ── Pulse ring xung quanh nút user ── */
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(212, 160, 23, 0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(212, 160, 23, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 160, 23, 0); }
        }

        /* ── Header gốc ── */
        .header-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #fffbf0 0%, #fef3c7 50%, #fde68a 100%);
          border-bottom: 1px solid rgba(212, 160, 23, 0.25);
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity   0.35s ease,
                      box-shadow 0.35s ease;
        }
        .header-root.entering {
          animation: headerSlideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .header-root.entered.hidden {
          animation: headerCollapseUp 0.35s ease forwards;
        }
        .header-root.entered {
          transform: translateY(0);
          opacity: 1;
        }
        .header-root.entered.hidden {
          transform: translateY(-110%);
          opacity: 0;
        }
        .header-root.entered.scrolled {
          box-shadow: 0 4px 24px rgba(180, 120, 0, 0.12);
        }

        /* ── Layout ── */
        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          position: relative;
        }
        .header-inner::after {
          content: '';
          position: absolute;
          bottom: 0; left: 32px; right: 32px;
          height: 1px;
          background: linear-gradient(to right, transparent, #d4a017 40%, #d4a017 60%, transparent);
          opacity: 0.35;
        }

        /* ── Nav + User wrapper ── */
        .nav-user-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Logo ── */
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .logo-circle {
          width: 11vh; height: 11vh;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(212, 160, 23, 0.35);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          opacity: 0;
        }
        .header-root.entering .logo-circle,
        .header-root.entered  .logo-circle {
          animation: logoSpin 0.6s 0.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .logo-circle:hover {
          transform: rotate(8deg) scale(1.06);
          box-shadow: 0 4px 20px rgba(212, 160, 23, 0.5);
        }
        .logo-circle img {
          width: 100%; height: 100%; object-fit: cover;
        }

        /* ── Nav ── */
        .nav-list {
          display: flex;
          list-style: none;
          gap: 4px;
          margin: 0; padding: 0;
        }
        .nav-list li {
          opacity: 0;
        }
        .header-root.entering .nav-list li,
        .header-root.entered  .nav-list li {
          animation: navItemDrop 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .header-root.entering .nav-list li:nth-child(1),
        .header-root.entered  .nav-list li:nth-child(1) { animation-delay: 0.12s; }
        .header-root.entering .nav-list li:nth-child(2),
        .header-root.entered  .nav-list li:nth-child(2) { animation-delay: 0.19s; }
        .header-root.entering .nav-list li:nth-child(3),
        .header-root.entered  .nav-list li:nth-child(3) { animation-delay: 0.26s; }
        .header-root.entering .nav-list li:nth-child(4),
        .header-root.entered  .nav-list li:nth-child(4) { animation-delay: 0.33s; }

        .nav-link {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 14px; font-weight: 500;
          color: #92620a;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 20px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.03em;
          transition: color 0.25s ease, background 0.25s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 5px; left: 50%; right: 50%;
          height: 2px;
          background: #c47f10;
          border-radius: 2px;
          transition: left 0.3s ease, right 0.3s ease;
        }
        .nav-link:hover, .nav-link.active {
          color: #5a3800;
          background: rgba(212, 160, 23, 0.12);
          font-weight: 600;
        }
        .nav-link:hover::after, .nav-link.active::after {
          left: 16px; right: 16px;
        }
        .nav-link.active {
          background: rgba(212, 160, 23, 0.2);
        }

        /* ── User icon button ── */
        .user-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px; height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(212, 160, 23, 0.15);
          color: #92620a;
          cursor: pointer;
          font-size: 22px;
          opacity: 0;
          transition: color 0.25s ease, background 0.25s ease, transform 0.25s ease;
          /* Pulse ring lặp lại mỗi 3s sau khi appear */
          animation: none;
        }

        /* Lần đầu xuất hiện: pop animation với delay sau nav items */
        .header-root.entering .user-btn,
        .header-root.entered  .user-btn {
          animation:
            userIconPop 0.55s 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            pulseRing   1.8s  1.2s ease-out infinite;
        }

        .user-btn:hover {
          color: #5a3800;
          background: rgba(212, 160, 23, 0.28);
          transform: scale(1.12) rotate(-6deg);
        }

        .user-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      <header className={[
        "header-root",
        !mounted      ? ""        : "entering",
        mounted       ? "entered" : "",
        !visible      ? "hidden"  : "",
        lastScrollY.current > 10 ? "scrolled" : ""
      ].filter(Boolean).join(" ")}>

        <div className="header-inner">
          <a href="/" className="logo-wrap">
            <div className="logo-circle">
              <img src="/assets/logo.png" alt="Logo" />
            </div>
          </a>

          {/* Nav + User icon gom chung một nhóm */}
          <div className="nav-user-wrap">
            <nav>
              <ul className="nav-list">
                {navItems.map(({ href, label, icon }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className={`nav-link${isActive(href) ? " active" : ""}`}
                    >
                      {icon} {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Nút user chỉ có icon, không có label */}
            <Link to="/user" className="user-btn" aria-label="Tài khoản người dùng">
              <FaUserCircle />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;