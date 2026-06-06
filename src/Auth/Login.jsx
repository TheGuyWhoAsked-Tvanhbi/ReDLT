import React, { useState } from "react";
import { useAuth } from "/src/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { login , signup} = useAuth();

  const switchMode = (registerMode) => {
    setIsFading(true);
    setTimeout(() => {
      setIsRegister(registerMode);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setIsFading(false);
    }, 150);
  };

  const navigate = useNavigate();

  async function handleLogin(e) {
    setError("");
    try {
      await login(email, password);
      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      setError(firebaseErrorMessage(error.code));
    }
  }

  async function handleRegister(e) {
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      await signup(email, password);
      switchMode(false);
    } catch (error) {
      setError(firebaseErrorMessage(error.code));
    }
  }

  function firebaseErrorMessage(code) {
    switch (code) {
      case "auth/invalid-email":
        return "Email không hợp lệ.";
      case "auth/user-not-found":
        return "Không tìm thấy tài khoản với email này.";
      case "auth/wrong-password":
        return "Mật khẩu không đúng.";
      case "auth/email-already-in-use":
        return "Email này đã được sử dụng.";
      case "auth/weak-password":
        return "Mật khẩu phải có ít nhất 6 ký tự.";
      case "auth/too-many-requests":
        return "Quá nhiều lần thử. Vui lòng thử lại sau.";
      case "auth/network-request-failed":
        return "Lỗi kết nối mạng. Vui lòng kiểm tra lại.";
      case "auth/invalid-credential":
        return "Email hoặc mật khẩu không đúng.";
      default:
        return "Đã có lỗi xảy ra. Vui lòng thử lại.";
    }
  }

  const cardStyle = {
    ...styles.card,
    opacity: isFading ? 0 : 1,
    transition: "opacity 0.15s ease",
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.logoBox}>
          <img
            src='/assets/logo.png'
            alt="logo"
            style={styles.logoImage}
          />
        </div>
        <div style={cardStyle}>
          <h2 style={styles.title}>{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</h2>

          {isRegister ? (
            <>
              <label style={styles.label} htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="Nhập email của bạn"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label style={styles.label} htmlFor="reg-password">Mật khẩu</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label style={styles.label} htmlFor="confirm-password">Xác nhận mật khẩu</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Nhập lại mật khẩu của bạn"
                style={{
                  ...styles.input,
                  marginBottom: "6px",
                  borderColor: error ? "#e53e3e" : "#d1d5db",
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div style={styles.errorHolder}>
                {error && <span style={styles.errorText}>⚠ {error}</span>}
              </div>

              <div style={styles.accountRow}>
                <button type="button" style={styles.linkButton} onClick={() => switchMode(false)}>
                  Đã có tài khoản?
                </button>
              </div>

              <button type="button" style={styles.loginButton} onClick={handleRegister}>
                <b>Đăng ký</b>
              </button>
            </>
          ) : (
            <>
              <label style={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label style={styles.label} htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                style={{
                  ...styles.input,
                  marginBottom: "6px",
                  borderColor: error ? "#e53e3e" : "#d1d5db",
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div style={styles.errorHolder}>
                {error && <span style={styles.errorText}>⚠ {error}</span>}
              </div>

              <div style={styles.linkRow}>
                <button type="button" style={styles.linkButton}>
                  Quên mật khẩu?
                </button>
                <button type="button" style={styles.linkButton} onClick={() => switchMode(true)}>
                  Tạo tài khoản
                </button>
              </div>

              <button type="button" style={styles.loginButton} onClick={handleLogin}>
                <b>Đăng nhập</b>
              </button>
            </>
          )}
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.sideBox}>
          <img
            src="https://brand.fsu.edu/sites/g/files/upcbnu4656/files/brand/placeholders/ratio-4-5.png"
            alt="side"
            style={styles.sideBoxImage}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    backgroundImage: `linear-gradient(135deg, rgba(251,238,194,0.7), rgba(255,255,255,0.7)), url("https://t3.ftcdn.net/jpg/03/73/78/44/360_F_373784438_lEuzytWcTtLRdZ9CFks7I81yG3lOiSWK.jpg")`,
    backgroundRepeat: 'repeat',
    backgroundColor: "#f4f6fb",
    padding: "16px",
    fontFamily: "sans-serif",
  },
  left: {
    width: "40%",
    minWidth: "320px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  right: {
    width: "40%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  sideBox: {
    height: "80vh",
    aspectRatio: "4 / 5",
    backgroundColor: "#FBEEC2",
    borderRadius: "32px",
  },
  sideBoxImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "32px",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    padding: "32px",
    boxSizing: "border-box",
  },
  logoBox: {
    width: "30%",
    height: "30%",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "24px",
    flexDirection: "row",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "50%",
  },
  title: {
    margin: "0 0 24px",
    fontSize: "24px",
    color: "#1f2937",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#4b5563",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "18px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  errorHolder: {
    minHeight: "20px",
    marginBottom: "14px",
  },
  errorText: {
    fontSize: "13px",
    color: "#e53e3e",
    lineHeight: "1.4",
  },
  linkRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  accountRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "24px",
  },
  linkButton: {
    border: "none",
    background: "none",
    color: "#CEAF64",
    fontSize: "14px",
    cursor: "pointer",
    padding: "0",
  },
  loginButton: {
    width: "100%",
    padding: "14px 0",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#b48d30",
    color: "#ffffff",
    fontSize: "25px",
    cursor: "pointer",
  },
};

export default Login;
