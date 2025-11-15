import { useEffect, useMemo, useState } from "react";
import { SPECIALTIES_WITH_ALL } from "../constants/specialties";
import { DISTRICTS_WITH_ALL } from "../constants/districts";
import { DEPARTMENTS } from "../constants/departments";
import { DOCTORS } from "../constants/doctors";
import { safeApi } from "../lib/api";
import "./DoctorsPage.css";

function normalizeDoctors(apiDoctors) {
  if (!apiDoctors.length) return DOCTORS;
  return apiDoctors.map((doc) => ({
    id: String(doc.doctor_id ?? doc.id ?? crypto.randomUUID()),
    name: `${doc.first_name || "BS."} ${doc.last_name || "HealthCare+"}`.trim(),
    specialty: doc.specialty || "Đa khoa",
    hospital: doc.hospital || "HealthCare+",
    district: doc.district || "Toàn quốc",
    rating: Number(doc.rating ?? 4.9),
    reviews: Number(doc.reviews ?? 0),
    achievements: doc.achievements?.length ? doc.achievements : ["Chứng nhận Bộ Y tế", "Ứng dụng HealthCare+"],
    avatar: doc.avatar || "",
    department: doc.department_name || "Tổng quát",
    experience: doc.experience || "10+ năm",
    focusAreas: doc.focusAreas,
  }));
}

function renderStars(rating) {
  const full = Math.round(rating);
  return "★★★★★".slice(0, full).padEnd(5, "☆");
}

function DoctorsPage({ onNavigate }) {
  const heroImage = "https://images.unsplash.com/photo-1631815588090-d5d8a0990fdb?auto=format&fit=crop&w=1600&q=80";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [apiDoctors, setApiDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await safeApi("/doctors?limit=60");
      if (mounted && Array.isArray(data)) setApiDoctors(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const combinedDoctors = useMemo(() => normalizeDoctors(apiDoctors), [apiDoctors]);

  const filteredDoctors = combinedDoctors.filter((doctor) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = doctor.name.toLowerCase().includes(term) || doctor.specialty.toLowerCase().includes(term);
    const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    const matchesDistrict = selectedDistrict === "all" || doctor.district === selectedDistrict;
    const matchesDepartment = selectedDepartment === "all" || doctor.department === selectedDepartment;
    return matchesSearch && matchesSpecialty && matchesDistrict && matchesDepartment;
  });

  return (
    <div className="doctors-page">
      <section className="doctors-hero" style={{ backgroundImage: `linear-gradient(120deg, rgba(7,11,40,.85), rgba(9,50,80,.85)), url(${heroImage})` }}>
        <div>
          <p className="eyebrow">Đội ngũ bác sĩ</p>
          <h1>Chuyên gia đầu ngành đồng hành từng giai đoạn điều trị</h1>
          <p>
            Hơn 180 bác sĩ, giáo sư với kinh nghiệm quốc tế trong tim mạch, ung bướu, sản phụ khoa, nhi, thần kinh…
            Đặt lịch riêng để nhận phác đồ cá nhân hóa và được chăm sóc tiếp nối qua HealthCare+.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => onNavigate("booking")}>Đặt lịch nhanh</button>
            <button className="ghost" onClick={() => onNavigate("doctor-team")}>Xem đội ngũ theo khoa</button>
          </div>
        </div>
      </section>

      <section className="doctors-filters">
        <div className="filter-item search">
          <input
            placeholder="Tìm bác sĩ, chuyên khoa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label>Chuyên khoa</label>
          <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
            {SPECIALTIES_WITH_ALL.map((item) => (
              <option key={item.value || item} value={item.value || item}>
                {item.label || item}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label>Khu vực</label>
          <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
            {DISTRICTS_WITH_ALL.map((item) => (
              <option key={item.value || item} value={item.value || item}>
                {item.label || item}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label>Khoa</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">Tất cả khoa</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="doctors-result-header">
        <p>{loading ? "Đang tải dữ liệu..." : `Tìm thấy ${filteredDoctors.length} bác sĩ phù hợp`}</p>
        <button className="ghost" onClick={() => onNavigate("doctor-team")}>
          Đội ngũ theo khoa
        </button>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <article key={doctor.id} className="doctor-card">
            <div className="doctor-card__header">
              <div className="doctor-avatar">
                {doctor.avatar ? <img src={doctor.avatar} alt={doctor.name} /> : doctor.name.split(" ").pop()?.[0]}
              </div>
              <div>
                <h3>{doctor.name}</h3>
                <p>{doctor.specialty}</p>
                <div className="doctor-rating">
                  <span className="stars">{renderStars(doctor.rating)}</span>
                  <span>{doctor.rating.toFixed(1)}</span>
                  <small>({doctor.reviews} đánh giá)</small>
                </div>
              </div>
            </div>
            <ul className="doctor-meta">
              <li>
                <span>Kinh nghiệm</span>
                <strong>{doctor.experience}</strong>
              </li>
              <li>
                <span>Cơ sở</span>
                <strong>{doctor.hospital}</strong>
              </li>
              <li>
                <span>Khu vực</span>
                <strong>{doctor.district}</strong>
              </li>
            </ul>
            <div className="doctor-tags">
              <span>{doctor.department}</span>
              {doctor.achievements.slice(0, 2).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="doctor-actions">
              <button className="ghost" onClick={() => onNavigate("doctor-team")}>Xem hồ sơ</button>
              <button className="primary" onClick={() => onNavigate("booking")}>Đặt lịch riêng</button>
            </div>
          </article>
        ))}
      </div>

      {!loading && filteredDoctors.length === 0 && (
        <div className="doctor-empty">
          Không tìm thấy bác sĩ phù hợp. Vui lòng điều chỉnh bộ lọc.
        </div>
      )}
    </div>
  );
}

export { DoctorsPage };
