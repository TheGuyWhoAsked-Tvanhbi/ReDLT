import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db , storage } from "../firebase.js";

import { BsFilePost } from "react-icons/bs";

function Blogpage() {
  const [postLists, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const postsCollectionRef = collection(db, "posts");

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

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
                } catch (error) {
                    console.error("Lỗi khi lấy URL tải xuống cho bài đăng:", postData.id, error);
                    postData.imageUrl = null; // Đặt null nếu có lỗi
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

  const CATEGORY_META = {
    "Bài đăng": { emoji: "📝", color: "#a07840" },
    "Ván đấu":  { emoji: "⚔️", color: "#7a5c2e" },
    "Tài liệu": { emoji: "📚", color: "#6b4f2a" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        .bp-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%,  rgba(224,200,151,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(200,168,107,0.15) 0%, transparent 55%),
            linear-gradient(160deg, #fffdf7 0%, #fdf5e4 40%, #fff9ef 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 48px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }
        .bp-page::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, rgba(200,168,107,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }
        .bp-page::after {
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

        .bp-container {
          position: relative;
          z-index: 1;
          max-width: 1080px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
        }
        .bp-container.visible { opacity: 1; transform: translateY(0); }

        .bp-header { margin-bottom: 40px; }
        .bp-header-eyebrow {
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
        .bp-header-eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px; height: 2px;
          background: linear-gradient(90deg, #e0c897, #c8a86b);
          border-radius: 2px;
        }
        .bp-header h1 {
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
        .bp-header-sub {
          margin-top: 8px;
          font-size: 14px;
          color: #a07840;
          letter-spacing: 0.3px;
        }
        .bp-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .bp-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          background: linear-gradient(135deg, rgba(224,200,151,0.25), rgba(200,168,107,0.2));
          border: 1.5px solid rgba(224,200,151,0.55);
          color: #7a5c2e;
          white-space: nowrap;
        }

        .bp-divider {
          height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(224,200,151,0.6), transparent);
          border: none;
          margin-bottom: 36px;
        }

        .bp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .bp-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(224,200,151,0.45);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(160,120,64,0.09), 0 1px 0 rgba(255,255,255,0.9) inset;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(.22,1,.36,1), box-shadow 0.22s, border-color 0.2s;
          animation: cardIn 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        .bp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(160,120,64,0.18), 0 1px 0 rgba(255,255,255,0.9) inset;
          border-color: rgba(200,168,107,0.7);
        }

        .bp-thumb {
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #f0e4c0, #e8d5a8);
        }
        .bp-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s cubic-bezier(.22,1,.36,1);
        }
        .bp-card:hover .bp-thumb img { transform: scale(1.04); }
        .bp-thumb-placeholder {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(224,200,151,0.08) 10px, rgba(224,200,151,0.08) 20px),
            linear-gradient(135deg, #fdf3e0, #f5e4bb);
          font-size: 40px;
          opacity: 0.7;
        }
        .bp-thumb-ribbon {
          position: absolute;
          bottom: 10px; left: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: rgba(253,248,239,0.92);
          border: 1px solid rgba(224,200,151,0.6);
          color: #7a5c2e;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(42,31,14,0.12);
        }

        .bp-body {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bp-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: #2a1f0e;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bp-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .bp-author {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #a07840;
          font-weight: 500;
        }
        .bp-author-dot {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0c897, #c8a86b);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: #2a1f0e;
          flex-shrink: 0;
        }
        .bp-date {
          font-size: 11px;
          color: rgba(160,120,64,0.6);
          white-space: nowrap;
        }

        .bp-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .bp-skeleton-card {
          background: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(224,200,151,0.35);
          border-radius: 20px;
          overflow: hidden;
        }
        .bp-skeleton-thumb {
          width: 100%;
          aspect-ratio: 16/9;
          background: linear-gradient(90deg, #f5e9ce 25%, #fdf5e4 50%, #f5e9ce 75%);
          background-size: 200% 100%;
          animation: shimmerBg 1.4s ease infinite;
        }
        .bp-skeleton-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 10px; }
        .bp-skeleton-line {
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f5e9ce 25%, #fdf5e4 50%, #f5e9ce 75%);
          background-size: 200% 100%;
          animation: shimmerBg 1.4s ease infinite;
        }

        .bp-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .bp-empty-icon { font-size: 56px; opacity: 0.5; }
        .bp-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #a07840;
        }
        .bp-empty-sub { font-size: 14px; color: rgba(160,120,64,0.65); }
      `}</style>

      <div className="bp-page">
        <div className={`bp-container ${mounted ? "visible" : ""}`}>

          <div className="bp-header">
            <div className="bp-header-row">
              <div>
                <div className="bp-header-eyebrow">Cộng đồng</div>
                <h1>Bài Đăng</h1>
                <p className="bp-header-sub">Khám phá kiến thức và kinh nghiệm từ cộng đồng tranh biện</p>
              </div>
              {!loading && (
                <div className="bp-count-badge"><BsFilePost /> {postLists.length} bài đăng</div>
              )}
            </div>
          </div>

          <hr className="bp-divider" />

          {loading ? (
            <div className="bp-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div className="bp-skeleton-card" key={i}>
                  <div className="bp-skeleton-thumb" style={{ animationDelay: `${i * 0.1}s` }} />
                  <div className="bp-skeleton-body">
                    <div className="bp-skeleton-line" style={{ width: "80%", animationDelay: `${i * 0.1 + 0.1}s` }} />
                    <div className="bp-skeleton-line" style={{ width: "55%", animationDelay: `${i * 0.1 + 0.2}s` }} />
                    <div className="bp-skeleton-line" style={{ width: "35%", height: 10, animationDelay: `${i * 0.1 + 0.3}s` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bp-grid">
              {postLists.length === 0 ? (
                <div className="bp-empty">
                  <div className="bp-empty-icon">📭</div>
                  <div className="bp-empty-title">Chưa có bài đăng nào</div>
                  <div className="bp-empty-sub">Hãy là người đầu tiên chia sẻ với cộng đồng!</div>
                </div>
              ) : (
                postLists.map((post, i) => {
                  const catMeta = CATEGORY_META[post.category] || { emoji: "📄", color: "#a07840" };
                  const initials = post.author?.name
                    ? post.author.name.charAt(0).toUpperCase()
                    : "?";
                  const dateStr = post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                    : "";

                  return (
                    <div
                      className="bp-card"
                      key={post.id}
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="bp-thumb">
                        {post.fileExt ? (
                          <img src={post.imageUrl} alt={post.title} />
                        ) : (
                          <div className="bp-thumb-placeholder">{catMeta.emoji}</div>
                        )}
                        {post.category && (
                          <div className="bp-thumb-ribbon">
                            {catMeta.emoji} {post.category}
                          </div>
                        )}
                      </div>

                      <div className="bp-body">
                        <div className="bp-title">{post.title || "Không có tiêu đề"}</div>
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