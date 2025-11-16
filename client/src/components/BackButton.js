import { ArrowLeft, Home } from "lucide-react";
import "./BackButton.css";

function BackButton({ onBack, onHome, label = "Quay lại trang trước" }) {
  if (typeof onBack !== "function" && typeof onHome !== "function") {
    return null;
  }

  return (
    <div className="back-button-wrapper">
      {typeof onBack === "function" && (
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>{label}</span>
        </button>
      )}
      {typeof onHome === "function" && (
        <button type="button" className="home-button" onClick={onHome}>
          <Home size={18} />
          <span>Về trang chủ</span>
        </button>
      )}
    </div>
  );
}

export { BackButton };
