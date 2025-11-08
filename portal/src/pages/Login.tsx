import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/config';

const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return 'http://localhost:3000';
  }
})();

export default function Login() {
  const nav = useNavigate();
  const { login, applyTokenPair } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState('');

  const disabled = useMemo(() => !email || !password || pending, [email, password, pending]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== API_ORIGIN) return;
      const data = event.data;
      if (data?.type === 'oauth-success' && data?.tokens) {
        applyTokenPair(data.tokens).then((ok) => {
          if (ok) nav('/profile');
        });
      } else if (data?.type === 'oauth-error' && data?.message) {
        setErr(data.message);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [applyTokenPair, nav]);

  async function handleLogin() {
    if (!email.includes('@')) {
      setErr('Email không hợp lệ.');
      return;
    }
    if (!password) {
      setErr('Vui lòng nhập mật khẩu.');
      return;
    }
    setErr('');
    setPending(true);
    const ok = await login(email.trim(), password);
    setPending(false);
    if (ok) nav('/profile');
    else setErr('Đăng nhập thất bại. Kiểm tra lại thông tin.');
  }

  function openSocial(provider: 'google' | 'facebook') {
    const width = 520;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      `${API_URL.replace('/api/v1', '')}/api/v1/auth/${provider}`,
      `oauth-${provider}`,
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h3>Đăng nhập</h3>
      <p className="muted">Sử dụng tài khoản HealthCare+ hoặc đăng nhập bằng mạng xã hội.</p>

      <label>Email</label>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

      <label>Mật khẩu</label>
      <div className="row" style={{ alignItems: 'center' }}>
        <input
          className="input"
          type={showPwd ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="input"
          style={{ width: 120 }}
          onClick={() => setShowPwd((v) => !v)}
        >
          {showPwd ? 'Ẩn' : 'Hiện'}
        </button>
      </div>

      {err && (
        <div style={{ color: '#f87171', background: '#1f2937', padding: 10, borderRadius: 8, marginTop: 12 }}>
          {err}
        </div>
      )}

      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn" disabled={disabled} onClick={handleLogin}>
          {pending ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
        <Link to="/forgot">Quên mật khẩu?</Link>
      </div>

      <hr style={{ margin: '24px 0' }} />
      <div className="grid">
        <button className="input" onClick={() => openSocial('google')}>
          Đăng nhập bằng Google
        </button>
        <button className="input" onClick={() => openSocial('facebook')}>
          Đăng nhập bằng Facebook
        </button>
      </div>
    </div>
  );
}
