import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,64}$/;

export default function Reset() {
  const [sp] = useSearchParams();
  const token = sp.get('token') || '';
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!PASSWORD_REGEX.test(pwd)) {
      setMsg('Mật khẩu chưa đáp ứng yêu cầu bảo mật.');
      return;
    }
    if (pwd !== confirm) {
      setMsg('Xác nhận mật khẩu chưa khớp.');
      return;
    }
    setLoading(true);
    setMsg('');
    const r = await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, new_password: pwd }) });
    setLoading(false);
    setMsg(r.ok ? 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.' : 'Không thể đặt lại mật khẩu.');
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h3>Đặt lại mật khẩu</h3>
      <p className="muted">Nhập mật khẩu mới để hoàn tất quá trình.</p>
      <label>Mật khẩu mới</label>
      <input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
      <label>Nhập lại mật khẩu</label>
      <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <button className="btn" onClick={handleReset} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Xác nhận'}
      </button>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}
