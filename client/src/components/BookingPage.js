import { useEffect, useMemo, useState } from "react";
import { SPECIALTIES } from "../constants/specialties";
import { DISTRICTS } from "../constants/districts";
import { DOCTORS } from "../constants/doctors";
import { TIME_SLOTS } from "../constants/timeSlots";
import "./BookingPage.css";

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_GUIDE = [
  {
    status: "pending",
    label: "Chờ xác nhận",
    description: "Điều phối viên sẽ kiểm tra khung giờ và liên hệ lại trong 15 phút.",
  },
  {
    status: "confirmed",
    label: "Đã xác nhận",
    description: "Bạn nhận email/SMS hướng dẫn chuẩn bị trước khi khám.",
  },
  {
    status: "cancelled",
    label: "Đã hủy",
    description: "Có thể hủy miễn phí trước 2 giờ để nhường slot cho bệnh nhân khác.",
  },
];

function combineDateTime(baseDate, time) {
  const [hour, minute] = time.split(":").map(Number);
  const combined = new Date(baseDate);
  combined.setHours(hour, minute, 0, 0);
  return combined;
}

function splitFullName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { first_name: "Người", last_name: "Dùng" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "HealthCare+" };
  return { first_name: parts.slice(0, -1).join(" "), last_name: parts[parts.length - 1] };
}

function persistBooking(details) {
  try {
    sessionStorage.setItem("hc.lastBooking", JSON.stringify(details));
  } catch (_) {
    /* ignore */
  }
}

