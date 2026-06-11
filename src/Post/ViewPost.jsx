import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc , deleteDoc , collection} from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage , auth } from "../firebase.js";

import { FaFlag } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { RiDeleteBin5Fill } from "react-icons/ri";

const PREVIEW_CSS = `
  body { font-family: 'Georgia', serif; color: #2a1f0e; line-height: 1.8; padding: 24px 32px; margin: 0; }
  h1,h2,h3 { color: #7a5c2e; font-weight: 700; margin: 1.2em 0 0.5em; line-height: 1.3; }
  h1 { font-size: 1.9em; border-bottom: 2px solid #e0c897; padding-bottom: 0.3em; }
  h2 { font-size: 1.4em; }
  h3 { font-size: 1.15em; }
  p  { margin: 0.8em 0; }
  strong { color: #a07840; }
  em { color: #7a5c2e; }
  a  { color: #c8a86b; text-decoration: underline; }
  ul,ol { padding-left: 1.5em; margin: 0.8em 0; }
  li { margin: 0.3em 0; }
  blockquote {
    border-left: 4px solid #e0c897;
    margin: 1em 0; padding: 0.6em 1.2em;
    background: rgba(224,200,151,0.12);
    border-radius: 0 8px 8px 0;
    font-style: italic; color: #7a5c2e;
  }
  code { background: rgba(224,200,151,0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
  pre  { background: #fdf8ef; border: 1px solid #e0c897; border-radius: 8px; padding: 1em; overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th { background: linear-gradient(135deg,#e0c897,#c8a86b); color: #2a1f0e; padding: 8px 12px; text-align: left; }
  td { border: 1px solid #e0c897; padding: 8px 12px; }
  tr:nth-child(even) td { background: rgba(224,200,151,0.1); }
  img { max-width: 100%; border-radius: 8px; }
  hr { border: none; border-top: 2px solid #e0c897; margin: 1.5em 0; }
`;

const CATEGORY_META = {
  "Bài đăng": { emoji: "📝", label: "Bài đăng" },
  "Ván đấu":  { emoji: "⚔️", label: "Ván đấu" },
  "Tài liệu": { emoji: "📚", label: "Tài liệu" },
};

const collectionName = "posts";

