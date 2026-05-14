import { useState, useRef } from "react";


const DEBATES_CLOUD_RUN_BASE_URL = "http://127.0.0.1:8080";
const DEBATES_GCS_BUCKET_NAME = "debates-audio-bucket";

export default function DebatesAI() {
  const [fileName, setFileName] = useState("");
  const [topic, setTopic] = useState("");
  const [participants, setParticipants] = useState(2);
  const [analysisResult, setAnalysisResult] = useState("Chưa có dữ liệu");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const audioFileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      audioFileRef.current = file;
    }
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
    if (isNaN(participants) || participants < 1 || participants > 6) {
      setErrorMessage("Số lượng người tham gia phải từ 1 đến 6.");
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

      if (!uploadResponse.ok) {
        throw new Error(`Lỗi khi tải file lên GCS: ${uploadResponse.statusText}`);
      }

      const payload = { file_name: uniqueFileName, topic, participants };
      const processResponse = await fetch(`${DEBATES_CLOUD_RUN_BASE_URL}/process_audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(`Lỗi khi xử lý âm thanh: ${errorData.error || processResponse.statusText}`);
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
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Upload Section */}
        <div style={styles.uploadSection} onClick={() => fileInputRef.current.click()}>
          <div style={styles.uploadIcon}>📄</div>
          <p style={styles.uploadText}>Tải lên file của bạn ở đây</p>
          {fileName && <p style={styles.fileNameText}>{fileName}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {/* Input Row */}
        <div style={styles.inputRow}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Nhập chủ đề Tranh Biện"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={{ flex: "0 0 150px" }}>
            <input
              type="number"
              placeholder="Số người"
              min={1}
              max={6}
              value={participants}
              onChange={(e) => setParticipants(parseInt(e.target.value))}
              style={styles.input}
            />
          </div>
        </div>

        {/* Analyze Button */}
        <button style={styles.analyzeButton} onClick={processDebatesAudio}>
          Bắt đầu phân tích
        </button>

        {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
        {loading && <div style={styles.loading}>Đang xử lý...</div>}

        {/* Divider */}
        <div style={styles.dividerWrapper}>
          <hr style={styles.divider} />
          <span style={styles.dividerText}>Kết quả</span>
        </div>

        {/* Results Section */}
        <div style={styles.resultsWrapper}>
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div style={styles.resultLogo}>
                <img src="./src/assets/red-ai-logo.jpg" alt="red ai logo" className="w-full h-full object-contain" />
              </div>
              <h3 style={styles.resultTitle}>Kết quả phân tích chi tiết</h3>
            </div>
            <div style={styles.resultContent}>{analysisResult}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    color: "#333",
    padding: "40px 20px",
  },
  wrapper: {
    maxWidth: 1150,
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  uploadSection: {
    backgroundColor: "#fff",
    padding: 40,
    textAlign: "center",
    border: "3px dashed #d4914e",
    borderRadius: 12,
    margin: 30,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  uploadIcon: { fontSize: 64, color: "#d4914e", marginBottom: 15 },
  uploadText: { fontSize: 20, fontWeight: "bold", color: "#d4914e", margin: 0 },
  fileNameText: { fontSize: 14, color: "#666", marginTop: 10 },
  inputRow: {
    display: "flex",
    gap: 15,
    padding: "0 30px 30px 30px",
    alignItems: "flex-end",
  },
  input: {
    width: "100%",
    padding: 12,
    border: "2px solid #ddd",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
    boxSizing: "border-box",
    outline: "none",
  },
  analyzeButton: {
    backgroundColor: "#d4914e",
    color: "white",
    padding: "14px 40px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 18,
    fontWeight: "bold",
    width: "calc(100% - 60px)",
    margin: "0 30px 30px 30px",
    transition: "all 0.3s ease",
  },
  errorMessage: { color: "red", fontWeight: "bold", textAlign: "center", margin: "15px 30px" },
  loading: { textAlign: "center", margin: 20, fontSize: "1.2em", color: "#d4914e", fontWeight: "bold" },
  dividerWrapper: { position: "relative", margin: "30px 30px" },
  divider: { border: "none", borderTop: "2px solid #d4914e" },
  dividerText: {
    position: "absolute",
    top: -15,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#fff",
    padding: "0 20px",
    fontSize: 24,
    fontWeight: "bold",
    color: "#d4914e",
  },
  resultsWrapper: { padding: "0 30px 30px 30px" },
  resultCard: { backgroundColor: "#fff", border: "2px solid #ddd", borderRadius: 8, padding: 20, marginBottom: 20 },
  resultHeader: { display: "flex", alignItems: "center", gap: 15, marginBottom: 15 },
  resultLogo: {
    width: 60, height: 60, backgroundColor: "#8b4513", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  resultLogoText: { color: "#fff", fontWeight: "bold", fontSize: 14, textAlign: "center", lineHeight: 1.2 },
  resultTitle: { fontSize: 18, fontWeight: "bold", color: "#333", margin: 0 },
  resultContent: {
    backgroundColor: "#f9f9f9", padding: 15, borderRadius: 6,
    whiteSpace: "pre-wrap", wordWrap: "break-word", maxHeight: 400,
    overflowY: "auto", fontSize: 14, lineHeight: 1.6, color: "#555",
  },
};