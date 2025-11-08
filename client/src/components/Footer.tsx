import { Button } from "./ui/button";

interface FooterProps {
  onNavigate: (page: string) => void;
  onToggleChat: () => void;
}

export function Footer({ onNavigate, onToggleChat }: FooterProps) {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                <span className="text-white text-xl">H+</span>
              </div>
              <span className="ml-3 font-semibold text-xl">HealthCare+</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam
            </p>
          </div>

          <div>
            <h6 className="mb-4">Dịch vụ</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate("booking")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Đặt lịch khám
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("doctors")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Tìm bác sĩ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("medical-records")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Hồ sơ sức khỏe
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="mb-4">Hỗ trợ</h6>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => onNavigate("support")} className="hover:text-foreground">
                  Trung tâm hỗ trợ
                </button>
              </li>
              <li>
                <button onClick={onToggleChat} className="hover:text-foreground">
                  Chat AI / Hotline
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("medical-records")} className="hover:text-foreground">
                  Quản lý hồ sơ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="mb-4">Liên hệ</h6>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Hotline:{" "}
                <button className="hover:text-foreground" onClick={() => window.open("tel:1900633682")}>
                  1900 633 682
                </button>
              </li>
              <li>Email: support@healthcare.vn</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 HealthCare+. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
