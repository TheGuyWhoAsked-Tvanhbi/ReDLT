import { useState, useRef, useEffect } from "react";

const DEBATES_CLOUD_RUN_BASE_URL = "http://127.0.0.1:8080";
const DEBATES_GCS_BUCKET_NAME = "debates-audio-bucket";

const PARTICIPANT_OPTIONS = [
  { count: 2, icon: "👥" },
  { count: 4, icon: "👨‍👩‍👧‍👦" },
  { count: 6, icon: "🫂" },
];

const HERO_IMG = "/assets/arena_hero_img.jpg";

export default function DebatesAI() {
  const [fileName, setFileName] = useState("");
  const [topic, setTopic] = useState("");
  const [participantIndex, setParticipantIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const audioFileRef = useRef(null);

  const currentParticipant = PARTICIPANT_OPTIONS[participantIndex];
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      audioFileRef.current = file;
    }
  };

  const cycleParticipants = () => {
    setParticipantIndex((prev) => (prev + 1) % PARTICIPANT_OPTIONS.length);
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const processDebatesAudio = async () => {
    const audioFile = audioFileRef.current;
    setErrorMessage("");
    setAnalysisResult("Đang chờ xử lý...");
    setLoading(true);

    if (!audioFile) {
      setErrorMessage("Vui lòng chọn một tệp âm thanh.");
      setLoading(false);
      return;
    }
    if (!topic) {
      setErrorMessage("Vui lòng nhập chủ đề tranh biện.");
      setLoading(false);
      return;
    }

    try {
      const uniqueFileName = `${Date.now()}_${audioFile.name}`;
      const gcsUploadUrl = `https://storage.googleapis.com/${DEBATES_GCS_BUCKET_NAME}/${uniqueFileName}`;
      const uploadResponse = await fetch(gcsUploadUrl, {
        method: "PUT",
        headers: { "Content-Type": audioFile.type },
        body: audioFile,
      });
      if (!uploadResponse.ok) throw new Error(`Lỗi tải file: ${uploadResponse.statusText}`);

      const payload = { file_name: uniqueFileName, topic, participants: currentParticipant.count };
      const processResponse = await fetch(`${DEBATES_CLOUD_RUN_BASE_URL}/process_audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(`Lỗi xử lý: ${errorData.error || processResponse.statusText}`);
      }
      const result = await processResponse.json();
      setAnalysisResult(result.analysis_result || "Không có kết quả phân tích.");
    } catch (error) {
      setErrorMessage(`Đã xảy ra lỗi: ${error.message}`);
      setAnalysisResult("Xảy ra lỗi trong quá trình xử lý.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <style>{`
        @keyframes heroReveal {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .hero-anim {
          animation: heroReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .card-anim {
          animation: cardRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
        }
      `}</style>
      {/* ── HERO BANNER ── */}
      <div style={S.hero} className={mounted ? "hero-anim" : ""} >
        <img src={HERO_IMG} alt="Debates AI" style={S.heroImg} />
        <div style={S.heroOverlay} />
      </div>

      {/* ── CARD (nổi lên che hero) ── */}
      <div style={S.card} className={mounted ? "card-anim" : ""}>

        {/* MAIN ROW */}
        <div style={S.mainRow}>

          {/* LEFT: textarea + participants */}
          <div style={S.leftCol}>
            <div style={S.fieldWrap}>
              <label style={S.label}>Chủ đề tranh biện</label>
              <textarea
                placeholder="Nhập chủ đề tranh biện của bạn..."
                value={topic}
                onChange={handleTopicChange}
                style={S.textarea}
                rows={2}
              />
            </div>

            <div style={S.participantRow}>
              <span style={S.participantLabel}>Số người tham gia</span>
              <div style={S.participantControls}>
                <div style={S.participantBadge}>
                  {currentParticipant.count} người
                </div>
                <button style={S.participantBtn} onClick={cycleParticipants} title="Chuyển số người">
                  <span>{currentParticipant.icon}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: upload */}
          <div style={S.uploadBox} onClick={() => fileInputRef.current.click()}>
            <div style={S.uploadIconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7a5c2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <span style={S.uploadTitle}>Tải lên âm thanh</span>
            <span style={S.uploadSub}>{fileName ? fileName : "MP3 · Nhấn để chọn"}</span>
            <input ref={fileInputRef} type="file" accept="audio/mp3" style={{ display: "none" }} onChange={handleFileChange} />
          </div>

        </div>

        {/* ERROR */}
        {errorMessage && <p style={S.error}>{errorMessage}</p>}

        {/* ANALYZE BUTTON */}
        <button style={{ ...S.btn, opacity: loading ? 0.75 : 1 }} onClick={processDebatesAudio} disabled={loading}>
          {loading
            ? <span style={S.btnInner}><span style={S.spinner} />Đang xử lý...</span>
            : <span style={S.btnInner}>Bắt đầu phân tích</span>
          }
        </button>

        {/* OUTPUT */}
        <div style={S.outputWrap}>
          <div style={S.outputHeader}>
            <span style={S.outputDot} />
            <span style={S.outputTitle}>Kết quả phân tích</span>
          </div>
          <div style={S.outputBody}>
            {analysisResult
              ? <p style={S.outputText}>{analysisResult}</p>
              : <p style={S.outputPlaceholder}>Kết quả sẽ xuất hiện tại đây sau khi phân tích...</p>
            }
          </div>
        </div>

      </div>

      {/* page bottom padding */}
      <div style={{ height: 48 }} />
    </div>
  );
}

/* ─────────── PALETTE ───────────
   gold-warm : #e0c897  #c8a86b  #a07840  #7a5c2e
   cream     : #fdf8ef  #f5edd8  #ede0c4
   dark      : #2a1f0e  #3d2e10  #1a1208
   accent    : #b5893a  (hover/active)
   output bg : #1e1810  (dark parchment)
──────────────────────────────── */
const S = {
  page: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: "linear-gradient(180deg, #f0e0c2 0%, #fffefc 100%)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
  },

  /* ── HERO: 30% chiều dọc ── */
  hero: {
    width: "100%",
    height: "40vh",
    position: "relative",
    flexShrink: 0,
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center 30%",
    display: "block",
    filter: "brightness(0.55) saturate(0.85)",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(26,18,8,0.1) 0%, rgba(26,18,8,0.6) 100%)",
  },

  /* ── CARD: 75% width, lấn lên hero một chút ── */
  card: {
    width: "75%",
    background: "linear-gradient(170deg, #fdf8ef 0%, #f5edd8 100%)",
    borderRadius: 20,
    boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(224,200,151,0.3)",
    padding: "32px 36px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: -32,
    marginBottom: 48,
    position: "relative",
    zIndex: 2,
  },


  /* ── MAIN ROW ── */
  mainRow: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  },
  leftCol: {
    flex: "0 0 68%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#7a5c2e",
    fontFamily: "'Segoe UI', sans-serif",
    fontWeight: 600,
  },
  textarea: {
    width: "100%",
    padding: "13px 16px",
    border: "1.5px solid #c8a86b",
    borderRadius: 10,
    fontSize: 15,
    color: "#2a1f0e",
    background: "rgba(255,255,255,0.7)",
    outline: "none",
    boxSizing: "border-box",
    resize: "none",
    overflow: "hidden",
    lineHeight: 1.65,
    fontFamily: "'Georgia', serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    minHeight: 52,
    boxShadow: "inset 0 1px 3px rgba(160,120,64,0.08)",
  },

  participantRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  participantLabel: {
    fontSize: 12,
    color: "#a07840",
    fontFamily: "'Segoe UI', sans-serif",
    letterSpacing: 0.5,
    marginRight: 4,
  },
  participantControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  participantBadge: {
    background: "linear-gradient(135deg, #f5edd8, #ede0c4)",
    border: "1.5px solid #c8a86b",
    borderRadius: 20,
    padding: "5px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: "#7a5c2e",
    fontFamily: "'Segoe UI', sans-serif",
    whiteSpace: "nowrap",
    userSelect: "none",
    letterSpacing: 0.3,
  },
  participantBtn: {
    background: "linear-gradient(135deg, #fdf8ef, #f0e4c0)",
    border: "1.5px solid #e0c897",
    borderRadius: 10,
    width: 46,
    height: 46,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 20,
    outline: "none",
    boxShadow: "0 2px 8px rgba(160,120,64,0.15)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },

  /* ── UPLOAD ── */
  uploadBox: {
    flex: 1,
    border: "1.5px dashed #c8a86b",
    borderRadius: 12,
    background: "linear-gradient(160deg, rgba(253,248,239,0.9), rgba(237,224,196,0.5))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "16px 12px",
    boxSizing: "border-box",
    gap: 8,
    transition: "border-color 0.2s, background 0.2s",
    minHeight: 110,
  },
  uploadIconWrap: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e0c897, #c8a86b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(160,120,64,0.25)",
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#7a5c2e",
    fontFamily: "'Segoe UI', sans-serif",
    letterSpacing: 0.3,
  },
  uploadSub: {
    fontSize: 11,
    color: "#a07840",
    fontFamily: "'Segoe UI', sans-serif",
    textAlign: "center",
    wordBreak: "break-all",
    lineHeight: 1.4,
  },

  /* ── BUTTON ── */
  btn: {
    background: "linear-gradient(135deg, #a07840 0%, #c8a86b 50%, #e0c897 100%)",
    color: "#2a1f0e",
    border: "none",
    borderRadius: 12,
    padding: "15px 0",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 1,
    width: "100%",
    fontFamily: "'Segoe UI', sans-serif",
    boxShadow: "0 4px 20px rgba(160,120,64,0.35)",
    transition: "opacity 0.2s, transform 0.15s",
    textTransform: "uppercase",
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(42,31,14,0.3)",
    borderTop: "2px solid #2a1f0e",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  error: {
    color: "#8b2e0e",
    fontWeight: 600,
    fontSize: 13,
    margin: 0,
    textAlign: "center",
    fontFamily: "'Segoe UI', sans-serif",
    background: "rgba(180,60,20,0.08)",
    border: "1px solid rgba(180,60,20,0.2)",
    borderRadius: 8,
    padding: "8px 16px",
  },

  /* ── OUTPUT ── */
  outputWrap: {
    border: "1.5px solid #c8a86b",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
  outputHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 20px",
    background: "linear-gradient(90deg, #2a1f0e, #3d2e10)",
    borderBottom: "1px solid rgba(224,200,151,0.2)",
  },
  outputDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e0c897, #c8a86b)",
    boxShadow: "0 0 8px rgba(224,200,151,0.6)",
    flexShrink: 0,
  },
  outputTitle: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#e0c897",
    fontFamily: "'Segoe UI', sans-serif",
    fontWeight: 600,
  },
  outputBody: {
    background: "linear-gradient(170deg, #1e1810, #251c0e)",
    minHeight: 220,
    maxHeight: 380,
    overflowY: "auto",
    padding: "20px 24px",
  },
  outputText: {
    fontSize: 14,
    color: "#e8d9b8",
    lineHeight: 1.85,
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: "'Georgia', serif",
  },
  outputPlaceholder: {
    fontSize: 14,
    color: "rgba(224,200,151,0.3)",
    fontStyle: "italic",
    margin: 0,
    textAlign: "center",
    paddingTop: 72,
    fontFamily: "'Georgia', serif",
    letterSpacing: 0.3,
  },
};