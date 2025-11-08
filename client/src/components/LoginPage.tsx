import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Mail, Lock, User, Phone, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_REGEX = /^\d{10}$/;
const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api/v1";

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pendingLogin, setPendingLogin] = useState(false);
  const [pendingRegister, setPendingRegister] = useState(false);
  const { login: authLogin, register: authRegister } = useAuth();
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors: string[] = [];
    if (!loginEmail.includes("@")) currentErrors.push("Email không hợp lệ.");
    if (!loginPassword) currentErrors.push("Vui lòng nhập mật khẩu.");
    setErrors(currentErrors);
    if (currentErrors.length) return;
    setPendingLogin(true);
    const ok = await authLogin(loginEmail.trim(), loginPassword);
    setPendingLogin(false);
    if (ok) {
      setStatus("Đăng nhập thành công.");
      onNavigate("profile");
    } else {
      setErrors(["Đăng nhập thất bại. Kiểm tra lại thông tin."]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const registerErrors: string[] = [];
    if (!fullName.trim()) registerErrors.push("Họ và tên không được để trống.");
    if (!PHONE_REGEX.test(phone)) registerErrors.push("Số điện thoại phải gồm đúng 10 chữ số.");
    if (!email.includes("@")) registerErrors.push("Email không hợp lệ.");
    if (!PASSWORD_REGEX.test(password)) registerErrors.push("Mật khẩu cần ≥8 ký tự, có chữ hoa và chữ số.");
    setErrors(registerErrors);
    if (registerErrors.length) return;
    const parts = fullName.trim().split(/\s+/);
    const last_name = parts.pop() || '';
    const first_name = parts.join(' ') || last_name;
    setPendingRegister(true);
    const ok = await authRegister({
      first_name,
      last_name,
      phone,
      email,
      password,
    });
    setPendingRegister(false);
    if (ok) {
      setStatus("Đăng ký thành công. Chào mừng bạn đến với HealthCare+.");
      onNavigate("profile");
    } else {
      setErrors(["Đăng ký thất bại. Vui lòng thử lại."]);
    }
  };

  function openOAuth(provider: "google" | "facebook") {
    const width = 520;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(`${API_URL.replace("/api/v1", "")}/api/v1/auth/${provider}`, `oauth-${provider}`, `width=${width},height=${height},left=${left},top=${top}`);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(8,47,73,.9), rgba(14,116,144,.85)), url(https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80)",
      }}
    >
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-white text-3xl">H+</span>
            </div>
            <div className="text-left">
              <p className="text-sm text-white/70">Cổng khách hàng HealthCare+</p>
              <h2 className="text-3xl font-semibold">Đăng nhập hoặc tạo tài khoản</h2>
            </div>
          </div>
          <p className="text-white/70">Một tài khoản duy nhất cho đặt lịch, hồ sơ y tế và chat AI.</p>
        </div>

        <Card className="p-8 shadow-2xl">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <Label>Mật khẩu</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10 pr-10"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="accent-blue-500" /> Ghi nhớ đăng nhập
                  </label>
                  <button
                    type="button"
                    className="text-blue-500 hover:underline"
                    onClick={() => onNavigate("forgot")}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={pendingLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                >
                  {pendingLogin ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Họ và tên</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
                  </div>
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="0123456789"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" />
                  </div>
                </div>
                <div>
                  <Label>Mật khẩu</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tối thiểu 8 ký tự, có chữ hoa & số" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Mật khẩu mạnh ≥8 ký tự, chứa chữ hoa & chữ số.</p>
                </div>

                <Button
                  type="submit"
                  disabled={pendingRegister}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                >
                  {pendingRegister ? "Đang xử lý..." : "Đăng ký"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-3">
            <Button style={{ backgroundColor: "#EA4335", color: "white" }} className="w-full hover:brightness-110" onClick={() => openOAuth("google")}>
              Đăng nhập bằng Google
            </Button>
            <Button style={{ backgroundColor: "#0866FF", color: "white" }} className="w-full hover:brightness-110" onClick={() => openOAuth("facebook")}>
              Đăng nhập bằng Facebook
            </Button>
          </div>

          {status && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex gap-2">
              <Shield className="h-4 w-4" /> {status}
            </div>
          )}
          {errors.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 space-y-1">
              {errors.map((err) => (
                <p key={err}>{err}</p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
