import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PHONE_REGEX = /^\d{10}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,64}$/;

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');

  const passwordHint = useMemo(
    () => [
      '8-64 ký tự',
      'Ít nhất 1 chữ hoa & 1 chữ thường',
      'Ít nhất 1 chữ số và 1 ký tự đặc biệt (!@#$...)',
    ],
    [],
  );

  async function handleSubmit() {
    const errors: string[] = [];
    if (!first.trim()) errors.push('Vui lòng nhập Họ.');
    if (!last.trim()) errors.push('Vui lòng nhập Tên.');
    if (!PHONE_REGEX.test(phone.trim())) errors.push('Số điện thoại phải gồm đúng 10 chữ số.');
    if (!email.trim() || !email.includes('@')) errors.push('Email không hợp lệ.');
    if (!PASSWORD_REGEX.test(password)) {
      errors.push('Mật khẩu chưa đáp ứng yêu cầu bảo mật.');
    }
    if (errors.length) {
      setErr(errors.join('\n'));
      return;
    }
    setErr('');
    const ok = await register({
      first_name: first.trim(),
      last_name: last.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
    });
    if (ok) nav('/profile');
    else setErr('Đăng ký thất bại, vui lòng thử lại.');
  }

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h3>Tạo tài khoản</h3>
      <p className="muted">Nhập thông tin chính xác để quản lý hồ sơ và đặt lịch khám.</p>
      <div className="grid grid-2">
        <div>
          <label>Họ</label>
          <input className="input" value={first} onChange={(e) => setFirst(e.target.value)} />
        </div>
        <div>
          <label>Tên</label>
          <input className="input" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
      </div>

      <label>Số điện thoại</label>
      <input
        className="input"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        placeholder="0123456789"
        maxLength={10}
      />

      <label>Email</label>
      <input
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@domain.com"
      />

      <label>Mật khẩu</label>
      <div className="row" style={{ alignItems: 'center' }}>
        <input
          className="input"
          type={showPwd ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ flex: 1 }}
          placeholder="Mật khẩu mạnh..."
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
      <ul style={{ margin: '8px 0 16px 16px', fontSize: '0.85rem', color: '#94a3b8' }}>
        {passwordHint.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>

      {err && (
        <pre
          style={{
            color: '#f87171',
            whiteSpace: 'pre-wrap',
            background: '#1f2937',
            padding: 12,
            borderRadius: 8,
          }}
        >
          {err}
        </pre>
      )}

      <button className="btn" onClick={handleSubmit}>
        Tạo tài khoản
      </button>
    </div>
  );
}
