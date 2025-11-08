import { useState } from 'react';
import { api } from '../lib/api';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      setMsg('Vui lòng nhập email hợp lệ.');
      return;
    }
    setLoading(true);
    setMsg('');
    const res = await api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
    setMsg(res.ok ? 'Nếu email tồn tại, đường dẫn đặt lại đã được gửi.' : 'Không thể gửi yêu cầu, vui lòng thử lại.');
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h3>Quên mật khẩu</h3>
      <p className="muted">
        Nhập email đã đăng ký. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu trong 60 phút tiếp theo.
      </p>
      <label>Email</label>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="btn" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Gửi liên kết'}
      </button>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
      {sent && (
        <ol style={{ marginTop: 16, color: '#94a3b8', fontSize: '0.9rem' }}>
          <li>Kiểm tra hộp thư đến hoặc mục spam.</li>
          <li>Nhấp vào liên kết đặt lại mật khẩu để tạo mật khẩu mới.</li>
          <li>Nếu bạn không nhận được email sau vài phút, hãy thử gửi lại.</li>
        </ol>
      )}
    </div>
  );
}
