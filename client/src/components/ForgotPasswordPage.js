import { useState } from "react";
import { Phone, Mail, ShieldCheck, ArrowLeft, MessageCircle } from "lucide-react";
import { safeApi } from "../lib/api";
import "./ForgotPasswordPage.css";

const PHONE_REGEX = /^\d{10}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,64}$/;

function ForgotPasswordPage({ onNavigate }) {
  const [phone, setPhone] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phonePassword, setPhonePassword] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [status, setStatus] = useState(null);

  async function sendPhoneOtp() {
    if (!PHONE_REGEX.test(phone)) {
      setStatus("Số điện thoại phải gồm đúng 10 chữ số.");
      return;
    }
    const res = await safeApi("/auth/forgot-password/phone", {
      method: "POST",
      body: JSON.stringify({ phone })
    });
    if (res) {
      setStatus(`Đã gửi OTP tới ${phone}. (Mã có hiệu lực 10 phút)`);
      setPhoneSent(true);
      setPhoneVerified(false);
      setPhoneOtp("");
      setPhonePassword("");
    } else {
      setStatus("Không thể gửi OTP. Vui lòng thử lại sau.");
    }
  }

  async function verifyPhoneOtp() {
    if (phoneOtp.trim().length < 6) {
      setStatus("OTP cần 6 ký tự.");
      return;
    }
    if (!PASSWORD_REGEX.test(phonePassword)) {
      setStatus("Mật khẩu mới cần ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.");
      return;
    }
    const res = await safeApi("/auth/reset-password/phone", {
      method: "POST",
      body: JSON.stringify({ phone, otp: phoneOtp, new_password: phonePassword })
    });
    if (res) {
      setPhoneVerified(true);
      setStatus("Đặt lại mật khẩu thành công cho tài khoản theo số điện thoại.");
    } else {
      setStatus("OTP không hợp lệ hoặc đã hết hạn.");
    }
  }

  async function sendEmailOtp() {
    if (!email.includes("@")) {
      setStatus("Email không hợp lệ.");
      return;
    }
    const res = await safeApi("/auth/forgot-password/email-otp", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    if (res) {
      setEmailSent(true);
      setEmailVerified(false);
      setEmailOtp("");
      setEmailPassword("");
      setStatus(`Đã gửi mã xác thực về ${email}. Vui lòng kiểm tra hộp thư (hiệu lực 10 phút).`);
    } else {
      setStatus("Không thể gửi mã xác thực. Vui lòng thử lại sau.");
    }
  }

  async function verifyEmailOtp() {
    if (emailOtp.trim().length < 6) {
      setStatus("Mã xác thực email cần 6 ký tự.");
      return;
    }
    if (!PASSWORD_REGEX.test(emailPassword)) {
      setStatus("Mật khẩu mới cần ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.");
      return;
    }
    const res = await safeApi("/auth/reset-password/email-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp: emailOtp, new_password: emailPassword })
    });
    if (res) {
      setEmailVerified(true);
      setStatus("Đặt lại mật khẩu qua email thành công.");
    } else {
      setStatus("Mã xác thực không hợp lệ hoặc đã hết hạn.");
    }
  }

  const statusLower = (status ?? "").toLowerCase();
  const statusType = statusLower.includes("thành công") ? "success" : "info";

  return (
    <div className="reset-page">
      <div className="reset-shell">
        <button className="back-link" onClick={() => onNavigate("login")}>
          <ArrowLeft size={18} /> Quay về đăng nhập
        </button>
        <div className="reset-header">
          <div className="badge-row">
            <ShieldCheck size={20} />
            <span className="badge">HealthCare+ Account Recovery</span>
          </div>
          <h1>Khôi phục mật khẩu an toàn</h1>
          <p>
            Chọn kênh xác thực phù hợp để nhận OTP và đặt lại mật khẩu. Hệ thống dùng chuẩn bảo mật kép và ghi
            nhận mọi thao tác trong nhật ký Audit.
          </p>
        </div>
        {status && <div className={`status-banner ${statusType}`}>{status}</div>}
        <div className="reset-grid">
          <section className="reset-card">
            <header>
              <Phone size={28} />
              <div>
                <strong>Qua số điện thoại</strong>
                <span>OTP SMS + xác minh 2 lớp</span>
              </div>
            </header>
            <p>Sử dụng số điện thoại đã đăng ký để nhận mã OTP và thiết lập lại mật khẩu nhanh chóng.</p>
            <div className="reset-form">
              <label>Số điện thoại</label>
              <input
                type="tel"
                className="reset-input"
                placeholder="0901 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phoneSent && <small>Đã gửi OTP, vui lòng nhập mã bên dưới.</small>}
              <label>Mã OTP SMS</label>
              <input
                type="text"
                className="reset-input"
                placeholder="Nhập 6 ký tự"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                disabled={!phoneSent}
              />
              <label>Mật khẩu mới</label>
              <input
                type="password"
                className="reset-input"
                placeholder="Ít nhất 8 ký tự, bao gồm ký tự đặc biệt"
                value={phonePassword}
                onChange={(e) => setPhonePassword(e.target.value)}
                disabled={!phoneSent}
              />
              <div className="reset-actions">
                <button type="button" className="reset-btn primary" onClick={sendPhoneOtp}>
                  Nhận mã OTP
                </button>
                <button
                  type="button"
                  className="reset-btn ghost"
                  onClick={verifyPhoneOtp}
                  disabled={!phoneSent}
                >
                  Xác nhận & đổi mật khẩu
                </button>
              </div>
              {phoneVerified && <small className="status-banner success">Đã đổi mật khẩu bằng OTP điện thoại.</small>}
            </div>
          </section>

          <section className="reset-card">
            <header>
              <Mail size={28} />
              <div>
                <strong>Qua email bảo mật</strong>
                <span>Gửi mã OTP tới hộp thư</span>
              </div>
            </header>
            <p>Nhận mã xác thực qua email và đặt lại mật khẩu với chuẩn bảo mật tương đương cổng thông tin.</p>
            <div className="reset-form">
              <label>Email đã đăng ký</label>
              <input
                type="email"
                className="reset-input"
                placeholder="me@healthcare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailSent && <small>Đã gửi mã xác thực. Vui lòng kiểm tra hộp thư.</small>}
              <label>Mã OTP Email</label>
              <input
                type="text"
                className="reset-input"
                placeholder="Nhập 6 ký tự"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                disabled={!emailSent}
              />
              <label>Mật khẩu mới</label>
              <input
                type="password"
                className="reset-input"
                placeholder="Ít nhất 8 ký tự, bao gồm ký tự đặc biệt"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                disabled={!emailSent}
              />
              <div className="reset-actions">
                <button type="button" className="reset-btn primary" onClick={sendEmailOtp}>
                  Gửi mã xác thực
                </button>
                <button
                  type="button"
                  className="reset-btn ghost"
                  onClick={verifyEmailOtp}
                  disabled={!emailSent}
                >
                  Xác nhận & đổi mật khẩu
                </button>
              </div>
              {emailVerified && <small className="status-banner success">Đã đổi mật khẩu qua email.</small>}
            </div>
          </section>
        </div>

        <div className="reset-support">
          <div>
            <strong>Gặp khó khăn?</strong>
            <p>Đội ngũ Trợ lý số hoạt động 24/7 để hỗ trợ bạn lấy lại quyền truy cập.</p>
          </div>
          <button type="button" onClick={() => onNavigate("support")}>
            <MessageCircle size={18} /> Kết nối chuyên viên
          </button>
        </div>
      </div>
    </div>
  );
}

export { ForgotPasswordPage };
