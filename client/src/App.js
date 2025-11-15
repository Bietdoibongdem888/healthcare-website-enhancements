import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { ProfilePage } from "./components/ProfilePage";
import { DoctorsPage } from "./components/DoctorsPage";
import { BookingPage } from "./components/BookingPage";
import { BookingSuccess } from "./components/BookingSuccess";
import { MedicalRecordsPage } from "./components/MedicalRecordsPage";
import { TreatmentsPage } from "./components/TreatmentsPage";
import { TechnologyPage } from "./components/TechnologyPage";
import { TestimonialsPage } from "./components/TestimonialsPage";
import { DoctorTeamPage } from "./components/DoctorTeamPage";
import { SupportCenterPage } from "./components/SupportCenterPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { SupportWidget } from "./components/SupportWidget";
import { useAuth } from "./context/AuthContext";
function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, logout } = useAuth();
  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleLogout = async () => {
    await logout();
    setCurrentPage("home");
  };
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;
      case "profile":
        return <ProfilePage onNavigate={handleNavigate} />;
      case "doctors":
        return <DoctorsPage onNavigate={handleNavigate} />;
      case "booking":
        return <BookingPage onNavigate={handleNavigate} />;
      case "booking-success":
        return <BookingSuccess onNavigate={handleNavigate} />;
      case "medical-records":
        return <MedicalRecordsPage onNavigate={handleNavigate} />;
      case "treatments":
        return <TreatmentsPage onNavigate={handleNavigate} />;
      case "technology":
        return <TechnologyPage onNavigate={handleNavigate} />;
      case "testimonials":
        return <TestimonialsPage onNavigate={handleNavigate} />;
      case "doctor-team":
        return <DoctorTeamPage onNavigate={handleNavigate} />;
      case "support":
        return <SupportCenterPage onNavigate={handleNavigate} />;
      case "forgot":
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };
  return <div className="min-h-screen bg-background">
      <Header
    currentPage={currentPage}
    isLoggedIn={Boolean(user)}
    onNavigate={handleNavigate}
    onLogout={handleLogout}
    onToggleChat={() => setIsChatOpen(true)}
  />
      <main>{renderPage()}</main>
      <Footer onNavigate={handleNavigate} onToggleChat={() => setIsChatOpen((prev) => !prev)} />
      <SupportWidget open={isChatOpen} onToggle={setIsChatOpen} />
    </div>;
}
export {
  App as default
};
