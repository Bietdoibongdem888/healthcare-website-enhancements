import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Header.css";

const NAV_ITEMS = [
  { id: "home", label: "Trang chủ" },
  { id: "technology", label: "Công nghệ hiện đại" },
  { id: "treatments", label: "Bệnh điều trị" },
  { id: "testimonials", label: "Cảm nhận khách hàng" },
  { id: "doctor-team", label: "Đội ngũ bác sĩ" },
  { id: "medical-records", label: "Hồ sơ số" },
  { id: "support", label: "Trung tâm hỗ trợ" }
];

function Header({ currentPage, isLoggedIn, onNavigate, onLogout, onToggleChat }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  return (
    <header className="hc-header">
      <div className="hc-header__inner">
        <div className="hc-brand" onClick={() => handleNavigation("home")}>
          <div className="hc-brand__mark">H+</div>
          <div>
            <div className="hc-brand__name">HealthCare+</div>
            <small>Active Care Platform</small>
          </div>
        </div>

        <nav className="hc-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={currentPage === item.id ? "active" : ""}
              onClick={() => handleNavigation(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button onClick={onToggleChat}>Chat AI</button>
        </nav>

        <div className="hc-auth">
          {isLoggedIn ? (
            <>
              <button className="outline" onClick={() => handleNavigation("profile")}>
                Tài khoản
              </button>
              <button className="primary" onClick={() => handleNavigation("booking")}>
                Đặt lịch khám
              </button>
              <button className="ghost" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button className="outline" onClick={() => handleNavigation("login")}>
                Đăng nhập
              </button>
              <button className="primary" onClick={() => handleNavigation("login")}>
                Đăng ký
              </button>
            </>
          )}
        </div>

        <button className="hc-mobile-toggle" onClick={() => setIsMenuOpen((prev) => !prev)}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="hc-mobile-menu">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => handleNavigation(item.id)}>
              {item.label}
            </button>
          ))}
          <button onClick={onToggleChat}>Chat AI / Hotline</button>
          <div className="hc-mobile-groups">
            <h4>Giải pháp nhanh</h4>
            <ul>
              <li>
                <button onClick={() => handleNavigation("booking")}>Đặt lịch khám</button>
              </li>
              <li>
                <button onClick={() => handleNavigation("doctors")}>Tìm bác sĩ</button>
              </li>
            </ul>
          </div>
          <div className="hc-mobile-actions">
            {isLoggedIn ? (
              <>
                <button className="outline" onClick={() => handleNavigation("profile")}>
                  Tài khoản
                </button>
                <button className="primary" onClick={() => handleNavigation("booking")}>
                  Đặt lịch khám
                </button>
                <button className="ghost" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleNavigation("login")}>Đăng nhập</button>
                <button className="primary" onClick={() => handleNavigation("login")}>
                  Đăng ký ngay
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export { Header };