export default function PostView() {
  //debug ở đây

  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const iframeRef = useRef(null);
  const menuRef = useRef(null);

  // Điều kiện hiển thị chỉnh sửa/xoá — tạm thời true
  const canEdit = auth.currentUser?.uid === post?.author?.uid;
  const canDelete = auth.currentUser?.uid === post?.author?.uid;

  const handleDelete = async (documentId, fileExt, content) => {
    setShowMenu(false);
    if (await !confirm("Bạn có chắc muốn xoá bài đăng này? Hành động này không thể hoàn tác.")) return;
    await deleteObject(ref(storage, fileExt));
    if (content.startsWith("documents/")) {
      await deleteObject(ref(storage, content));
    }
    await deleteDoc(doc(db, collectionName, documentId));
    window.location.pathname = "/blogs";
    console.log("Delete Post Successfully");
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "posts", id));
        if (!snap.exists()) { setLoading(false); return; }
        const data = { ...snap.data(), id: snap.id };

        // thumbnail
        if (data.fileExt) {
          try {
            data.thumbnailUrl = await getDownloadURL(ref(storage, data.fileExt));
          } catch (_) { data.thumbnailUrl = null; }
        }

        setPost(data);

        // pdf url for Tài liệu
        if (data.category === "Tài liệu" && data.content) {
          setPdfLoading(true);
          try {
            const url = await getDownloadURL(ref(storage, data.content));
            setPdfUrl(url);
          } catch (_) { setPdfUrl(null); }
          setPdfLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    if (id) fetchPost();
  }, [id]);

  // inject HTML content into iframe
  useEffect(() => {
    if (post?.category === "Bài đăng" && iframeRef.current && post.content) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><style>${PREVIEW_CSS}</style></head><body>${post.content}</body></html>`);
      doc.close();
    }
  }, [post]);

  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  const catMeta = post ? (CATEGORY_META[post.category] || { emoji: "📄", label: post.category }) : null;
  const dateStr = post?.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";
  const initials = post?.author?.name ? post.author.name.charAt(0).toUpperCase() : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerBg { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin      { to{transform:rotate(360deg)} }

        .pv-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(224,200,151,.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(200,168,107,.15) 0%, transparent 55%),
            linear-gradient(160deg, #fffdf7 0%, #fdf5e4 40%, #fff9ef 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 40px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }
        .pv-page::before {
          content: ''; position: fixed; inset: 0;
          background-image: radial-gradient(circle, rgba(200,168,107,.12) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none; z-index: 0;
        }
        .pv-page::after {
          content: ''; position: fixed; top: -120px; right: -120px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(224,200,151,.22) 0%, transparent 70%);
          pointer-events: none; z-index: 0; animation: float 8s ease-in-out infinite;
        }

        .pv-wrap {
          position: relative; z-index: 1;
          max-width: 820px; margin: 0 auto;
          opacity: 0; transform: translateY(20px);
          transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1);
        }
        .pv-wrap.visible { opacity: 1; transform: translateY(0); }

        /* back button */
        .pv-back {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 10px;
          border: 1.5px solid rgba(224,200,151,.5); background: rgba(255,255,255,.7);
          font-size: 13px; font-weight: 600; color: #a07840; cursor: pointer;
          font-family: 'DM Sans', sans-serif; backdrop-filter: blur(6px);
          transition: background .18s, border-color .18s, transform .15s;
        }
        .pv-back:hover { background: rgba(224,200,151,.18); border-color: #c8a86b; transform: translateX(-2px); }

        /* top nav bar */
        .pv-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }

        /* kebab button */
        .pv-kebab-wrap { position: relative; }
        .pv-kebab-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid rgba(224,200,151,.5); background: rgba(255,255,255,.7);
          cursor: pointer; backdrop-filter: blur(6px); color: #a07840;
          transition: background .18s, border-color .18s;
          flex-shrink: 0;
        }
        .pv-kebab-btn:hover { background: rgba(224,200,151,.18); border-color: #c8a86b; }
        .pv-kebab-btn svg { display: block; }

        /* dropdown menu */
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-6px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pv-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 160px; z-index: 100;
          background: rgba(255,255,255,.96); backdrop-filter: blur(12px);
          border: 1.5px solid rgba(224,200,151,.55); border-radius: 14px;
          box-shadow: 0 8px 28px rgba(42,31,14,.14), 0 1px 0 rgba(255,255,255,.9) inset;
          overflow: hidden;
          animation: menuIn .18s cubic-bezier(.22,1,.36,1) both;
        }
        .pv-menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; font-size: 13px; font-weight: 600;
          color: #2a1f0e; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background .15s;
          border: none; background: none; width: 100%; text-align: left;
        }
        .pv-menu-item:hover { background: rgba(224,200,151,.18); }
        .pv-menu-item.danger { color: #b83c1a; }
        .pv-menu-item.danger:hover { background: rgba(184,60,26,.08); }
        .pv-menu-sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(224,200,151,.5), transparent);
          margin: 2px 0;
        }
        .pv-hero {
          width: 100%; aspect-ratio: 16/9; border-radius: 20px; overflow: hidden;
          position: relative; margin-bottom: 32px;
          box-shadow: 0 12px 40px rgba(42,31,14,.18);
        }
        .pv-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pv-hero-placeholder {
          width: 100%; height: 100%;
          background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(224,200,151,.08) 10px, rgba(224,200,151,.08) 20px),
            linear-gradient(135deg, #fdf3e0, #f5e4bb);
          display: flex; align-items: center; justify-content: center;
          font-size: 64px; opacity: .6;
        }
        .pv-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(42,31,14,.55) 0%, transparent 50%);
        }
        .pv-hero-cat {
          position: absolute; top: 16px; left: 18px;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 14px; font-size: 12px; font-weight: 700;
          background: rgba(253,248,239,.92); border: 1px solid rgba(224,200,151,.6);
          color: #7a5c2e; backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(42,31,14,.12);
        }

        /* article card */
        .pv-card {
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px);
          border: 1.5px solid rgba(224,200,151,.5); border-radius: 24px;
          padding: 40px 44px;
          box-shadow: 0 4px 28px rgba(160,120,64,.1), 0 1px 0 rgba(255,255,255,.95) inset;
          display: flex; flex-direction: column; gap: 24px;
        }

        /* meta bar */
        .pv-meta-bar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          padding-bottom: 20px;
          border-bottom: 1.5px solid rgba(224,200,151,.4);
        }
        .pv-author {
          display: flex; align-items: center; gap: 10px;
        }
        .pv-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #e0c897, #c8a86b);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #2a1f0e;
          box-shadow: 0 3px 10px rgba(160,120,64,.25); flex-shrink: 0;
        }
        .pv-author-name { font-size: 14px; font-weight: 600; color: #2a1f0e; }
        .pv-author-date { font-size: 12px; color: #a07840; margin-top: 1px; }
        .pv-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .pv-tag {
          padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 600;
          background: rgba(224,200,151,.2); border: 1px solid rgba(224,200,151,.45); color: #a07840;
        }

        /* title */
        .pv-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3.5vw, 34px); font-weight: 900;
          color: #2a1f0e; line-height: 1.2;
          background: linear-gradient(135deg, #2a1f0e 0%, #7a5c2e 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .pv-divider {
          height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(224,200,151,.6), transparent);
          border: none;
        }

        /* ── CONTENT TYPES ── */

        /* Bài đăng: iframe */
        .pv-html-frame {
          width: 100%; min-height: 480px; border: none;
          border-radius: 14px; display: block;
          background: #fdf8ef;
        }

        /* Ván đấu: youtube embed */
        .pv-yt-wrap { display: flex; flex-direction: column; gap: 14px; }
        .pv-yt-embed {
          width: 100%; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden;
          border: 2px solid rgba(224,200,151,.4);
          background: linear-gradient(135deg, #2a1f0e, #3d2e10);
          display: flex; align-items: center; justify-content: center;
          color: rgba(224,200,151,.4); font-size: 14px; letter-spacing: .5px;
        }
        .pv-yt-embed iframe { width: 100%; height: 100%; border: none; display: block; }
        .pv-yt-link {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
          background: rgba(224,200,151,.15); border: 1.5px solid rgba(224,200,151,.45);
          color: #7a5c2e; cursor: pointer; font-family: 'DM Sans', sans-serif;
          text-decoration: none; transition: background .18s, border-color .18s;
          width: fit-content;
        }
        .pv-yt-link:hover { background: rgba(224,200,151,.28); border-color: #c8a86b; }

        /* Tài liệu: pdf viewer */
        .pv-pdf-wrap { display: flex; flex-direction: column; gap: 14px; }
        .pv-pdf-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .pv-pdf-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #7a5c2e;
        }
        .pv-pdf-download {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px;
          border: 1.5px solid rgba(224,200,151,.5);
          background: linear-gradient(135deg, rgba(224,200,151,.2), rgba(200,168,107,.15));
          font-size: 13px; font-weight: 600; color: #7a5c2e;
          text-decoration: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background .18s, border-color .18s, transform .15s;
        }
        .pv-pdf-download:hover {
          background: rgba(224,200,151,.3); border-color: #c8a86b; transform: translateY(-1px);
        }
        .pv-pdf-frame-wrap {
          width: 100%; border-radius: 16px; overflow: hidden;
          border: 2px solid rgba(224,200,151,.4);
          box-shadow: 0 4px 20px rgba(42,31,14,.1);
          background: #f5edd8;
          min-height: 600px;
          display: flex; align-items: center; justify-content: center;
        }
        .pv-pdf-frame {
          width: 100%; height: 700px; border: none; display: block;
        }
        .pv-pdf-spinner {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 60px 0;
        }
        .pv-spinner-ring {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid rgba(224,200,151,.3);
          border-top-color: #c8a86b;
          animation: spin .8s linear infinite;
        }
        .pv-spinner-text { font-size: 13px; color: #a07840; font-weight: 500; }

        /* skeleton */
        .pv-skeleton { display: flex; flex-direction: column; gap: 20px; }
        .pv-skel-hero {
          width: 100%; aspect-ratio: 16/9; border-radius: 20px;
          background: linear-gradient(90deg, #f5e9ce 25%, #fdf5e4 50%, #f5e9ce 75%);
          background-size: 200% 100%; animation: shimmerBg 1.4s ease infinite;
        }
        .pv-skel-card {
          background: rgba(255,255,255,.7); border: 1.5px solid rgba(224,200,151,.35);
          border-radius: 24px; padding: 40px 44px; display: flex; flex-direction: column; gap: 16px;
        }
        .pv-skel-line {
          height: 16px; border-radius: 6px;
          background: linear-gradient(90deg, #f5e9ce 25%, #fdf5e4 50%, #f5e9ce 75%);
          background-size: 200% 100%; animation: shimmerBg 1.4s ease infinite;
        }

        /* not found */
        .pv-not-found {
          text-align: center; padding: 100px 24px;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .pv-not-found-icon { font-size: 60px; opacity: .5; }
        .pv-not-found-title {
          font-family: 'Playfair Display', serif; font-size: 22px;
          font-weight: 700; color: #a07840;
        }
        .pv-not-found-sub { font-size: 14px; color: rgba(160,120,64,.65); }
      `}</style>

      <div className="pv-page">
        <div className={`pv-wrap ${mounted ? "visible" : ""}`}>

          {/* top bar: back + kebab */}
          <div className="pv-topbar">
            <button className="pv-back" onClick={() => navigate(-1)}>
              ← Quay lại
            </button>

            <div className="pv-kebab-wrap" ref={menuRef}>
              <button className="pv-kebab-btn" onClick={() => setShowMenu((v) => !v)} aria-label="Tuỳ chọn">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="3.5" r="1.5" fill="#a07840"/>
                  <circle cx="9" cy="9"   r="1.5" fill="#a07840"/>
                  <circle cx="9" cy="14.5" r="1.5" fill="#a07840"/>
                </svg>
              </button>

              {showMenu && (
                <div className="pv-menu">
                  <button className="pv-menu-item" onClick={() => { setShowMenu(false); /* TODO: báo cáo */ }}>
                    <FaFlag /> Báo cáo
                  </button>
                  {canEdit && (
                    <>
                      <div className="pv-menu-sep" />
                      <button className="pv-menu-item" onClick={() => { setShowMenu(false); /* TODO: chỉnh sửa */ }}>
                        <FaPencil /> Chỉnh sửa
                      </button>
                    </>
                  )}
                  {canDelete && (
                    <>
                      <div className="pv-menu-sep" />
                      <button className="pv-menu-item danger" onClick={() => { handleDelete(post.id, post.fileExt, post.content); /* TODO: xoá */ }}>
                        <RiDeleteBin5Fill /> Xoá bài đăng
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="pv-skeleton">
              <div className="pv-skel-hero" />
              <div className="pv-skel-card">
                <div className="pv-skel-line" style={{ width: "60%" }} />
                <div className="pv-skel-line" style={{ width: "85%", height: 28 }} />
                <div className="pv-skel-line" style={{ width: "40%" }} />
                <div className="pv-skel-line" style={{ height: 200 }} />
              </div>
            </div>
          ) : !post ? (
            <div className="pv-not-found">
              <div className="pv-not-found-icon">🔍</div>
              <div className="pv-not-found-title">Không tìm thấy bài đăng</div>
              <div className="pv-not-found-sub">Bài đăng này có thể đã bị xoá hoặc không tồn tại.</div>
            </div>
          ) : (
            <>
              {/* HERO THUMBNAIL */}
              <div className="pv-hero">
                {post.thumbnailUrl
                  ? <img src={post.thumbnailUrl} alt={post.title} />
                  : <div className="pv-hero-placeholder">{catMeta.emoji}</div>
                }
                <div className="pv-hero-overlay" />
                <div className="pv-hero-cat">{catMeta.emoji} {catMeta.label}</div>
              </div>

              {/* CARD */}
              <div className="pv-card">

                {/* META BAR */}
                <div className="pv-meta-bar">
                  <div className="pv-author">
                    <div className="pv-avatar">{initials}</div>
                    <div>
                      <div className="pv-author-name">{post.author?.name || "Ẩn danh"}</div>
                      {dateStr && <div className="pv-author-date">{dateStr}</div>}
                    </div>
                  </div>
                  {post.tags?.length > 0 && (
                    <div className="pv-tags">
                      {post.tags.map((t) => <span key={t} className="pv-tag">{t}</span>)}
                    </div>
                  )}
                </div>

                {/* TITLE */}
                <div className="pv-title">{post.title}</div>

                <hr className="pv-divider" />

                {/* ── CONTENT based on category ── */}

                {post.category === "Bài đăng" && (
                  <iframe
                    ref={iframeRef}
                    className="pv-html-frame"
                    title="Nội dung bài đăng"
                    sandbox="allow-same-origin"
                  />
                )}

                {post.category === "Ván đấu" && (
                  <div className="pv-yt-wrap">
                    <div className="pv-yt-embed">
                      {getYoutubeEmbed(post.content)
                        ? <iframe
                            src={getYoutubeEmbed(post.content)}
                            title="YouTube video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        : <span>Link YouTube không hợp lệ</span>
                      }
                    </div>
                    {post.content && (
                      <a href={post.content} target="_blank" rel="noopener noreferrer" className="pv-yt-link">
                        ↗ Mở trên YouTube
                      </a>
                    )}
                  </div>
                )}

                {post.category === "Tài liệu" && (
                  <div className="pv-pdf-wrap">
                    <div className="pv-pdf-header">
                      <div className="pv-pdf-label">📄 Tài liệu đính kèm</div>
                      {pdfUrl && (
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download className="pv-pdf-download">
                          Xem ở tab mới
                        </a>
                      )}
                    </div>
                    <div className="pv-pdf-frame-wrap">
                      {pdfLoading ? (
                        <div className="pv-pdf-spinner">
                          <div className="pv-spinner-ring" />
                          <div className="pv-spinner-text">Đang tải tài liệu...</div>
                        </div>
                      ) : pdfUrl ? (
                        <iframe
                          className="pv-pdf-frame"
                          src={`${pdfUrl}#toolbar=1&navpanes=0`}
                          title="PDF viewer"
                        />
                      ) : (
                        <div className="pv-pdf-spinner">
                          <div style={{ fontSize: 40, opacity: .5 }}>📭</div>
                          <div className="pv-spinner-text">Không thể tải tài liệu này.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}