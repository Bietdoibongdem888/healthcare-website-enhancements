import "./Footer.css";

function Footer({ onNavigate, onToggleChat }) {
  return (
    <footer className="hc-footer">
      <div className="hc-footer__inner">
        <div className="hc-footer__grid">
          <div>
            <div className="hc-footer__brand">
              <div className="hc-footer__logo">H+</div>
              <div>
                <div className="hc-footer__title">HealthCare+</div>
                <small>Nền tảng chăm sóc chủ động</small>
              </div>
            </div>
            <p style={{ color: "var(--hc-footer-text)", fontSize: "0.95rem" }}>
              Đặt lịch khám, lưu trữ hồ sơ và kết nối bác sĩ trên một nền tảng duy nhất.
            </p>
          </div>

          <div>
            <div className="hc-footer__subtitle">Dịch vụ</div>
            <ul>
              <li>
                <button onClick={() => onNavigate("booking")}>Đặt lịch khám</button>
              </li>
              <li>
                <button onClick={() => onNavigate("doctors")}>Tìm bác sĩ</button>
              </li>
              <li>
                <button onClick={() => onNavigate("medical-records")}>Hồ sơ sức khỏe</button>
              </li>
            </ul>
          </div>

          <div>
            <div className="hc-footer__subtitle">Hỗ trợ</div>
            <ul>
              <li>
                <button onClick={() => onNavigate("support")}>Trung tâm hỗ trợ</button>
              </li>
              <li>
                <button onClick={onToggleChat}>Chat AI / Hotline</button>
              </li>
              <li>
                <button onClick={() => onNavigate("medical-records")}>Quản lý hồ sơ</button>
              </li>
            </ul>
          </div>

          <div>
            <div className="hc-footer__subtitle">Liên hệ</div>
            <ul>
              <li>
                Hotline: <button onClick={() => window.open("tel:1900633682")}>1900 633 682</button>
              </li>
              <li>Email: support@healthcare.vn</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="hc-footer__note">© 2025 HealthCare+. All rights reserved.</div>
      </div>
    </footer>
  );
}

export { Footer };
