import { useEffect, useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000/api/v1";

function LoginPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [pendingLogin, setPendingLogin] = useState(false);
  const [pendingRegister, setPendingRegister] = useState(false);
  const { login: authLogin, register: authRegister } = useAuth();

  useEffect(() => {
    function handleMessage(event) {
      if (!API_URL.startsWith(event.origin)) return;
      const data = event.data;
      if (data?.type === "oauth-success") {
        setStatus("Đăng nhập bằng tài khoản xã hội thành công.");
        onNavigate("profile");
      } else if (data?.type === "oauth-error" && data?.message) {
        setErrors([data.message]);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onNavigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const currentErrors = [];
    if (!EMAIL_REGEX.test(loginEmail)) currentErrors.push("Email không hợp lệ.");
    if (!loginPassword) currentErrors.push("Vui lòng nhập mật khẩu.");
    setErrors(currentErrors);
    if (currentErrors.length) return;

    setPendingLogin(true);
    const ok = await authLogin(loginEmail.trim(), loginPassword, { remember: rememberMe });
    setPendingLogin(false);
    if (ok) {
      setStatus("Đăng nhập thành công.");
      onNavigate("profile");
    } else {
      setErrors(["Đăng nhập thất bại. Kiểm tra lại thông tin."]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const registerErrors = [];
    if (!fullName.trim()) registerErrors.push("Họ và tên không được để trống.");
    if (!PHONE_REGEX.test(phone)) registerErrors.push("Số điện thoại phải gồm đúng 10 chữ số.");
    if (!EMAIL_REGEX.test(email)) registerErrors.push("Email không hợp lệ.");
    if (!PASSWORD_REGEX.test(password)) registerErrors.push("Mật khẩu cần ≥8 ký tự, có chữ hoa và chữ số.");
    setErrors(registerErrors);
    if (registerErrors.length) return;

    const parts = fullName.trim().split(/\s+/);
    const last_name = parts.pop() || "";
    const first_name = parts.join(" ") || last_name;

    setPendingRegister(true);
    const ok = await authRegister({ first_name, last_name, phone, email, password });
    setPendingRegister(false);
    if (ok) {
      setStatus("Đăng ký thành công. Chào mừng bạn đến với HealthCare+.");
      onNavigate("profile");
    } else {
      setErrors(["Đăng ký thất bại. Vui lòng thử lại."]);
    }
  };

  function openOAuth(provider) {
    const width = 520;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      `${API_URL.replace("/api/v1", "")}/api/v1/auth/${provider}`,
      `oauth-${provider}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-hero">
          <div className="badge-row">
            <Shield size={20} />
            <span className="badge">HealthCare+ Secure Access</span>
          </div>
          <h1>Tài khoản chăm sóc sức khỏe toàn diện</h1>
          <p>
            Một tài khoản để đặt lịch, quản lý hồ sơ y tế, kết nối bác sĩ và trợ lý AI. Dữ liệu luôn được mã hóa và
            bảo vệ 24/7.
          </p>
        </div>
        <section className="login-panel">
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`login-tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Đăng ký
            </button>
          </div>

          {errors.length > 0 && (
            <div className="alert error">
              <strong>Vui lòng kiểm tra:</strong>
              <ul>
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {status && <div className="alert success">{status}</div>}

          {activeTab === "login" ? (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-field">
                <label>Email đăng nhập</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="nhap@healthcare.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-field form-password">
                <label>Mật khẩu</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="login-meta">
                <label className="remember-checkbox">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" onClick={() => onNavigate("forgot")}>
                  Quên mật khẩu?
                </button>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-btn" disabled={pendingLogin}>
                  {pendingLogin ? "Đang xử lý..." : "Đăng nhập"}
                </button>
                <button type="button" className="secondary-btn" onClick={() => onNavigate("support")}>
                  Cần trợ giúp? Liên hệ HealthCare+
                </button>
              </div>
              <div className="oauth-grid">
                <button type="button" className="oauth-btn" onClick={() => openOAuth("google")}>
                  Đăng nhập Google
                </button>
                <button type="button" className="oauth-btn" onClick={() => openOAuth("facebook")}>
                  Đăng nhập Facebook
                </button>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleRegister}>
              <div className="form-field">
                <label>Họ và tên</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="0901 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Email cá nhân</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="me@healthcare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Tối thiểu 8 ký tự, chữ hoa và số"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <small>Mật khẩu dùng chung cho portal bệnh nhân và ứng dụng di động.</small>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-btn" disabled={pendingRegister}>
                  {pendingRegister ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
                </button>
                <button type="button" className="secondary-btn" onClick={() => onNavigate("home")}>
                  Quay lại trang chủ
                </button>
              </div>
            </form>
          )}

          <div className="login-meta">
            <span>HealthCare+ mã hóa dữ liệu AES-256.</span>
            <button type="button" onClick={() => onNavigate("support")}>
              Liên hệ bác sĩ trực tuyến
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export { LoginPage };
