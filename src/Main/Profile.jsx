import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useParams } from "react-router-dom";

const PLACEHOLDER_IMG = "https://roto-print.com/wp-content/uploads/2025/04/no-image.jpg";
const AVATAR_PLACEHOLDER = "https://i0.wp.com/e-quester.com/wp-content/uploads/2021/11/placeholder-image-person-jpg.jpg?fit=820%2C678&ssl=1";

const ACHIEVEMENTS = [
  { img: "/achv/bd1_img.png", label: "Gu Gu Ga Ga", description: "Đăng tải bài viết hoặc ván đấu hoặc tài liệu đầu tiên.", unlocked: false },
  { img: "/achv/bd2_img.png", label: "Đóng góp to lớn", description: "Đăng tải 10 bài viết hoặc ván đấu hoặc tài liệu.", unlocked: false },
  { img: "/achv/bd2_img.png", label: "Chân không chạm cỏ", description: "Đăng tải 100 bài viết hoặc ván đấu hoặc tài liệu.", unlocked: false },
  { img: "/achv/redeer_img.png", label: "Có con nai kìa!", description: "Tìm thấy Redeer.", unlocked: false },
  { img: "/achv/ma1_img.png", label: "Đã có thành tích!", description: "Tham gia một cuộc thi chính thức và đạt được thành tích.", unlocked: false },
  { img: "/achv/ma2_img.png", label: "Full House", description: "Tham gia 5 cuộc thi chính thức và đạt được thành tích.", unlocked: false },
  { img: "/achv/ma3_img.png", label: "Đỉnh của chóp", description: "Tham gia 10 cuộc thi chính thức và đạt được thành tích.", unlocked: false },
  { img: "/achv/tg1_img.png", label: "Kì cựu", description: "Tham gia ReDLT được 1 năm!", unlocked: false },
  { img: "/achv/tg2_img.png", label: "Hoá thạch sống", description: "Tham gia ReDLT được 2 năm!", unlocked: false },
  { img: "/achv/tg3_img.png", label: "How did Nai get here", description: "Tham gia ReDLT được 3 năm!", unlocked: false },
  { img: "/achv/am1_img.png", label: "Không nick ảo", description: "Sở hữu 3 thành tựu.", unlocked: false },
  { img: "/achv/am2_img.png", label: "Nhà sưu tầm", description: "Sở hữu 6 thành tựu.", unlocked: false },
  { img: "/achv/am3_img.png", label: "Thêm cho tròn!", description: "Sở hữu 9 thành tựu.", unlocked: false },
];

