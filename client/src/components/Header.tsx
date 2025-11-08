import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  currentPage: string;
  isLoggedIn: boolean;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleChat: () => void;
}

export function Header({ currentPage, isLoggedIn, onNavigate, onLogout, onToggleChat }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavigation("home")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
              <span className="text-white text-xl">H+</span>
            </div>
            <span className="ml-3 font-semibold text-xl">HealthCare+</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => handleNavigation("home")}
              className={`text-sm transition-colors hover:text-blue-600 ${
                currentPage === "home" ? "text-blue-600" : ""
              }`}
            >
              Trang chủ
            </button>
            
            <button
              onClick={() => handleNavigation("technology")}
              className={`text-sm transition-colors hover:text-blue-600 ${
                currentPage === "technology" ? "text-blue-600" : ""
              }`}
            >
              Công nghệ hiện đại
            </button>

            <button
              onClick={() => handleNavigation("treatments")}
              className={`text-sm transition-colors hover:text-blue-600 ${
                currentPage === "treatments" ? "text-blue-600" : ""
              }`}
            >
              Bệnh điều trị
            </button>

            <button
              onClick={() => handleNavigation("testimonials")}
              className={`text-sm transition-colors hover:text-blue-600 ${
                currentPage === "testimonials" ? "text-blue-600" : ""
              }`}
            >
              Cảm nhận khách hàng
            </button>

            <button
              onClick={() => handleNavigation("doctor-team")}
              className={`text-sm transition-colors hover:text-blue-600 ${
                currentPage === "doctor-team" ? "text-blue-600" : ""
              }`}
            >
              Đội ngũ bác sĩ
            </button>

            {/* Hồ sơ Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-sm transition-colors hover:text-blue-600 ${
                    currentPage === "medical-records" ? "text-blue-600" : ""
                  }`}
                >
                  Hồ sơ
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleNavigation("medical-records")}>
                  Hồ sơ y tế
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("medical-records")}>
                  Lịch sử khám bệnh
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("medical-records")}>
                  Lịch hẹn khám
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("medical-records")}>
                  Đơn thuốc & Xét nghiệm
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-sm transition-colors hover:text-blue-600 ${
                    currentPage === "support" ? "text-blue-600" : ""
                  }`}
                >
                  Hỗ trợ
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => handleNavigation("support")}>
                  Trung tâm hỗ trợ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleChat()}>Chat AI / Hotline</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("medical-records")}>
                  Hướng dẫn hồ sơ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button variant="outline" onClick={() => handleNavigation("profile")}>
                  Tài khoản
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700" onClick={() => handleNavigation("booking")}>
                  Đặt lịch khám
                </Button>
                <Button variant="ghost" onClick={onLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                  onClick={() => handleNavigation("login")}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-3">
            <button
              onClick={() => handleNavigation("home")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md"
            >
              Trang chủ
            </button>
            <button
              onClick={() => handleNavigation("technology")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md"
            >
              Công nghệ hiện đại
            </button>
            <button
              onClick={() => handleNavigation("treatments")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md"
            >
              Bệnh điều trị
            </button>
            <button
              onClick={() => handleNavigation("testimonials")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md"
            >
              Cảm nhận khách hàng
            </button>
            <button
              onClick={() => handleNavigation("doctor-team")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md"
            >
              Đội ngũ bác sĩ
            </button>
            
            <div className="px-4 py-2">
              <p className="text-sm font-medium mb-2">Hồ sơ</p>
              <div className="space-y-2 ml-4">
                <button
                  onClick={() => handleNavigation("medical-records")}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  Hồ sơ y tế
                </button>
                <button
                  onClick={() => handleNavigation("medical-records")}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  Lịch sử khám bệnh
                </button>
                <button
                  onClick={() => handleNavigation("medical-records")}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  Lịch hẹn khám
                </button>
                <button
                  onClick={() => handleNavigation("medical-records")}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  Đơn thuốc & Xét nghiệm
                </button>
              </div>
            </div>

            <div className="px-4 pt-2">
              <p className="text-sm font-medium mb-2">Hỗ trợ</p>
              <div className="space-y-2 ml-4">
                <button
                  onClick={() => handleNavigation("support")}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  Trung tâm hỗ trợ
                </button>
                <button
                  onClick={onToggleChat}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  Chat AI / Hotline
                </button>
              </div>
            </div>

            <div className="px-4 pt-4 space-y-2">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleNavigation("profile")}
                  >
                    Tài khoản
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    onClick={() => handleNavigation("booking")}
                  >
                    Đặt lịch khám
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleNavigation("login")}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    onClick={() => handleNavigation("login")}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
