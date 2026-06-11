import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { BsFilePost } from "react-icons/bs";
import { FaPushed } from "react-icons/fa";

const TAGS_OPTIONS = [
  "Lập luận", "Phản biện", "Kỹ năng", "Chiến thuật",
  "Kinh nghiệm", "Phân tích", "Thi đấu", "Tài liệu gốc",
  "Hướng dẫn", "Tranh luận", "Nghiên cứu", "Thực hành",
  "Tập sự", "Chuyên sâu", "Tiếng Anh", "Tiếng Việt",
];

const CATEGORIES = ["Bài đăng", "Ván đấu", "Tài liệu"];

const CATEGORY_META = {
  "Bài đăng": { emoji: "📝" },
  "Ván đấu":  { emoji: "⚔️" },
  "Tài liệu": { emoji: "📚" },
};

function Blogpage() {
  const [postLists, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // search state
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null); // null = all
  const [activeTags, setActiveTags] = useState([]);
  const [showTagPanel, setShowTagPanel] = useState(false);

  const navigate = useNavigate();
  const postsCollectionRef = collection(db, "posts");

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      const data = await getDocs(postsCollectionRef);
      const postsWithUrls = await Promise.all(
        data.docs.map(async (doc) => {
          const postData = { ...doc.data(), id: doc.id };
          if (postData.fileExt) {
            try {
              postData.imageUrl = await getDownloadURL(ref(storage, postData.fileExt));
            } catch (e) {
              postData.imageUrl = null;
            }
          }
          return postData;
        })
      );
      setPostList(postsWithUrls);
      setLoading(false);
    };
    getPosts();
  }, []);

  const toggleTag = (tag) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const clearFilters = () => {
    setSearchText("");
    setActiveCategory(null);
    setActiveTags([]);
  };

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return postLists.filter((post) => {
      const matchText = !q || (post.title || "").toLowerCase().includes(q);
      const matchCat  = !activeCategory || post.category === activeCategory;
      const matchTags = activeTags.length === 0 ||
        activeTags.every((t) => (post.tags || []).includes(t));
      return matchText && matchCat && matchTags;
    });
  }, [postLists, searchText, activeCategory, activeTags]);

  const hasFilters = searchText || activeCategory || activeTags.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes cardIn     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerBg  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes panelIn    { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tagPop     { 0%{transform:scale(.85);opacity:0} 70%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }

        .bp-page {
          min-height:100vh;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(224,200,151,.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(200,168,107,.15) 0%, transparent 55%),
            linear-gradient(160deg,#fffdf7 0%,#fdf5e4 40%,#fff9ef 100%);
          font-family:'DM Sans',sans-serif;
          padding:48px 24px 80px;
          position:relative;
          overflow-x:hidden;
        }
        .bp-page::before {
          content:''; position:fixed; inset:0;
          background-image:radial-gradient(circle,rgba(200,168,107,.12) 1px,transparent 1px);
          background-size:28px 28px; pointer-events:none; z-index:0;
        }
        .bp-page::after {
          content:''; position:fixed; top:-120px; right:-120px;
          width:420px; height:420px; border-radius:50%;
          background:radial-gradient(circle,rgba(224,200,151,.22) 0%,transparent 70%);
          pointer-events:none; z-index:0; animation:float 8s ease-in-out infinite;
        }

        .bp-container {
          position:relative; z-index:1; max-width:1080px; margin:0 auto;
          opacity:0; transform:translateY(20px);
          transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1);
        }
        .bp-container.visible { opacity:1; transform:translateY(0); }

        /* header */
        .bp-header { margin-bottom:32px; }
        .bp-header-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          font-size:11px; letter-spacing:3px; text-transform:uppercase;
          color:#a07840; font-weight:600; margin-bottom:10px;
        }
        .bp-header-eyebrow::before {
          content:''; display:inline-block; width:24px; height:2px;
          background:linear-gradient(90deg,#e0c897,#c8a86b); border-radius:2px;
        }
        .bp-header h1 {
          font-family:'Playfair Display',serif; font-size:clamp(28px,4vw,42px); font-weight:900;
          background:linear-gradient(135deg,#7a5c2e 0%,#c8a86b 50%,#e0c897 100%);
          background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; line-height:1.1; animation:shimmer 4s linear infinite;
        }
        .bp-header-sub { margin-top:8px; font-size:14px; color:#a07840; letter-spacing:.3px; }
        .bp-header-row {
          display:flex; align-items:flex-end; justify-content:space-between;
          flex-wrap:wrap; gap:16px;
        }
        .bp-badge {
          display:inline-flex; align-items:center; gap:6px; padding:6px 16px;
          border-radius:20px; font-size:13px; font-weight:700;
          background:linear-gradient(135deg,rgba(224,200,151,.25),rgba(200,168,107,.2));
          border:1.5px solid rgba(224,200,151,.55); color:#7a5c2e; white-space:nowrap;
          cursor:pointer; transition:background .18s, border-color .18s;
        }
        .bp-badge:hover { background:rgba(224,200,151,.35); border-color:#c8a86b; }

        .bp-divider {
          height:1.5px;
          background:linear-gradient(90deg,transparent,rgba(224,200,151,.6),transparent);
          border:none; margin-bottom:28px;
        }

        /* ── SEARCH BAR ── */
        .bp-search-block { display:flex; flex-direction:column; gap:12px; margin-bottom:28px; }

        .bp-search-row { display:flex; gap:10px; align-items:stretch; }

        .bp-search-input-wrap {
          flex:1; position:relative; display:flex; align-items:center;
        }
        .bp-search-icon {
          position:absolute; left:14px; font-size:16px; color:#c8a86b; pointer-events:none;
        }
        .bp-search-input {
          width:100%; padding:12px 40px 12px 42px;
          border:1.5px solid rgba(224,200,151,.55); border-radius:12px;
          background:rgba(255,255,255,.85); font-size:14px; color:#2a1f0e;
          font-family:'DM Sans',sans-serif; outline:none;
          transition:border-color .2s, box-shadow .2s;
          backdrop-filter:blur(6px);
        }
        .bp-search-input::placeholder { color:rgba(160,120,64,.4); }
        .bp-search-input:focus {
          border-color:#c8a86b;
          box-shadow:0 0 0 4px rgba(224,200,151,.2), 0 4px 14px rgba(160,120,64,.1);
        }
        .bp-search-clear {
          position:absolute; right:12px; background:none; border:none;
          color:#c8a86b; font-size:16px; cursor:pointer; padding:2px 5px;
          border-radius:6px; transition:background .15s;
        }
        .bp-search-clear:hover { background:rgba(224,200,151,.25); }

        .bp-tag-toggle-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:12px 20px; border:1.5px solid rgba(224,200,151,.55);
          border-radius:12px; background:rgba(255,255,255,.85);
          font-size:13px; font-weight:600; color:#a07840;
          cursor:pointer; white-space:nowrap; font-family:'DM Sans',sans-serif;
          transition:border-color .2s, background .18s;
          backdrop-filter:blur(6px);
        }
        .bp-tag-toggle-btn:hover { border-color:#c8a86b; background:rgba(224,200,151,.15); }
        .bp-tag-toggle-btn.active {
          border-color:#c8a86b; background:rgba(224,200,151,.2); color:#7a5c2e;
        }
        .bp-tag-toggle-dot {
          width:7px; height:7px; border-radius:50%;
          background:linear-gradient(135deg,#e0c897,#c8a86b);
          box-shadow:0 0 5px rgba(224,200,151,.7);
        }

        /* category chips */
        .bp-cat-row { display:flex; gap:8px; flex-wrap:wrap; }
        .bp-cat-chip {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 16px; border-radius:20px; font-size:12px; font-weight:600;
          border:1.5px solid rgba(224,200,151,.45); background:rgba(253,248,239,.7);
          color:#a07840; cursor:pointer; transition:all .18s cubic-bezier(.22,1,.36,1);
          user-select:none;
        }
        .bp-cat-chip:hover { border-color:#c8a86b; background:rgba(224,200,151,.2); transform:translateY(-1px); }
        .bp-cat-chip.active {
          background:linear-gradient(135deg,#e0c897,#c8a86b);
          border-color:transparent; color:#2a1f0e;
          box-shadow:0 3px 10px rgba(160,120,64,.3);
        }

        /* tag panel */
        .bp-tag-panel {
          background:rgba(255,255,255,.9); border:1.5px solid rgba(224,200,151,.5);
          border-radius:16px; padding:18px 20px;
          box-shadow:0 8px 28px rgba(160,120,64,.12);
          backdrop-filter:blur(10px);
          animation:panelIn .22s cubic-bezier(.22,1,.36,1) both;
        }
        .bp-tag-panel-label {
          font-size:10px; letter-spacing:2px; text-transform:uppercase;
          color:#a07840; font-weight:600; margin-bottom:10px;
        }
        .bp-tag-grid { display:flex; flex-wrap:wrap; gap:7px; }
        .bp-tag {
          padding:5px 13px; border-radius:20px; font-size:12px; font-weight:600;
          border:1.5px solid rgba(224,200,151,.45); background:rgba(253,248,239,.7);
          color:#a07840; cursor:pointer;
          transition:all .18s cubic-bezier(.22,1,.36,1); user-select:none;
        }
        .bp-tag:hover { border-color:#c8a86b; background:rgba(224,200,151,.2); transform:translateY(-1px); }
        .bp-tag.active {
          background:linear-gradient(135deg,#e0c897,#c8a86b);
          border-color:transparent; color:#2a1f0e;
          box-shadow:0 3px 10px rgba(160,120,64,.3);
          animation:tagPop .25s cubic-bezier(.22,1,.36,1);
        }

        /* active filter summary */
        .bp-filter-summary {
          display:flex; align-items:center; gap:8px; flex-wrap:wrap;
        }
        .bp-filter-label { font-size:12px; color:#a07840; font-weight:500; }
        .bp-filter-chip {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600;
          background:rgba(224,200,151,.25); border:1px solid rgba(224,200,151,.5);
          color:#7a5c2e;
        }
        .bp-filter-chip button {
          background:none; border:none; cursor:pointer; color:#a07840;
          font-size:13px; padding:0 0 0 2px; line-height:1;
        }
        .bp-clear-all {
          margin-left:auto; font-size:12px; color:#c8a86b; background:none;
          border:none; cursor:pointer; font-weight:600; font-family:'DM Sans',sans-serif;
          text-decoration:underline; text-underline-offset:2px;
          transition:color .15s;
        }
        .bp-clear-all:hover { color:#a07840; }

        /* result count */
        .bp-result-count {
          font-size:12px; color:rgba(160,120,64,.7); font-weight:500; margin-bottom:20px;
        }

        /* grid & cards */
        .bp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:24px; }
        .bp-card {
          background:rgba(255,255,255,.85); backdrop-filter:blur(10px);
          border:1.5px solid rgba(224,200,151,.45); border-radius:20px; overflow:hidden;
          box-shadow:0 4px 20px rgba(160,120,64,.09), 0 1px 0 rgba(255,255,255,.9) inset;
          cursor:pointer;
          transition:transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s, border-color .2s;
          animation:cardIn .5s cubic-bezier(.22,1,.36,1) both;
        }
        .bp-card:hover {
          transform:translateY(-4px);
          box-shadow:0 12px 36px rgba(160,120,64,.18), 0 1px 0 rgba(255,255,255,.9) inset;
          border-color:rgba(200,168,107,.7);
        }
        .bp-thumb {
          width:100%; aspect-ratio:16/9; overflow:hidden; position:relative;
          background:linear-gradient(135deg,#f0e4c0,#e8d5a8);
        }
        .bp-thumb img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition:transform .4s cubic-bezier(.22,1,.36,1);
        }
        .bp-card:hover .bp-thumb img { transform:scale(1.04); }
        .bp-thumb-placeholder {
          width:100%; height:100%; display:flex; align-items:center; justify-content:center;
          background:
            repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(224,200,151,.08) 10px,rgba(224,200,151,.08) 20px),
            linear-gradient(135deg,#fdf3e0,#f5e4bb);
          font-size:40px; opacity:.7;
        }
        .bp-thumb-ribbon {
          position:absolute; bottom:10px; left:12px;
          display:inline-flex; align-items:center; gap:5px; padding:4px 12px;
          border-radius:14px; font-size:11px; font-weight:700; letter-spacing:.5px;
          background:rgba(253,248,239,.92); border:1px solid rgba(224,200,151,.6); color:#7a5c2e;
          backdrop-filter:blur(4px); box-shadow:0 2px 8px rgba(42,31,14,.12);
        }
        .bp-body { padding:18px 20px 20px; display:flex; flex-direction:column; gap:10px; }
        .bp-title {
          font-family:'Playfair Display',serif; font-size:17px; font-weight:700;
          color:#2a1f0e; line-height:1.35;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bp-card-tags { display:flex; flex-wrap:wrap; gap:5px; }
        .bp-card-tag {
          padding:2px 9px; border-radius:10px; font-size:10px; font-weight:600;
          background:rgba(224,200,151,.2); border:1px solid rgba(224,200,151,.4); color:#a07840;
        }
        .bp-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .bp-author { display:flex; align-items:center; gap:6px; font-size:12px; color:#a07840; font-weight:500; }
        .bp-author-dot {
          width:22px; height:22px; border-radius:50%;
          background:linear-gradient(135deg,#e0c897,#c8a86b);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:800; color:#2a1f0e; flex-shrink:0;
        }
        .bp-date { font-size:11px; color:rgba(160,120,64,.6); white-space:nowrap; }

        /* skeleton */
        .bp-skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:24px; }
        .bp-skeleton-card {
          background:rgba(255,255,255,.7); border:1.5px solid rgba(224,200,151,.35);
          border-radius:20px; overflow:hidden;
        }
        .bp-skeleton-thumb {
          width:100%; aspect-ratio:16/9;
          background:linear-gradient(90deg,#f5e9ce 25%,#fdf5e4 50%,#f5e9ce 75%);
          background-size:200% 100%; animation:shimmerBg 1.4s ease infinite;
        }
        .bp-skeleton-body { padding:18px 20px 20px; display:flex; flex-direction:column; gap:10px; }
        .bp-skeleton-line {
          height:14px; border-radius:6px;
          background:linear-gradient(90deg,#f5e9ce 25%,#fdf5e4 50%,#f5e9ce 75%);
          background-size:200% 100%; animation:shimmerBg 1.4s ease infinite;
        }

        /* empty */
        .bp-empty {
          grid-column:1/-1; text-align:center; padding:80px 24px;
          display:flex; flex-direction:column; align-items:center; gap:12px;
        }
        .bp-empty-icon { font-size:56px; opacity:.5; }
        .bp-empty-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#a07840; }
        .bp-empty-sub { font-size:14px; color:rgba(160,120,64,.65); }
      `}</style>

      <div className="bp-page">
        <div className={`bp-container ${mounted ? "visible" : ""}`}>

          {/* HEADER */}
          <div className="bp-header">
            <div className="bp-header-row">
              <div>
                <div className="bp-header-eyebrow">Cộng đồng</div>
                <h1>Bài Đăng</h1>
                <p className="bp-header-sub">Khám phá kiến thức và kinh nghiệm từ cộng đồng tranh biện</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                <div className="bp-badge" onClick={() => window.location.pathname = "/createpost"}>
                  <FaPushed /> Tạo bài đăng
                </div>
                {!loading && (
                  <div className="bp-badge" style={{ cursor:"default" }}>
                    <BsFilePost /> {postLists.length} bài đăng
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="bp-divider" />

          {/* ── SEARCH BLOCK ── */}
          <div className="bp-search-block">

            {/* row 1: text input + tag panel toggle */}
            <div className="bp-search-row">
              <div className="bp-search-input-wrap">
                <span className="bp-search-icon">🔍</span>
                <input
                  className="bp-search-input"
                  type="text"
                  placeholder="Tìm kiếm theo tên bài đăng..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                {searchText && (
                  <button className="bp-search-clear" onClick={() => setSearchText("")}>✕</button>
                )}
              </div>
              <button
                className={`bp-tag-toggle-btn ${showTagPanel ? "active" : ""}`}
                onClick={() => setShowTagPanel((v) => !v)}
              >
                {activeTags.length > 0 && <span className="bp-tag-toggle-dot" />}
                🏷 Tags {activeTags.length > 0 ? `(${activeTags.length})` : ""}
              </button>
            </div>

            {/* row 2: category chips */}
            <div className="bp-cat-row">
              <div
                className={`bp-cat-chip ${!activeCategory ? "active" : ""}`}
                onClick={() => setActiveCategory(null)}
              >Tất cả</div>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className={`bp-cat-chip ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                >
                  {CATEGORY_META[cat]?.emoji} {cat}
                </div>
              ))}
            </div>

            {/* tag panel (collapsible) */}
            {showTagPanel && (
              <div className="bp-tag-panel">
                <div className="bp-tag-panel-label">Chọn tags để lọc</div>
                <div className="bp-tag-grid">
                  {TAGS_OPTIONS.map((tag) => (
                    <div
                      key={tag}
                      className={`bp-tag ${activeTags.includes(tag) ? "active" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >{tag}</div>
                  ))}
                </div>
              </div>
            )}

            {/* active filter summary */}
            {hasFilters && (
              <div className="bp-filter-summary">
                <span className="bp-filter-label">Đang lọc:</span>
                {searchText && (
                  <span className="bp-filter-chip">
                    🔍 "{searchText}"
                    <button onClick={() => setSearchText("")}>✕</button>
                  </span>
                )}
                {activeCategory && (
                  <span className="bp-filter-chip">
                    {CATEGORY_META[activeCategory]?.emoji} {activeCategory}
                    <button onClick={() => setActiveCategory(null)}>✕</button>
                  </span>
                )}
                {activeTags.map((t) => (
                  <span key={t} className="bp-filter-chip">
                    🏷 {t}
                    <button onClick={() => toggleTag(t)}>✕</button>
                  </span>
                ))}
                <button className="bp-clear-all" onClick={clearFilters}>Xoá tất cả</button>
              </div>
            )}
          </div>

          {/* result count */}
          {!loading && hasFilters && (
            <div className="bp-result-count">
              Tìm thấy <strong>{filtered.length}</strong> / {postLists.length} bài đăng
            </div>
          )}

          {/* GRID */}
          {loading ? (
            <div className="bp-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div className="bp-skeleton-card" key={i}>
                  <div className="bp-skeleton-thumb" style={{ animationDelay:`${i*.1}s` }} />
                  <div className="bp-skeleton-body">
                    <div className="bp-skeleton-line" style={{ width:"80%", animationDelay:`${i*.1+.1}s` }} />
                    <div className="bp-skeleton-line" style={{ width:"55%", animationDelay:`${i*.1+.2}s` }} />
                    <div className="bp-skeleton-line" style={{ width:"35%", height:10, animationDelay:`${i*.1+.3}s` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bp-grid">
              {filtered.length === 0 ? (
                <div className="bp-empty">
                  <div className="bp-empty-icon">{hasFilters ? "🔎" : "📭"}</div>
                  <div className="bp-empty-title">
                    {hasFilters ? "Không tìm thấy bài đăng nào" : "Chưa có bài đăng nào"}
                  </div>
                  <div className="bp-empty-sub">
                    {hasFilters ? "Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm." : "Hãy là người đầu tiên chia sẻ với cộng đồng!"}
                  </div>
                </div>
              ) : (
                filtered.map((post, i) => {
                  const catMeta = CATEGORY_META[post.category] || { emoji: "📄" };
                  const initials = post.author?.name ? post.author.name.charAt(0).toUpperCase() : "?";
                  const dateStr = post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" })
                    : "";

                  return (
                    <div className="bp-card" key={post.id} style={{ animationDelay:`${i*.07}s` }} onClick={() => navigate(`/post/${post.id}`)}>
                      <div className="bp-thumb">
                        {post.fileExt
                          ? <img src={post.imageUrl} alt={post.title} />
                          : <div className="bp-thumb-placeholder">{catMeta.emoji}</div>
                        }
                        {post.category && (
                          <div className="bp-thumb-ribbon">{catMeta.emoji} {post.category}</div>
                        )}
                      </div>
                      <div className="bp-body">
                        <div className="bp-title">{post.title || "Không có tiêu đề"}</div>
                        {post.tags?.length > 0 && (
                          <div className="bp-card-tags">
                            {post.tags.slice(0, 3).map((t) => (
                              <span key={t} className="bp-card-tag">{t}</span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="bp-card-tag">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="bp-meta">
                          <div className="bp-author">
                            <div className="bp-author-dot">{initials}</div>
                            {post.author?.name || "Ẩn danh"}
                          </div>
                          {dateStr && <div className="bp-date">{dateStr}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Blogpage;