export default function ProfilePage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PLACEHOLDER);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, "userinfo", id));
        if (!userDoc.exists()) return;
        const data = userDoc.data();
        setUserInfo(data);
        if (data.profilepic) {
          try {
            const url = await getDownloadURL(ref(storage, data.profilepic));
            setAvatarUrl(url);
          } catch {
            setAvatarUrl(AVATAR_PLACEHOLDER);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const matchesRaw = userInfo?.matches;
  const matches = Array.isArray(matchesRaw)
    ? matchesRaw
    : matchesRaw && typeof matchesRaw === "object"
      ? Object.values(matchesRaw)
      : [];

  const posted = userInfo?.posted ?? 0;
  const matchCount = matches.length;

  const yearsJoined = (() => {
    if (!userInfo?.createdAt) return 0;
    const joined = userInfo.createdAt.toDate ? userInfo.createdAt.toDate() : new Date(userInfo.createdAt);
    const now = new Date();
    const ms = now - joined;
    return ms / (1000 * 60 * 60 * 24 * 365.25);
  })();

  const computeUnlocked = (label) => {
    switch (label) {
      case "Gu Gu Ga Ga":          return posted >= 1;
      case "Đóng góp to lớn":      return posted >= 10;
      case "Chân không chạm cỏ":   return posted >= 100;
      case "Có con nai kìa!":       return false; // chưa có logic
      case "Đã có thành tích!":    return matchCount >= 1;
      case "Full House":            return matchCount >= 5;
      case "Đỉnh của chóp":        return matchCount >= 10;
      case "Kì cựu":               return yearsJoined >= 1;
      case "Hoá thạch sống":       return yearsJoined >= 2;
      case "How did Nai get here":  return yearsJoined >= 3;
      case "Không nick ảo":        return unlockedCount >= 3;
      case "Nhà sưu tầm":          return unlockedCount >= 6;
      case "Thêm cho tròn!":       return unlockedCount >= 9;
      default:                      return false;
    }
  };

  // Two-pass: compute base unlocks first, then collection achievements
  const baseUnlocked = ACHIEVEMENTS.reduce((acc, { label }) => {
    const isCollection = ["Không nick ảo", "Nhà sưu tầm", "Thêm cho tròn!"].includes(label);
    if (!isCollection) acc[label] = computeUnlocked(label);
    return acc;
  }, {});
  const baseCount = Object.values(baseUnlocked).filter(Boolean).length;
  const unlockedMap = ACHIEVEMENTS.reduce((acc, { label }) => {
    if (label === "Không nick ảo")  acc[label] = baseCount >= 3;
    else if (label === "Nhà sưu tầm") acc[label] = baseCount >= 6;
    else if (label === "Thêm cho tròn!") acc[label] = baseCount >= 9;
    else acc[label] = baseUnlocked[label] ?? false;
    return acc;
  }, {});
  const unlockedCount = Object.values(unlockedMap).filter(Boolean).length;

  const isOwner = auth.currentUser?.uid === id;

  const visibleAchievements = ACHIEVEMENTS
    .filter(({ label }) => unlockedMap[label] || isOwner)
    .sort((a, b) => {
      const aUnlocked = unlockedMap[a.label] ? 1 : 0;
      const bUnlocked = unlockedMap[b.label] ? 1 : 0;
      return bUnlocked - aUnlocked;
    });

  const SHARED_STYLES = `
    body {
      background-color: #faf9f6;
      color: #1a1c1a;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }
    .bg-blob {
      position: fixed; width: 500px; height: 500px;
      filter: blur(80px); opacity: 0.15; z-index: -1;
      border-radius: 50%; pointer-events: none;
    }
    .blob-1 { top: -100px; left: -100px; background-color: #f9e0ad; }
    .blob-2 { top: 40%; right: -200px; background-color: #f0e1c5; }
    .blob-3 { bottom: -100px; left: 20%; background-color: #d1cabe; }
    .glass-card {
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.5);
      box-shadow: 0 8px 32px 0 rgba(110,92,52,0.05);
    }
    .soft-card {
      background: rgba(255,255,255,0.5);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.3);
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .soft-card:hover { background: rgba(255,255,255,0.6); }
  `;

  /* ── LOADING STATE ── */
  if (isLoading) return (
    <>
      <style>{`
        ${SHARED_STYLES}
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg,rgba(224,200,151,0.15) 25%,rgba(224,200,151,0.35) 50%,rgba(224,200,151,0.15) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 12px;
        }
      `}</style>
      <div className="bg-blob blob-1" /><div className="bg-blob blob-2" /><div className="bg-blob blob-3" />
      <main className="pt-24 pb-12 w-full max-w-[1440px] mx-auto px-4 md:px-16 space-y-12 relative" style={{ zIndex: 10 }}>
        <section className="flex flex-col items-center space-y-6">
          <div className="skeleton w-40 h-40 rounded-full" />
          <div className="skeleton w-64 h-10 rounded-xl" />
          <div className="skeleton w-80 h-5 rounded-lg" />
        </section>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 glass-card p-6 rounded-3xl">
          {[1,2,3].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </section>
        <section className="glass-card p-8 rounded-3xl space-y-6">
          <div className="skeleton w-40 h-8 rounded-lg" />
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {Array(8).fill(0).map((_,i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="skeleton w-16 h-16 md:w-20 md:h-20 rounded-full" />
                <div className="skeleton w-14 h-3 rounded" />
              </div>
            ))}
          </div>
        </section>
        <section className="glass-card p-8 rounded-3xl space-y-4">
          <div className="skeleton w-56 h-8 rounded-lg" />
          {[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </section>
      </main>
    </>
  );

  /* ── MAIN RENDER ── */
  return (
    <>
      <style>{`
        ${SHARED_STYLES}
        .achievement-tooltip {
          display: none; position: absolute; bottom: 100%; left: 50%;
          transform: translateX(-50%); margin-bottom: 8px; width: 192px;
          padding: 12px; background: rgba(47,49,47,0.95); backdrop-filter: blur(8px);
          color: #f2f1ee; font-size: 14px; line-height: 20px;
          border-radius: 12px; box-shadow: 0 10px 24px rgba(0,0,0,0.15); z-index: 10;
        }
        .achievement-item:hover .achievement-tooltip { display: block; }
        .achievement-item:hover .achievement-circle { transform: scale(1.1); background: rgba(255,255,255,0.4); }
        .achievement-circle { transition: transform 0.3s ease, background 0.3s ease; background: rgba(255,255,255,0.2); }
        .achievement-locked .achievement-circle { filter: grayscale(1) opacity(0.45); }
        .achievement-locked .achievement-label { color: #7d766a; }
        .achievement-locked:hover .achievement-circle { transform: none; background: rgba(255,255,255,0.2); }
        .stat-card { transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-4px); }
      `}</style>

      <div className="bg-blob blob-1" /><div className="bg-blob blob-2" /><div className="bg-blob blob-3" />

      <main className="pt-24 pb-12 w-full max-w-[1440px] mx-auto px-4 md:px-16 space-y-12 relative" style={{ zIndex: 10 }}>

        {/* Hero */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: "rgba(224,200,151,0.2)" }} />
            <div
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 p-1 shadow-xl"
              style={{ borderColor: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.3)", backdropFilter: "blur(12px)" }}
            >
              <img alt={userInfo?.username || "Avatar"} className="w-full h-full rounded-full object-cover" src={avatarUrl} />
            </div>
          </div>
          <h1 style={{ fontSize: "48px", lineHeight: "56px", fontWeight: 700, letterSpacing: "-0.02em", color: "#1a1c1a" }}>
            {userInfo?.username || "—"}
          </h1>
          {userInfo?.bio && (
            <p style={{ fontSize: "16px", lineHeight: "24px", color: "#4c463b", maxWidth: "480px" }}>
              {userInfo.bio}
            </p>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 glass-card p-6 rounded-3xl">
          {[
            { label: "Số bài đăng",   value: userInfo?.posted ?? "—",        color: "#6e5c34", borderColor: "#6e5c34" },
            { label: "Số thành tựu",  value: unlockedCount,                  color: "#685d48", borderColor: "#685d48" },
            { label: "Ngày tham gia", value: formatDate(userInfo?.createdAt), color: "#1a1c1a", borderColor: "#cfc5b7" },
          ].map(({ label, value, color, borderColor }) => (
            <div
              key={label}
              className="stat-card soft-card p-8 rounded-2xl flex flex-col items-center justify-center space-y-2"
              style={{ borderTop: `4px solid ${borderColor}` }}
            >
              <span style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0.05em", color: "#4c463b", textTransform: "uppercase" }}>
                {label}
              </span>
              <span style={{ fontSize: "40px", lineHeight: "48px", fontWeight: 700, letterSpacing: "-0.02em", color }}>
                {value}
              </span>
            </div>
          ))}
        </section>

        {/* Achievements */}
        <section className="glass-card p-8 rounded-3xl space-y-8">
          <h2 style={{ fontSize: "32px", lineHeight: "40px", fontWeight: 600, letterSpacing: "-0.01em", color: "#1a1c1a" }}>
            Thành tựu
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {visibleAchievements.map(({ img, label, description }) => {
              const unlocked = unlockedMap[label] ?? false;
              return (
              <div key={label} className={`achievement-item group relative flex flex-col items-center gap-2 ${!unlocked ? "achievement-locked" : ""}`}>
                <div
                  className="achievement-circle w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 p-1 backdrop-blur-sm shadow-sm"
                  style={{ borderColor: "rgba(255,255,255,0.6)" }}
                >
                  <img src={img || PLACEHOLDER_IMG} alt={label} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="achievement-label" style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0.05em", color: "#1a1c1a", textAlign: "center" }}>
                  {label}
                </span>
                <div className="achievement-tooltip">{unlocked ? description : "Chưa mở khóa"}</div>
              </div>
            );
          })}
          </div>
        </section>

        {/* Match History */}
        <section className="glass-card p-8 rounded-3xl space-y-6">
          <h2 style={{ fontSize: "32px", lineHeight: "40px", fontWeight: 600, letterSpacing: "-0.01em", color: "#1a1c1a" }}>
            Lịch sử thành tích
          </h2>
          <div className="soft-card rounded-2xl overflow-hidden">
            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-2">
                <span style={{ fontSize: "40px" }}>🏅</span>
                <p style={{ color: "#7d766a", fontSize: "16px" }}>Chưa có thành tích nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                      {["Cuộc thi", "Kết quả", "Ngày"].map((col) => (
                        <th key={col} className="px-6 py-4" style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0.05em", color: "#4c463b", textTransform: "uppercase" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match, i) => (
                      <tr
                        key={i}
                        style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.2)" : "none", transition: "background 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.4)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td className="px-6 py-4" style={{ fontWeight: 500, color: "#1a1c1a" }}>
                          {match.name || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: 700,
                            background: "rgba(110,92,52,0.12)",
                            color: "#6e5c34",
                          }}>
                            {match.result || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: "#4c463b" }}>
                          {formatDate(match.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </main>
    </>
  );
}