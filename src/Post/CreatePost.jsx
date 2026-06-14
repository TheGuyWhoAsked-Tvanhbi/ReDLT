import { useState, useRef, useEffect } from "react";
import { db , auth , storage} from "../firebase.js";
import { addDoc , collection } from "firebase/firestore";
import { ref , uploadBytes } from "firebase/storage";

const TAGS_OPTIONS = [
  "Lập luận", "Phản biện", "Kỹ năng", "Chiến thuật",
  "Kinh nghiệm", "Phân tích", "Thi đấu", "Tài liệu gốc",
  "Hướng dẫn", "Tranh luận", "Nghiên cứu", "Thực hành",
  "Tập sự", "Chuyên sâu", "Tiếng Anh", "Tiếng Việt",
];

const CATEGORIES = ["Bài đăng", "Ván đấu", "Tài liệu"];

const DEFAULT_HTML = `<h2>Tiêu đề bài viết</h2>
<p>Bắt đầu viết nội dung của bạn ở đây. Bạn có thể sử dụng <strong>in đậm</strong>, <em>in nghiêng</em>, và nhiều định dạng HTML khác.</p>
<ul>
  <li>Điểm đầu tiên</li>
  <li>Điểm thứ hai</li>
  <li>Điểm thứ ba</li>
</ul>
<blockquote>Trích dẫn quan trọng hoặc điểm nhấn của bài viết.</blockquote>`;

