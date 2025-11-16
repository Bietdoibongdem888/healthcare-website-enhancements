import { useEffect, useRef, useState } from "react";
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
import { BackButton } from "./components/BackButton";
import { useAuth } from "./context/AuthContext";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [navHistory, setNavHistory] = useState(["home"]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const historyRef = useRef("home");
  const historyActionRef = useRef("push");
  const isHandlingPopRef = useRef(false);
  const { user, logout } = useAuth();

  const handleNavigate = (page, options = {}) => {
    historyActionRef.current = options.replace ? "replace" : "push";
    setCurrentPage(page);
    setNavHistory((prev) => {
      let base = prev;
      if (options.replace && prev.length) {
        base = prev.slice(0, -1);
      }
      if (base[base.length - 1] === page) {
        return base;
      }
      return [...base, page];
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (navHistory.length <= 1) {
      handleNavigate("home", { replace: true });
      return;
    }
    window.history.back();
  };

  const handleLogout = async () => {
    await logout();
    handleNavigate("home", { replace: true });
  };

  useEffect(() => {
    if (!window.history.state || window.history.state.page !== "home") {
      window.history.replaceState({ page: "home" }, "", "#home");
    }
    historyRef.current = "home";
    const handlePopState = (event) => {
      const target = event.state?.page || "home";
      isHandlingPopRef.current = true;
      setNavHistory((prev) => {
        if (prev.length <= 1) return ["home"];
        return prev.slice(0, -1);
      });
      setCurrentPage(target);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isHandlingPopRef.current) {
      isHandlingPopRef.current = false;
      historyRef.current = currentPage;
      historyActionRef.current = "push";
      return;
    }
    const state = { page: currentPage };
    if (historyActionRef.current === "replace") {
      window.history.replaceState(state, "", `#${currentPage}`);
    } else if (historyRef.current !== currentPage) {
      window.history.pushState(state, "", `#${currentPage}`);
    }
    historyRef.current = currentPage;
    historyActionRef.current = "push";
  }, [currentPage]);

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

  const canGoBack = navHistory.length > 1;
  const showBackControls = currentPage !== "home";

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage}
        isLoggedIn={Boolean(user)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onToggleChat={() => setIsChatOpen(true)}
      />
      {showBackControls && (
        <BackButton
          onBack={canGoBack ? handleBack : undefined}
          onHome={() => handleNavigate("home", { replace: !canGoBack })}
        />
      )}
      <main>{renderPage()}</main>
      <Footer onNavigate={handleNavigate} onToggleChat={() => setIsChatOpen((prev) => !prev)} />
      <SupportWidget open={isChatOpen} onToggle={setIsChatOpen} />
    </div>
  );
}

export { App as default };
