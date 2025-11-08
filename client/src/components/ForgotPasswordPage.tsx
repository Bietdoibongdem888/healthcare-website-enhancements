import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Phone, Mail, ShieldCheck, ArrowLeft, MessageCircle, Lock } from "lucide-react";
import { safeApi } from "../lib/api";

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

const PHONE_REGEX = /^\d{10}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,64}$/;

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
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

  const [status, setStatus] = useState<string | null>(null);

  async function sendPhoneOtp() {
    if (!PHONE_REGEX.test(phone)) {
      setStatus("Số điện thoại phải gồm đúng 10 chữ số.");
      return;
    }
    const res = await safeApi('/auth/forgot-password/phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
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
    const res = await safeApi('/auth/reset-password/phone', {
      method: 'POST',
      body: JSON.stringify({ phone, otp: phoneOtp, new_password: phonePassword }),
    });
    if (res) {
      setPhoneVerified(true);
      setStatus("Đặt lại mật khẩu thành công cho tài khoản gắn với số điện thoại của bạn.");
    } else {
      setStatus("OTP không hợp lệ hoặc đã hết hạn.");
    }
  }

  async function sendEmailOtp() {
    if (!email.includes("@")) {
      setStatus("Email không hợp lệ.");
      return;
    }
    const res = await safeApi('/auth/forgot-password/email-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
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
    const res = await safeApi('/auth/reset-password/email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp: emailOtp, new_password: emailPassword }),
    });
    if (res) {
      setEmailVerified(true);
      setStatus("Đặt lại mật khẩu qua email thành công.");
    } else {
      setStatus("Mã xác thực không hợp lệ hoặc đã hết hạn.");
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-12 bg-cover bg-fixed text-white"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(15,23,42,.95), rgba(8,145,178,.85)), url(https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1600&q=80)",
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
          onClick={() => onNavigate("login")}
        >
          <ArrowLeft className="h-4 w-4" /> Quay về đăng nhập
        </button>
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Khôi phục mật khẩu</p>
          <h2 className="text-3xl font-semibold">Chọn phương thức xác thực</h2>
          <p className="text-white/70">Bạn có thể nhận OTP qua số điện thoại hoặc mã bảo mật gửi về Gmail.</p>
        </div>

        {status && (
          <div className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-300" /> {status}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-200">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-cyan-200">Xác thực bằng số điện thoại</p>
                <p className="text-xs text-white/70">Nhận OTP gồm 6 số để xác minh.</p>
              </div>
            </div>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="0123456789"
              maxLength={10}
              className="bg-slate-950/40 border-slate-700 text-white"
            />
            {!phoneSent ? (
              <Button onClick={sendPhoneOtp} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Gửi OTP
              </Button>
            ) : (
              <>
                <Input
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  placeholder="Nhập OTP 6 số"
                  maxLength={6}
                  className="bg-slate-950/40 border-slate-700 text-white"
                />
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-200" />
                  <p className="text-xs text-white/70">Nhập mật khẩu mới đáp ứng yêu cầu bảo mật.</p>
                </div>
                <Input
                  type="password"
                  value={phonePassword}
                  onChange={(e) => setPhonePassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="bg-slate-950/40 border-slate-700 text-white"
                />
                <Button variant="outline" className="border-cyan-500 text-cyan-300" onClick={verifyPhoneOtp}>
                  Xác nhận OTP & đặt lại
                </Button>
                {phoneVerified && <p className="text-xs text-emerald-400">Đặt lại mật khẩu thành công qua số điện thoại.</p>}
              </>
            )}
          </Card>

          <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-200">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-rose-200">Xác thực bằng Gmail</p>
                <p className="text-xs text-white/70">HealthCare+ gửi mã xác nhận vào hòm thư của bạn.</p>
              </div>
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@healthcare.vn"
              className="bg-slate-950/40 border-slate-700 text-white"
            />
            {!emailSent ? (
              <Button onClick={sendEmailOtp} className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white">
                Gửi mã xác nhận
              </Button>
            ) : (
              <>
                <p className="text-xs text-white/70">Đã gửi mã về Gmail của quý khách. Vui lòng kiểm tra thư đến hoặc thư rác.</p>
                <Input
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Nhập mã xác nhận"
                  maxLength={6}
                  className="bg-slate-950/40 border-slate-700 text-white"
                />
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-rose-200" />
                  <p className="text-xs text-white/70">Nhập mật khẩu mới sau khi nhận mã.</p>
                </div>
                <Input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="bg-slate-950/40 border-slate-700 text-white"
                />
                <Button variant="outline" className="border-rose-400 text-rose-200" onClick={verifyEmailOtp}>
                  Xác nhận mã & đặt lại
                </Button>
                {emailVerified && <p className="text-xs text-emerald-400">Đặt lại mật khẩu qua email thành công.</p>}
              </>
            )}
          </Card>
        </div>

        <Card className="p-6 bg-white/10 border-white/20 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/80">Cần hỗ trợ thêm?</p>
            <h3 className="text-xl font-semibold">Đội ngũ HealthCare+ luôn sẵn sàng 24/7</h3>
            <p className="text-white/70 text-sm">
              Nếu không truy cập được email hoặc điện thoại, hãy liên hệ hotline 1900 633 682 hoặc chat AI để được hỗ trợ đặt lại mật khẩu.
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white" onClick={() => onNavigate("support")}>
            <MessageCircle className="h-4 w-4 mr-2" /> Liên hệ hỗ trợ
          </Button>
        </Card>
      </div>
    </div>
  );
}