function BookingPage({ onNavigate }) {
  const [date, setDate] = useState(() => new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [district, setDistrict] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [channel, setChannel] = useState("offline");
  const [errors, setErrors] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const [doctors, setDoctors] = useState(DOCTORS);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await fetch("/api/v1/doctors");
        if (!res.ok) throw new Error("Không thể tải danh sách bác sĩ");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Dữ liệu bác sĩ không hợp lệ");
        if (!active) return;
        const normalized = data.map((doc) => ({
          id: String(doc.doctor_id ?? doc.id),
          name: `BS. ${[doc.first_name, doc.last_name].filter(Boolean).join(" ") || "Đang cập nhật"}`,
          specialty: doc.specialty || "Đa khoa",
          experience: doc.experience || "Kinh nghiệm đang cập nhật",
          hospital: doc.hospital || "HealthCare+",
          district: doc.district || "Toàn quốc",
          rating: Number(doc.rating ?? 5),
          reviews: Number(doc.reviews ?? 0),
        }));
        setDoctors(normalized);
      } catch (err) {
        console.warn("[BOOKING] load doctor failed", err);
      } finally {
        if (active) setLoadingDoctors(false);
      }
    };
    fetchDoctors();
    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSpecialty = specialty ? doc.specialty === specialty : true;
      const matchDistrict = district ? doc.district === district : true;
      return matchSpecialty && matchDistrict;
    });
  }, [doctors, specialty, district]);

  useEffect(() => {
    if (filteredDoctors.length && !filteredDoctors.some((doc) => doc.id === selectedDoctor)) {
      setSelectedDoctor(filteredDoctors[0].id);
    }
  }, [filteredDoctors, selectedDoctor]);

  const dayString = date.toISOString().split("T")[0];

  const availableSlots = useMemo(() => {
    const today = new Date();
    return TIME_SLOTS.filter((slot) => {
      const slotDate = combineDateTime(date, slot.value);
      if (dayString === today.toISOString().split("T")[0]) {
        return slotDate > today;
      }
      return true;
    });
  }, [date, dayString]);

  const selectedDoctorInfo = filteredDoctors.find((doc) => doc.id === selectedDoctor);

  const summary = {
    doctor: selectedDoctorInfo?.name || "Chưa chọn",
    specialty: selectedDoctorInfo?.specialty,
    hospital: selectedDoctorInfo?.hospital,
    date: dayString,
    time: selectedTime,
    channel: channel === "online" ? "Khám trực tuyến" : "Trực tiếp tại cơ sở",
  };

  const validateForm = () => {
    const newErrors = [];
    if (!selectedDoctor) newErrors.push("Bạn chưa chọn bác sĩ.");
    if (!selectedTime) newErrors.push("Vui lòng chọn giờ khám.");
    if (!fullName.trim()) newErrors.push("Họ và tên không được để trống.");
    if (!PHONE_REGEX.test(phone)) newErrors.push("Số điện thoại cần 10 chữ số.");
    if (!EMAIL_REGEX.test(email)) newErrors.push("Email không hợp lệ.");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setApiSuccess(null);
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const doctor = selectedDoctorInfo || doctors.find((doc) => doc.id === selectedDoctor);
      const { first_name, last_name } = splitFullName(fullName);
      const payload = {
        patient: {
          first_name,
          last_name,
          phone,
          email,
        },
        doctor_id: doctor?.id,
        specialty: doctor?.specialty,
        channel,
        appointment_time: combineDateTime(date, selectedTime),
        note: notes,
      };
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Không thể đặt lịch, vui lòng thử lại");
      const data = await res.json();
      persistBooking(data);
      setApiSuccess("Đặt lịch thành công! HealthCare+ sẽ liên hệ xác nhận.");
      setTimeout(() => onNavigate("booking-success"), 1500);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div>
          <p className="eyebrow">Đặt lịch nâng cao</p>
          <h1>Điều phối lịch khám với bác sĩ HealthCare+</h1>
          <p>
            Chọn bác sĩ, thời gian và hình thức khám. Điều phối viên và trợ lý AI sẽ nhắc nhở, gửi hướng dẫn chuẩn bị
            cũng như hỗ trợ về hồ sơ số sau buổi khám.
          </p>
        </div>
        <button className="ghost" onClick={() => onNavigate("support")}>
          Cần hỗ trợ nhanh? Liên hệ Support 24/7
        </button>
      </section>

      <div className="booking-content">
        <form className="booking-panel" onSubmit={handleSubmit}>
          <div className="field-group">
            <div className="field-col">
              <label>Chuyên khoa</label>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="">Tất cả</option>
                {SPECIALTIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-col">
              <label>Khu vực</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="">Toàn quốc</option>
                {DISTRICTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-col full">
              <label>Bác sĩ</label>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} · {doc.specialty} · {doc.hospital}
                  </option>
                ))}
              </select>
              {loadingDoctors && <small>Đang tải danh sách bác sĩ...</small>}
            </div>
          </div>

          <div className="field-group">
            <div className="field-col">
              <label>Ngày khám</label>
              <input
                type="date"
                value={dayString}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) setDate(new Date(`${value}T00:00:00`));
                }}
              />
            </div>
            <div className="field-col">
              <label>Hình thức</label>
              <div className="segment">
                <button type="button" className={channel === "offline" ? "active" : ""} onClick={() => setChannel("offline")}>
                  Tại cơ sở
                </button>
                <button type="button" className={channel === "online" ? "active" : ""} onClick={() => setChannel("online")}>
                  Online
                </button>
              </div>
            </div>
          </div>

          <div className="slot-grid">
            {availableSlots.map((slot) => (
              <button
                type="button"
                key={slot.value}
                className={selectedTime === slot.value ? "slot active" : "slot"}
                onClick={() => setSelectedTime(slot.value)}
              >
                <strong>{slot.label}</strong>
                <span>{slot.note}</span>
              </button>
            ))}
          </div>

          <div className="field-group">
            <div className="field-col">
              <label>Họ và tên</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div className="field-col">
              <label>Số điện thoại</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901 234 567" />
            </div>
            <div className="field-col">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="me@healthcare.com" />
            </div>
            <div className="field-col full">
              <label>Ghi chú cho bác sĩ</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Ví dụ: cần phiên dịch, dị ứng thuốc..."></textarea>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="alert error">
              <strong>Vui lòng kiểm tra:</strong>
              <ul>
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {apiError && <div className="alert error">{apiError}</div>}
          {apiSuccess && <div className="alert success">{apiSuccess}</div>}

          <button type="submit" className="primary submit" disabled={submitting}>
            {submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
          </button>
        </form>

        <aside className="booking-summary">
          <div className="summary-card">
            <p className="eyebrow">Thông tin đặt lịch</p>
            <h3>{summary.doctor}</h3>
            <ul>
              <li>
                <span>Chuyên khoa</span>
                <strong>{summary.specialty || "-"}</strong>
              </li>
              <li>
                <span>Địa điểm</span>
                <strong>{summary.hospital || "-"}</strong>
              </li>
              <li>
                <span>Ngày</span>
                <strong>{summary.date}</strong>
              </li>
              <li>
                <span>Giờ</span>
                <strong>{summary.time || "Chưa chọn"}</strong>
              </li>
              <li>
                <span>Hình thức</span>
                <strong>{summary.channel}</strong>
              </li>
            </ul>
          </div>

          <div className="status-guide">
            <p className="eyebrow">Trạng thái lịch hẹn</p>
            {STATUS_GUIDE.map((item) => (
              <article key={item.status}>
                <h4>{item.label}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="assistant-card">
            <h4>Trợ lý HealthCare+</h4>
            <p>Nhận nhắc nhở thuốc, tải hồ sơ số, gửi câu hỏi trước buổi khám và chat với bác sĩ sau khám.</p>
            <button className="ghost" onClick={() => onNavigate("support")}>
              Khởi động trợ lý AI
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { BookingPage };