const PREVIEW_CSS = `
  body { font-family: 'Georgia', serif; color: #2a1f0e; line-height: 1.8; padding: 0; margin: 0; }
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

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Bài đăng");
  const [selectedTags, setSelectedTags] = useState([]);
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [editMode, setEditMode] = useState("edit");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const iframeRef = useRef(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [postIdRef, setPostIdRef] = useState(null);

  const postsCollectionRef = collection(db, "posts");

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (editMode === "preview" && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><style>${PREVIEW_CSS}</style></head><body>${htmlContent}</body></html>`);
      doc.close();
    }
  }, [editMode, htmlContent]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getYoutubeEmbed = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setDocFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
    thumbnailInputRef.current.value = "";
  };

  const handleUploadClick = async () => {
    if (!thumbnail) return null;
    const fileExt = `thumbnails/${Date.now()}_${thumbnail.name}`;
    const imageRef = ref(storage, fileExt);
    await uploadBytes(imageRef, thumbnail);

    if (category === "Bài đăng") {
      const postRef = await addDoc(postsCollectionRef, {author: {uid: auth.currentUser.uid, name: localStorage.getItem(currentUsername), pic: localStorage.getItem(currentProfilePic)}, title, fileExt, category, tags: selectedTags, content: htmlContent, createdAt: new Date()});
      setPostIdRef(postRef);
      setShowSuccess(true);
    } else if (category === "Ván đấu") {
      const postRef = await addDoc(postsCollectionRef, {author: {uid: auth.currentUser.uid, name: localStorage.getItem(currentUsername), pic: localStorage.getItem(currentProfilePic)}, title, fileExt, category, tags: selectedTags, content: youtubeLink, createdAt: new Date()});
      setPostIdRef(postRef);
      setShowSuccess(true);
    } else if (category === "Tài liệu") {
      // đã upload tài liệu được -vanh
      const docExt = `documents/${Date.now()}_${docFile.name}`;
      const docRef = ref(storage, docExt);
      await uploadBytes(docRef, docFile);
      const postRef = await addDoc(postsCollectionRef, {author: {uid: auth.currentUser.uid, name: localStorage.getItem(currentUsername), pic: localStorage.getItem(currentProfilePic)}, title, fileExt, category, tags: selectedTags, content: docExt, createdAt: new Date()});
      setPostIdRef(postRef);
      setShowSuccess(true);
    }
    console.log("handleUploadClick returned 1");
  };

  const handleContinue = async () => {
    await setShowSuccess(false);
    const postUid = await postIdRef.id;
    window.location.pathname = `/post/${postUid}`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes pageIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes tagPop {
          0%   { transform: scale(0.85); opacity: 0; }
          70%  { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .cp-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(224,200,151,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(200,168,107,0.15) 0%, transparent 55%),
            linear-gradient(160deg, #fffdf7 0%, #fdf5e4 40%, #fff9ef 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 48px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }
        .cp-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(200,168,107,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }
        .cp-page::after {
          content: '';
          position: fixed;
          top: -120px; right: -120px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(224,200,151,0.22) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          animation: float 8s ease-in-out infinite;
        }

        .cp-container {
          position: relative;
          z-index: 1;
          max-width: 880px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
        }
        .cp-container.visible { opacity: 1; transform: translateY(0); }

        .cp-header { margin-bottom: 36px; }
        .cp-header-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #a07840;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .cp-header-eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px; height: 2px;
          background: linear-gradient(90deg, #e0c897, #c8a86b);
          border-radius: 2px;
        }
        .cp-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          background: linear-gradient(135deg, #7a5c2e 0%, #c8a86b 50%, #e0c897 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          animation: shimmer 4s linear infinite;
        }
        .cp-header-sub {
          margin-top: 8px;
          font-size: 14px;
          color: #a07840;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .cp-card {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(224,200,151,0.5);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 4px 24px rgba(160,120,64,0.1), 0 1px 0 rgba(255,255,255,0.9) inset;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .cp-field { display: flex; flex-direction: column; gap: 8px; }
        .cp-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #a07840;
          font-weight: 600;
        }

        .cp-title-input {
          width: 100%;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #2a1f0e;
          background: linear-gradient(135deg, rgba(253,248,239,0.8), rgba(255,255,255,0.9));
          border: 2px solid rgba(224,200,151,0.6);
          border-radius: 14px;
          padding: 16px 20px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .cp-title-input::placeholder { color: rgba(160,120,64,0.4); font-style: italic; }
        .cp-title-input:focus {
          border-color: #c8a86b;
          box-shadow: 0 0 0 4px rgba(224,200,151,0.25), 0 4px 16px rgba(160,120,64,0.12);
        }

        .cp-row { display: flex; gap: 16px; align-items: flex-start; }

        .cp-select-wrap { flex: 0 0 30%; }
        .cp-select {
          width: 100%;
          appearance: none;
          background:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a07840' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")
            no-repeat right 14px center,
            linear-gradient(135deg, rgba(253,248,239,0.9), rgba(255,255,255,0.95));
          border: 2px solid rgba(224,200,151,0.6);
          border-radius: 12px;
          padding: 12px 38px 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #2a1f0e;
          cursor: pointer;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color .2s, box-shadow .2s;
        }
        .cp-select:focus { border-color: #c8a86b; box-shadow: 0 0 0 4px rgba(224,200,151,0.25); }

        .cp-tags-wrap { flex: 1; }
        .cp-tags-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .cp-tag {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid rgba(224,200,151,0.5);
          background: rgba(253,248,239,0.7);
          color: #a07840;
          letter-spacing: 0.3px;
          transition: all .18s cubic-bezier(.22,1,.36,1);
          user-select: none;
        }
        .cp-tag:hover { border-color: #c8a86b; background: rgba(224,200,151,0.2); transform: translateY(-1px); }
        .cp-tag.active {
          background: linear-gradient(135deg, #e0c897, #c8a86b);
          border-color: transparent;
          color: #2a1f0e;
          box-shadow: 0 3px 10px rgba(160,120,64,0.3);
          animation: tagPop 0.25s cubic-bezier(.22,1,.36,1);
        }

        .cp-divider {
          height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(224,200,151,0.6), transparent);
          border: none;
        }

        /* ── THUMBNAIL ── */
        .cp-thumb-row {
          display: flex;
          gap: 16px;
          align-items: stretch;
        }
        .cp-thumb-drop {
          flex: 0 0 200px;
          height: 130px;
          border: 2px dashed rgba(224,200,151,0.6);
          border-radius: 14px;
          background:
            radial-gradient(ellipse 70% 70% at 50% 50%, rgba(224,200,151,0.07) 0%, transparent 70%),
            rgba(253,248,239,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          gap: 6px;
          transition: border-color .2s, background .2s, transform .15s;
          position: relative;
          overflow: hidden;
        }
        .cp-thumb-drop::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(224,200,151,0.04) 8px, rgba(224,200,151,0.04) 16px);
        }
        .cp-thumb-drop:hover {
          border-color: #c8a86b;
          background: rgba(224,200,151,0.12);
          transform: translateY(-1px);
        }
        .cp-thumb-drop-icon {
          font-size: 28px;
          position: relative;
          z-index: 1;
          line-height: 1;
        }
        .cp-thumb-drop-text {
          font-size: 12px;
          font-weight: 600;
          color: #a07840;
          position: relative;
          z-index: 1;
          text-align: center;
          line-height: 1.4;
        }
        .cp-thumb-drop-sub {
          font-size: 11px;
          color: rgba(160,120,64,0.6);
          position: relative;
          z-index: 1;
        }
        /* preview image fills the drop zone */
        .cp-thumb-preview {
          flex: 0 0 200px;
          height: 130px;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid rgba(224,200,151,0.55);
          position: relative;
          cursor: pointer;
        }
        .cp-thumb-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cp-thumb-preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(42,31,14,0);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background .2s;
        }
        .cp-thumb-preview:hover .cp-thumb-preview-overlay {
          background: rgba(42,31,14,0.45);
        }
        .cp-thumb-action-btn {
          opacity: 0;
          transform: translateY(4px);
          transition: opacity .2s, transform .2s;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          border: none;
        }
        .cp-thumb-preview:hover .cp-thumb-action-btn { opacity: 1; transform: translateY(0); }
        .cp-thumb-btn-change {
          background: rgba(224,200,151,0.9);
          color: #2a1f0e;
        }
        .cp-thumb-btn-remove {
          background: rgba(180,60,20,0.85);
          color: #fff;
        }
        /* info column next to preview/drop */
        .cp-thumb-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        .cp-thumb-info-title {
          font-size: 13px;
          font-weight: 700;
          color: #2a1f0e;
        }
        .cp-thumb-info-sub {
          font-size: 12px;
          color: #a07840;
          line-height: 1.6;
        }
        .cp-thumb-info-specs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .cp-thumb-spec {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(224,200,151,0.18);
          border: 1px solid rgba(224,200,151,0.45);
          color: #7a5c2e;
        }

        .cp-content-header { display: flex; align-items: center; justify-content: space-between; }
        .cp-mode-toggle {
          display: flex;
          background: rgba(224,200,151,0.15);
          border: 1.5px solid rgba(224,200,151,0.4);
          border-radius: 10px;
          overflow: hidden;
          padding: 3px;
          gap: 3px;
        }
        .cp-mode-btn {
          padding: 6px 18px;
          border: none;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all .2s;
          font-family: 'DM Sans', sans-serif;
          background: transparent;
          color: #a07840;
        }
        .cp-mode-btn.active {
          background: linear-gradient(135deg, #e0c897, #c8a86b);
          color: #2a1f0e;
          box-shadow: 0 2px 8px rgba(160,120,64,0.25);
        }

        .cp-html-editor {
          width: 100%;
          min-height: 320px;
          background: linear-gradient(170deg, #fdf8ef, #fff);
          border: 2px solid rgba(224,200,151,0.5);
          border-radius: 14px;
          padding: 20px;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.75;
          color: #2a1f0e;
          resize: vertical;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .cp-html-editor:focus {
          border-color: #c8a86b;
          box-shadow: 0 0 0 4px rgba(224,200,151,0.2), 0 4px 16px rgba(160,120,64,0.08);
        }

        .cp-yt-wrap { display: flex; flex-direction: column; gap: 16px; }
        .cp-yt-input-row { display: flex; gap: 10px; align-items: center; }
        .cp-yt-input {
          flex: 1;
          padding: 13px 18px;
          border: 2px solid rgba(224,200,151,0.5);
          border-radius: 12px;
          font-size: 14px;
          color: #2a1f0e;
          background: rgba(253,248,239,0.8);
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color .2s, box-shadow .2s;
        }
        .cp-yt-input::placeholder { color: rgba(160,120,64,0.4); }
        .cp-yt-input:focus { border-color: #c8a86b; box-shadow: 0 0 0 4px rgba(224,200,151,0.2); }
        .cp-yt-preview {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid rgba(224,200,151,0.4);
          background: linear-gradient(135deg, #2a1f0e, #3d2e10);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(224,200,151,0.4);
          font-size: 13px;
          letter-spacing: 1px;
        }
        .cp-yt-iframe { width: 100%; height: 100%; border: none; display: block; }

        .cp-upload-zone {
          border: 2.5px dashed rgba(224,200,151,0.6);
          border-radius: 18px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all .2s;
          background:
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(224,200,151,0.08) 0%, transparent 70%),
            rgba(253,248,239,0.5);
          position: relative;
          overflow: hidden;
        }
        .cp-upload-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(224,200,151,0.04) 10px, rgba(224,200,151,0.04) 20px);
        }
        .cp-upload-zone:hover {
          border-color: #c8a86b;
          background: rgba(224,200,151,0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(160,120,64,0.12);
        }
        .cp-upload-icon { font-size: 48px; margin-bottom: 12px; position: relative; z-index: 1; }
        .cp-upload-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #7a5c2e;
          margin-bottom: 6px;
          position: relative;
          z-index: 1;
        }
        .cp-upload-sub { font-size: 13px; color: #a07840; position: relative; z-index: 1; }
        .cp-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: linear-gradient(135deg, rgba(224,200,151,0.2), rgba(200,168,107,0.15));
          border: 1.5px solid rgba(224,200,151,0.5);
          border-radius: 12px;
          margin-top: 12px;
        }
        .cp-file-icon { font-size: 24px; flex-shrink: 0; }
        .cp-file-name { font-size: 14px; font-weight: 600; color: #2a1f0e; flex: 1; word-break: break-all; }
        .cp-file-remove {
          background: none; border: none; cursor: pointer;
          color: #a07840; font-size: 18px; padding: 2px 6px;
          border-radius: 6px; transition: background .15s, color .15s;
        }
        .cp-file-remove:hover { background: rgba(224,200,151,0.3); color: #7a5c2e; }

        .cp-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 4px; }
        .cp-btn-secondary {
          padding: 12px 28px;
          border: 2px solid rgba(224,200,151,0.6);
          border-radius: 12px;
          background: transparent;
          color: #a07840;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all .18s;
          letter-spacing: 0.3px;
        }
        .cp-btn-secondary:hover { background: rgba(224,200,151,0.15); border-color: #c8a86b; }
        .cp-btn-primary {
          padding: 12px 36px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #a07840 0%, #c8a86b 50%, #e0c897 100%);
          background-size: 200% auto;
          color: #2a1f0e;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 18px rgba(160,120,64,0.35);
          transition: all .2s;
          text-transform: uppercase;
        }
        .cp-btn-primary:hover {
          background-position: right center;
          box-shadow: 0 6px 24px rgba(160,120,64,0.45);
          transform: translateY(-1px);
        }
        .cp-btn-primary:active { transform: translateY(0); }

        .cp-category-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #e0c897, #c8a86b);
          color: #2a1f0e;
          margin-left: 8px;
        }

        /* ── SUCCESS POPUP ── */
        .cp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(42,31,14,0.5);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: cpFadeIn 0.2s ease both;
        }
        @keyframes cpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .cp-popup {
          background: linear-gradient(170deg, #fdf8ef 0%, #fffdf7 100%);
          border: 1.5px solid rgba(224,200,151,0.7);
          border-radius: 24px;
          padding: 40px 36px 32px;
          width: 380px;
          max-width: calc(100vw - 48px);
          text-align: center;
          box-shadow: 0 24px 60px rgba(42,31,14,0.4), 0 0 0 1px rgba(224,200,151,0.2);
          position: relative;
          overflow: hidden;
          animation: cpPopIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cpPopIn {
          from { opacity: 0; transform: scale(0.82) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .cp-popup::before {
          content: '';
          position: absolute;
          top: -40px; left: 50%;
          transform: translateX(-50%);
          width: 220px; height: 110px;
          background: radial-gradient(ellipse, rgba(224,200,151,0.22) 0%, transparent 70%);
          pointer-events: none;
        }
        .cp-popup-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0c897, #c8a86b);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 8px 24px rgba(160,120,64,0.35);
          font-size: 32px;
          position: relative;
          z-index: 1;
        }
        .cp-popup-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(224,200,151,0.45);
          animation: cpRingPulse 1.2s ease-out 0.3s both;
        }
        @keyframes cpRingPulse {
          0%   { transform: scale(0.85); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .cp-popup-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #2a1f0e;
          margin-bottom: 8px;
          position: relative; z-index: 1;
        }
        .cp-popup-sub {
          font-size: 14px;
          color: #a07840;
          line-height: 1.6;
          margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .cp-popup-meta {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          position: relative; z-index: 1;
        }
        .cp-meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 13px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(224,200,151,0.2);
          border: 1px solid rgba(224,200,151,0.5);
          color: #7a5c2e;
        }
        .cp-popup-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(224,200,151,0.5), transparent);
          border: none;
          margin-bottom: 20px;
          position: relative; z-index: 1;
        }
        .cp-popup-actions { display: flex; gap: 10px; position: relative; z-index: 1; }
        .cp-popup-ghost {
          flex: 1;
          padding: 11px 0;
          border: 1.5px solid rgba(224,200,151,0.55);
          border-radius: 12px;
          background: transparent;
          color: #a07840;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background .18s, border-color .18s;
        }
        .cp-popup-ghost:hover { background: rgba(224,200,151,0.15); border-color: #c8a86b; }
        .cp-popup-gold {
          flex: 1.4;
          padding: 11px 0;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #a07840, #c8a86b, #e0c897);
          color: #2a1f0e;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(160,120,64,0.3);
          transition: box-shadow .2s, transform .15s;
        }
        .cp-popup-gold:hover { box-shadow: 0 6px 22px rgba(160,120,64,0.42); transform: translateY(-1px); }
        .cp-popup-gold:active { transform: translateY(0); }
      `}</style>

      <div className="cp-page">
        <div className={`cp-container ${mounted ? "visible" : ""}`}>

          {/* HEADER */}
          <div className="cp-header">
            <div className="cp-header-eyebrow">Tạo nội dung mới</div>
            <h1>Tạo Bài Đăng</h1>
            <p className="cp-header-sub">Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng</p>
          </div>

          <div className="cp-card">

            {/* TITLE */}
            <div className="cp-field">
              <label className="cp-label">Tiêu đề</label>
              <input
                className="cp-title-input"
                type="text"
                placeholder="Nhập tiêu đề bài đăng..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <hr className="cp-divider" />

            {/* CATEGORY + TAGS ROW */}
            <div className="cp-row">
              <div className="cp-select-wrap cp-field">
                <label className="cp-label">Thể loại</label>
                <select
                  className="cp-select"
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setSelectedTags([]); }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="cp-tags-wrap cp-field">
                <label className="cp-label">
                  Tags
                  {selectedTags.length > 0 && (
                    <span className="cp-category-pill">{selectedTags.length} đã chọn</span>
                  )}
                </label>
                <div className="cp-tags-grid">
                  {TAGS_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      className={`cp-tag ${selectedTags.includes(tag) ? "active" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="cp-divider" />

            {/* THUMBNAIL */}
            <div className="cp-field">
              <label className="cp-label">Ảnh thumbnail</label>
              <div className="cp-thumb-row">
                {thumbnailPreview ? (
                  <div className="cp-thumb-preview">
                    <img src={thumbnailPreview} alt="Thumbnail preview" />
                    <div className="cp-thumb-preview-overlay">
                      <button
                        className="cp-thumb-action-btn cp-thumb-btn-change"
                        onClick={() => thumbnailInputRef.current.click()}
                      >Đổi ảnh</button>
                      <button
                        className="cp-thumb-action-btn cp-thumb-btn-remove"
                        onClick={removeThumbnail}
                      >Xoá</button>
                    </div>
                  </div>
                ) : (
                  <div className="cp-thumb-drop" onClick={() => thumbnailInputRef.current.click()}>
                    <div className="cp-thumb-drop-icon">🖼️</div>
                    <div className="cp-thumb-drop-text">Nhấn để chọn ảnh</div>
                    <div className="cp-thumb-drop-sub">JPG, PNG, WEBP</div>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={handleThumbnailChange}
                />
                <div className="cp-thumb-info">
                  <div className="cp-thumb-info-title">
                    {thumbnailPreview ? thumbnail.name : "Chưa chọn ảnh"}
                  </div>
                  <div className="cp-thumb-info-sub">
                    Ảnh thumbnail hiển thị trên danh sách bài đăng. Nên chọn ảnh có tỉ lệ 16:9 để hiển thị tốt nhất.
                  </div>
                  <div className="cp-thumb-info-specs">
                    <span className="cp-thumb-spec">📐 16:9</span>
                    <span className="cp-thumb-spec">🖼 JPG · PNG · WEBP</span>
                    <span className="cp-thumb-spec">⚖️ Tối đa 5MB</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="cp-divider" />

            {/* CONTENT SECTION based on category */}
            {category === "Bài đăng" && (
              <div className="cp-field">
                <div className="cp-content-header">
                  <label className="cp-label">Nội dung</label>
                  <div className="cp-mode-toggle">
                    <button
                      className={`cp-mode-btn ${editMode === "edit" ? "active" : ""}`}
                      onClick={() => setEditMode("edit")}
                    >✏ Chỉnh sửa</button>
                    <button
                      className={`cp-mode-btn ${editMode === "preview" ? "active" : ""}`}
                      onClick={() => setEditMode("preview")}
                    >👁 Xem trước</button>
                  </div>
                </div>
                {editMode === "edit" ? (
                  <textarea
                    className="cp-html-editor"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="Nhập nội dung HTML tại đây..."
                    spellCheck={false}
                  />
                ) : (
                  <div className="cp-yt-preview" style={{ aspectRatio: "unset", minHeight: 320, background: "#fdf8ef" }}>
                    <iframe
                      ref={iframeRef}
                      className="cp-yt-iframe"
                      style={{ minHeight: 320, borderRadius: 12 }}
                      title="preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                )}
              </div>
            )}

            {category === "Ván đấu" && (
              <div className="cp-field">
                <label className="cp-label">Link YouTube</label>
                <div className="cp-yt-wrap">
                  <div className="cp-yt-input-row">
                    <input
                      className="cp-yt-input"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                    />
                  </div>
                  <div className="cp-yt-preview">
                    {getYoutubeEmbed(youtubeLink) ? (
                      <iframe
                        className="cp-yt-iframe"
                        src={getYoutubeEmbed(youtubeLink)}
                        title="YouTube preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <span>Dán link YouTube để xem trước</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {category === "Tài liệu" && (
              <div className="cp-field">
                <label className="cp-label">Tệp tài liệu</label>
                <div className="cp-upload-zone" onClick={() => fileInputRef.current.click()}>
                  <div className="cp-upload-icon">📄</div>
                  <div className="cp-upload-title">Kéo thả hoặc nhấn để tải lên</div>
                  <div className="cp-upload-sub">Hỗ trợ PDF, DOCX · Tối đa 50MB</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
                {docFile && (
                  <div className="cp-file-info">
                    <span className="cp-file-icon">{docFile.name.endsWith(".pdf") ? "📕" : "📘"}</span>
                    <span className="cp-file-name">{docFile.name}</span>
                    <button className="cp-file-remove" onClick={() => setDocFile(null)}>✕</button>
                  </div>
                )}
              </div>
            )}

            {/* ACTIONS */}
            <div className="cp-actions">
              <button className="cp-btn-primary" onClick={handleUploadClick}>Đăng bài</button>
            </div>

          </div>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="cp-overlay" onClick={(e) => e.target.classList.contains("cp-overlay") && setShowSuccess(false)}>
          <div className="cp-popup">
            <div className="cp-popup-icon">
              <div className="cp-popup-ring" />
              ✓
            </div>
            <div className="cp-popup-title">Đăng bài thành công!</div>
            <div className="cp-popup-sub">Bài đăng của bạn đã được gửi và đang chờ hiển thị trên cộng đồng.</div>
            <div className="cp-popup-meta">
              <span className="cp-meta-pill">⏱ Vừa xong</span>
              <span className="cp-meta-pill">👁 Công khai</span>
              <span className="cp-meta-pill">📄 {category}</span>
            </div>
            <hr className="cp-popup-divider" />
            <div className="cp-popup-actions">
              <button className="cp-popup-ghost" onClick={() => setShowSuccess(false)}>Đóng</button>
              <button className="cp-popup-gold" onClick={handleContinue}>Xem bài đăng →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}