import { useMemo, useState } from "react";
import "./MedicalRecordsPage.css";

const FACILITY_DATA = [
  { id: 1, name: "HealthCare+ Times City", doctor: "BS. Trần Quốc Huy", specialty: "Tim mạch" },
  { id: 2, name: "HealthCare+ Keangnam", doctor: "ThS.BS. Vũ Mai Anh", specialty: "Ung bướu" },
];

const HISTORY = [
  {
    id: 11,
    department: "Tim mạch",
    doctor: "BS. Nguyễn Duy",
    date: "12/10/2025",
    summary: "Tái khám sau thay van",
    detail: "Siêu âm tim định kỳ, chỉnh thuốc Metoprolol và kiểm tra INR.",
  },
  {
    id: 12,
    department: "Ung bướu",
    doctor: "PGS. Phạm Khánh",
    date: "05/09/2025",
    summary: "Xạ trị kết hợp AI",
    detail: "Đánh giá đáp ứng sau 8 buổi xạ trị, chuyển sang giai đoạn giảm liều.",
  },
];

const APPOINTMENTS = [
  {
    id: 101,
    status: "Sắp diễn ra",
    doctor: "BS. Lê Minh",
    department: "Thần kinh",
    time: "09:30 • 22/11/2025",
    location: "HealthCare+ Times City",
  },
  {
    id: 102,
    status: "Hoàn thành",
    doctor: "BS. Lưu Thu",
    department: "Cơ xương khớp",
    time: "15:00 • 02/10/2025",
    location: "HealthCare+ Keangnam",
  },
];

const PRESCRIPTIONS = [
  {
    id: 901,
    title: "Đơn thuốc hậu phẫu tim",
    doctor: "BS. Trần Quốc Huy",
    date: "15/10/2025",
    meds: ["Eliquis 5mg x 2", "Perindopril 5mg"],
  },
  {
    id: 902,
    title: "Kết quả xét nghiệm máu",
    doctor: "BS. Nguyễn Phượng",
    date: "18/09/2025",
    meds: ["Báo cáo PDF kèm biểu đồ AI"],
  },
];

const TABS = [
  { id: "health-profile", label: "Hồ sơ y tế" },
  { id: "history", label: "Lịch sử khám bệnh" },
  { id: "appointments", label: "Lịch hẹn" },
  { id: "prescriptions", label: "Đơn thuốc / xét nghiệm" },
];

function MedicalRecordsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("health-profile");
  const [facilities, setFacilities] = useState(FACILITY_DATA);
  const [facilityForm, setFacilityForm] = useState({ name: "", doctor: "", specialty: "" });
  const [selectedHistory, setSelectedHistory] = useState(HISTORY[0]);
  const [selectedAppointment, setSelectedAppointment] = useState(APPOINTMENTS[0]);
  const [selectedPrescription, setSelectedPrescription] = useState(PRESCRIPTIONS[0]);

  const summaryStats = useMemo(
    () => [
      { label: "Lịch hẹn đang mở", value: APPOINTMENTS.filter((a) => a.status === "Sắp diễn ra").length },
      { label: "Hồ sơ y tế", value: HISTORY.length },
      { label: "Đơn thuốc", value: PRESCRIPTIONS.length },
    ],
    []
  );

  const handleAddFacility = (event) => {
    event.preventDefault();
    if (!facilityForm.name || !facilityForm.doctor) return;
    setFacilities((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...facilityForm,
      },
    ]);
    setFacilityForm({ name: "", doctor: "", specialty: "" });
  };

  const handleDownload = (type) => {
    alert(`Tệp ${type} sẽ được tải xuống trong phiên bản chính thức.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="records-page">
      <section className="records-hero">
        <div>
          <p className="eyebrow">Hồ sơ sức khỏe</p>
          <h1>Quản lý hồ sơ y tế, lịch hẹn và đơn thuốc trên một nền tảng</h1>
          <p>
            Tất cả dữ liệu điều trị được đồng bộ theo chuẩn HL7 và bảo mật AES-256. Tải tài liệu, gửi cho bác sĩ hoặc
            chia sẻ với bảo hiểm chỉ bằng một cú nhấp chuột.
          </p>
        </div>
        <button className="ghost" onClick={handlePrint}>
          In / tải PDF
        </button>
      </section>

      <section className="records-stats">
        {summaryStats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <nav className="records-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="records-panel">
        {activeTab === "health-profile" && (
          <div className="records-grid">
            <div>
              <h3>Cơ sở y tế đang theo dõi</h3>
              <p>Thông tin điều dưỡng, bác sĩ phụ trách và chuyên khoa hiện tại.</p>
              <table>
                <thead>
                  <tr>
                    <th>Cơ sở</th>
                    <th>Bác sĩ</th>
                    <th>Chuyên khoa</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => (
                    <tr key={facility.id}>
                      <td>{facility.name}</td>
                      <td>{facility.doctor}</td>
                      <td>{facility.specialty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form className="records-form" onSubmit={handleAddFacility}>
              <h4>Thêm cơ sở mới</h4>
              <label>
                Cơ sở
                <input
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="HealthCare+ HCM"
                />
              </label>
              <label>
                Bác sĩ phụ trách
                <input
                  value={facilityForm.doctor}
                  onChange={(e) => setFacilityForm((prev) => ({ ...prev, doctor: e.target.value }))}
                  placeholder="BS. Nguyễn Văn A"
                />
              </label>
              <label>
                Chuyên khoa
                <input
                  value={facilityForm.specialty}
                  onChange={(e) => setFacilityForm((prev) => ({ ...prev, specialty: e.target.value }))}
                  placeholder="Tim mạch"
                />
              </label>
              <button type="submit" className="primary">
                Thêm cơ sở
              </button>
            </form>
          </div>
        )}

        {activeTab === "history" && (
          <div className="records-split">
            <aside>
              {HISTORY.map((item) => (
                <button
                  key={item.id}
                  className={selectedHistory?.id === item.id ? "history-item active" : "history-item"}
                  onClick={() => setSelectedHistory(item)}
                >
                  <span>{item.date}</span>
                  <strong>{item.summary}</strong>
                  <small>{item.department}</small>
                </button>
              ))}
            </aside>
            {selectedHistory && (
              <div className="history-detail">
                <h4>{selectedHistory.summary}</h4>
                <p>
                  {selectedHistory.date} • {selectedHistory.department}
                </p>
                <p>Bác sĩ: {selectedHistory.doctor}</p>
                <p>{selectedHistory.detail}</p>
                <div className="detail-actions">
                  <button className="ghost" onClick={() => handleDownload("ho-so-y-te.pdf")}>
                    Tải hồ sơ PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="records-split">
            <aside>
              {APPOINTMENTS.map((item) => (
                <button
                  key={item.id}
                  className={selectedAppointment?.id === item.id ? "history-item active" : "history-item"}
                  onClick={() => setSelectedAppointment(item)}
                >
                  <span>{item.status}</span>
                  <strong>{item.time}</strong>
                  <small>{item.doctor}</small>
                </button>
              ))}
            </aside>
            {selectedAppointment && (
              <div className="history-detail">
                <h4>{selectedAppointment.doctor}</h4>
                <p>
                  {selectedAppointment.department} • {selectedAppointment.time}
                </p>
                <p>Địa điểm: {selectedAppointment.location}</p>
                <div className="detail-actions">
                  <button className="ghost" onClick={() => onNavigate("booking")}>Đổi lịch</button>
                  <button className="primary" onClick={() => handleDownload("lich-hen.ics")}>
                    Tải file lịch
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "prescriptions" && (
          <div className="records-split">
            <aside>
              {PRESCRIPTIONS.map((item) => (
                <button
                  key={item.id}
                  className={selectedPrescription?.id === item.id ? "history-item active" : "history-item"}
                  onClick={() => setSelectedPrescription(item)}
                >
                  <span>{item.date}</span>
                  <strong>{item.title}</strong>
                  <small>{item.doctor}</small>
                </button>
              ))}
            </aside>
            {selectedPrescription && (
              <div className="history-detail">
                <h4>{selectedPrescription.title}</h4>
                <p>
                  {selectedPrescription.date} • {selectedPrescription.doctor}
                </p>
                <ul>
                  {selectedPrescription.meds.map((med) => (
                    <li key={med}>{med}</li>
                  ))}
                </ul>
                <div className="detail-actions">
                  <button className="ghost" onClick={() => handleDownload("don-thuoc.pdf")}>
                    Tải PDF
                  </button>
                  <button className="primary" onClick={handlePrint}>
                    In đơn thuốc
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export { MedicalRecordsPage };
