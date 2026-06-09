import { useState, useEffect, useRef } from "react";

const GOLD = "#e0c897";
const GOLD_DARK = "#c8a96e";
const GOLD_LIGHT = "#f5e8c8";
const CREAM = "#fdf8ef";
const BROWN = "#7a5c2e";
const WARM_WHITE = "#fffdf8";

// 👇 Dán URL hoặc đường dẫn ảnh nền vào đây (để trống nếu không dùng)
const BG_IMAGE = "";

const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const calDates = [
  [null, null, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, null, null, null],
];
const events = { 3: "test 1", 10: "test 2", 17: "test 3", 24: "test 4" };

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function App() {
  const [activeDate, setActiveDate] = useState(15);
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [calRef, calVisible] = useInView(0.1);
  const [connRef, connVisible] = useInView(0.2);
  const [cardsRef, cardsVisible] = useInView(0.1);

  const handleItemClick = (item) => {
    if (item.label === "Ngẫu nhiên chủ đề") {
      window.location.pathname = "/random-topic";
    }
    else if (item.label === "AI chấm tranh biện") {
      window.location.pathname = "/ai-scores";
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      fontFamily: "'Playfair Display', 'Georgia', serif",
      background: `linear-gradient(135deg, ${CREAM} 0%, #fdf3e3 50%, #fef9f0 100%)`,
      minHeight: "100vh",
      overflowX: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cal-day:hover { background: rgba(224,200,151,0.25) !important; cursor: pointer; }
        .cal-day.active { background: linear-gradient(135deg, ${GOLD}, ${GOLD_DARK}) !important; color: #3a2a0a !important; border-radius: 50%; }
        .cal-day.has-event::after {
          content: '';
          display: block;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: ${GOLD_DARK};
          margin: 2px auto 0;
        }
        .cal-day.active.has-event::after { background: rgba(255,255,255,0.8); }

        .feature-card {
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease;
        }

        .glow-dot { animation: gdpulse 3s ease-in-out infinite; }
        @keyframes gdpulse {
          0%,100% { opacity:0.4; transform:scale(1); }
          50% { opacity:0.9; transform:scale(1.2); }
        }

        .diag-pattern {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(224,200,151,0.07) 0px, rgba(224,200,151,0.07) 1px,
            transparent 1px, transparent 12px
          );
        }

        /* ── Entry animations ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(36px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeLeft {
          from { opacity:0; transform:translateX(40px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes fadeScale {
          from { opacity:0; transform:scale(0.88); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 300; opacity:0; }
          to   { stroke-dashoffset: 0;   opacity:0.85; }
        }

        .anim-hero   { animation: fadeDown  0.7s cubic-bezier(.22,.68,0,1.1) both; }
        .anim-cal    { animation: fadeLeft  0.75s cubic-bezier(.22,.68,0,1.1) both; }
        .anim-dot1   { animation: gdpulse 3s ease-in-out infinite, fadeUp 0.5s 0.2s both; }
        .anim-dot2   { animation: gdpulse 3s 1s ease-in-out infinite, fadeUp 0.5s 0.35s both; }
        .anim-dot3   { animation: gdpulse 3s 2s ease-in-out infinite, fadeUp 0.5s 0.5s both; }

        .line-draw {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          opacity: 0;
        }
        .line-draw.visible {
          animation: drawLine 0.9s cubic-bezier(.4,0,.2,1) forwards;
        }

        .card-enter {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.55s cubic-bezier(.22,.68,0,1.1), transform 0.55s cubic-bezier(.22,.68,0,1.1);
        }
        .card-enter.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* ─── BACKGROUND ─── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        {BG_IMAGE && (
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`url(${BG_IMAGE})`,
            backgroundSize:"cover",
            backgroundPosition:"center",
            opacity:0.18,
          }} />
        )}
        <div style={{ position:"absolute", top:-120, right:-120, width:500, height:500, borderRadius:"50%",
          background:`radial-gradient(circle, rgba(224,200,151,0.18) 0%, transparent 70%)` }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:400, height:400, borderRadius:"50%",
          background:`radial-gradient(circle, rgba(200,169,110,0.12) 0%, transparent 70%)` }} />
        <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:0.35 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill={GOLD} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* ─── HERO + CALENDAR ─── */}
      <section style={{ position:"relative", zIndex:1 }}>

        {/* Hero bg — slides down on mount */}
        <div
          className={mounted ? "anim-hero" : ""}
          style={{
            position:"relative",
            background:`linear-gradient(135deg, #c0392b 0%, #e74c3c 35%, #e8623a 65%, ${GOLD_DARK} 100%)`,
            minHeight:320,
            clipPath:"polygon(0 0, 100% 0, 100% 72%, 0 100%)",
            overflow:"hidden",
            opacity: mounted ? undefined : 0,
          }}>
          <div className="diag-pattern" style={{ position:"absolute", inset:0, opacity:0.5 }} />
          <svg style={{ position:"absolute", bottom:0, left:0, width:"100%", height:"100%", pointerEvents:"none" }}
            viewBox="0 0 1000 320" preserveAspectRatio="none">
            <path d="M 0,300 Q 600,380 1000,60" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />
            <path d="M 0,270 Q 500,340 1000,30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          </svg>
          <div className={mounted ? "anim-dot1" : ""} style={{ position:"absolute", top:30, left:"15%", width:10, height:10, borderRadius:"50%", background:"rgba(255,255,255,0.6)" }} />
          <div className={mounted ? "anim-dot2" : ""} style={{ position:"absolute", top:80, left:"30%", width:6, height:6, borderRadius:"50%", background:"rgba(255,220,150,0.8)" }} />
          <div className={mounted ? "anim-dot3" : ""} style={{ position:"absolute", bottom:80, left:"8%", width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,0.5)" }} />
        </div>

        {/* Calendar — slides in from right */}
        <div
          ref={calRef}
          className={calVisible ? "anim-cal" : ""}
          style={{
            position:"absolute", top:28, right:"5%", width:"65%",
            background:WARM_WHITE,
            borderRadius:20,
            border:`1.5px solid rgba(122,92,46,0.15)`,
            boxShadow:`0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(122,92,46,0.12)`,
            overflow:"hidden",
            zIndex:10,
            opacity: calVisible ? undefined : 0,
            animationDelay: "0.25s",
          }}>
          <div style={{ background:`linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)`, padding:"18px 22px 14px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, opacity:0.06 }}>
              <svg width="100%" height="100%">
                <defs><pattern id="cal-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={GOLD}/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#cal-dots)"/>
              </svg>
            </div>
            <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>Lịch</div>
                <div style={{ color:"#fff", fontSize:18, fontWeight:700 }}>Tháng 6, 2025</div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:28, height:28, borderRadius:8, cursor:"pointer", fontSize:14 }}>‹</button>
                <button style={{ background:`linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`, border:"none", color:BROWN, width:28, height:28, borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:700 }}>›</button>
              </div>
            </div>
          </div>

          <div style={{ padding:"14px 18px 18px", display:"flex", gap:20 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", marginBottom:6 }}>
                {days.map(d => (
                  <div key={d} style={{ textAlign:"center", fontSize:10, color:GOLD_DARK, fontWeight:600, fontFamily:"'DM Sans',sans-serif", padding:"3px 0", letterSpacing:"0.04em" }}>{d}</div>
                ))}
              </div>
              {calDates.map((week, wi) => (
                <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", marginBottom:1 }}>
                  {week.map((d, di) => (
                    <div key={di}
                      className={`cal-day${d === activeDate ? " active" : ""}${d && events[d] ? " has-event" : ""}`}
                      onClick={() => d && setActiveDate(d)}
                      style={{
                        textAlign:"center", padding:"9px 2px", fontSize:13,
                        fontFamily:"'DM Sans',sans-serif",
                        color: d ? (d === activeDate ? "#3a2a0a" : "#3a3a3a") : "transparent",
                        fontWeight: d === activeDate ? 700 : 400,
                        borderRadius:8, transition:"all 0.2s",
                        background: d === activeDate ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})` : "transparent",
                      }}
                    >{d || ""}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ width:160, flexShrink:0, display:"flex", flexDirection:"column", gap:8, paddingLeft:16, borderLeft:`1px solid rgba(224,200,151,0.35)` }}>
              <div style={{ fontSize:10, color:GOLD_DARK, fontFamily:"'DM Sans',sans-serif", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Sự kiện</div>
              {Object.entries(events).map(([d, ev]) => (
                <div key={d} onClick={() => setActiveDate(Number(d))} style={{
                  padding:"8px 10px", borderRadius:10, cursor:"pointer",
                  background: Number(d) === activeDate ? `linear-gradient(135deg, ${GOLD_LIGHT}, rgba(224,200,151,0.3))` : "rgba(0,0,0,0.03)",
                  borderLeft:`3px solid ${Number(d) === activeDate ? GOLD_DARK : "rgba(200,169,110,0.3)"}`,
                  transition:"all 0.2s",
                }}>
                  <div style={{ fontSize:10, color:GOLD_DARK, fontFamily:"'DM Sans',sans-serif", fontWeight:700, marginBottom:2 }}>Ngày {d}</div>
                  <div style={{ fontSize:12, color:BROWN, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{ev}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ORANGE CONNECTOR ─── */}
      <div ref={connRef} style={{ position:"relative", height:100, overflow:"visible", marginTop:20 }}>
        <svg width="100%" height="100" viewBox="0 0 1000 100" preserveAspectRatio="none"
          style={{ position:"absolute", top:0, left:0 }}>
          <path
            className={`line-draw${connVisible ? " visible" : ""}`}
            d="M 160,10 Q 240,70 340,85"
            fill="none" stroke="#e8923a" strokeWidth="2.2" strokeLinecap="round"
            style={{ animationDelay:"0s" }}
          />
          <path
            className={`line-draw${connVisible ? " visible" : ""}`}
            d="M 660,85 Q 760,65 860,10"
            fill="none" stroke="#e8923a" strokeWidth="2.2" strokeLinecap="round"
            style={{ animationDelay:"0.18s" }}
          />
          <circle cx="340" cy="85" r="4" fill="#e8923a"
            style={{ opacity: connVisible ? 0.75 : 0, transition:"opacity 0.4s 0.6s" }} />
          <circle cx="660" cy="85" r="4" fill="#e8923a"
            style={{ opacity: connVisible ? 0.75 : 0, transition:"opacity 0.4s 0.78s" }} />
        </svg>
      </div>

      {/* ─── FEATURE CARDS ─── */}
      <section ref={cardsRef} style={{
        padding:"10px 5% 80px",
        maxWidth:1100, margin:"0 auto",
        position:"relative", zIndex:2,
      }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:20, alignItems:"start" }}>
          {[
            { icon:"📋", label:"Ngẫu nhiên chủ đề", desc:"Tạo chủ đề tranh biện ngẫu nhiên cho bạn.", accentLight:"rgba(59,91,219,0.07)", border:"rgba(59,91,219,0.25)", offset:30 },
            { icon:"📊", label:"AI chấm tranh biện", desc:"Sử dụng trí tuệ nhân tạo để chấm điểm tranh biện của bạn.", accentLight:"rgba(59,91,219,0.07)", border:"rgba(59,91,219,0.25)", offset:55 },
          ].map((card, i) => (
            <div
              key={i}
              className={`card-enter${cardsVisible ? " visible" : ""}`}
              onClick={() => handleItemClick(card)}
              style={{
                marginTop: card.offset,
                transitionDelay: `${i * 0.13}s`,
              }}
            >
              <div
                className="feature-card"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: card.featured ? `linear-gradient(145deg, ${WARM_WHITE} 0%, ${GOLD_LIGHT} 100%)` : WARM_WHITE,
                  borderRadius:20,
                  border: card.featured ? `2px solid rgba(224,200,151,0.6)` : `1.5px solid ${card.border}`,
                  padding:"28px 26px",
                  boxShadow: hovered === i
                    ? `0 20px 60px rgba(59,91,219,0.14), 0 4px 16px rgba(0,0,0,0.06)`
                    : card.featured
                      ? `0 8px 32px rgba(200,169,110,0.18), 0 2px 8px rgba(0,0,0,0.04)`
                      : `0 4px 20px rgba(59,91,219,0.07), 0 1px 4px rgba(0,0,0,0.04)`,
                  position:"relative",
                  overflow:"hidden",
                  transform: hovered === i ? "translateY(-8px)" : "translateY(0)",
                }}
              >
                <div style={{
                  position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%",
                  background: card.featured
                    ? `radial-gradient(circle, rgba(224,200,151,0.3) 0%, transparent 70%)`
                    : `radial-gradient(circle, ${card.accentLight} 0%, transparent 70%)`,
                }} />
                <div style={{
                  width:52, height:52, borderRadius:14,
                  background: card.featured ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})` : card.accentLight,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, marginBottom:18,
                  border: card.featured ? "none" : `1px solid ${card.border}`,
                  boxShadow: card.featured ? `0 4px 16px rgba(200,169,110,0.35)` : "none",
                }}>{card.icon}</div>
                <h3 style={{ fontSize:18, fontWeight:700, color:"#1a1a1a", marginBottom:10 }}>{card.label}</h3>
                <p style={{ fontSize:14, color:"#666", fontFamily:"'DM Sans',sans-serif", lineHeight:1.7 }}>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}