import { useState } from "react";
import "./SupportCenterPage.css";

const FAQS = [
  {
    question: "Làm sao để tải phiếu khám hoặc đơn thuốc?",
    answer:
      "Vào mục “Hồ sơ sức khỏe” → chọn tab tương ứng → bấm “Xem chi tiết” để mở modal, tại đây bạn có thể tải PDF hoặc gửi email.",
  },
  {
    question: "Tôi muốn thay đổi lịch hẹn đã xác nhận?",
    answer:
      "Mở Lịch hẹn khám → nhấn “Xem chi tiết” → chọn “Hủy/Đổi lịch”. Bạn sẽ nhận được email xác nhận ngay sau khi hoàn tất.",
  },
  {
    question: "Tư vấn từ xa hoạt động như thế nào?",
    answer:
      "Hotline sẽ tạo phòng họp bảo mật, bác sĩ truy cập hồ sơ của bạn và gửi đơn thuốc điện tử sau buổi tư vấn.",
  },
];

const RESOURCES = [
  {
    icon: "📘",
    title: "Hướng dẫn sử dụng cổng khách hàng",
    file: "PDF 2.1MB",
  },
  {
    icon: "✅",
    title: "Checklist chuẩn bị trước phẫu thuật",
    file: "Checklist 1.2MB",
  },
  {
    icon: "💬",
    title: "Câu hỏi thường gặp về bảo hiểm",
    file: "FAQ 0.8MB",
  },
];

function SupportCenterPage({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="support-page">
      <section className="support-hero">
        <p className="eyebrow">Trung tâm hỗ trợ</p>
        <h1>Điều dưỡng trực và trợ lý AI sẵn sàng 24/7</h1>
        <p>
          Hotline, chat AI, điều dưỡng trực và kho tài liệu từng bước giúp bạn sử dụng HealthCare+ dễ dàng.
          Liên hệ bất cứ lúc nào để được hỗ trợ về đặt lịch, hồ sơ số hoặc kết nối bác sĩ.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={() => window.open("tel:1900633682")}>Gọi hotline</button>
          <button className="ghost" onClick={() => onNavigate("booking")}>Xem hướng dẫn đặt lịch</button>
        </div>
      </section>

      <section className="support-grid">
        <article className="support-card gradient">
          <div>
            <h3>Hotline 1900 633 682</h3>
            <p>Điều dưỡng trực 24/7 – hỗ trợ đặt lịch gấp, cấp cứu từ xa, hướng dẫn nhập viện.</p>
          </div>
          <ul>
            <li>Ưu tiên ca cấp cứu</li>
            <li>Theo dõi tình trạng điều trị</li>
            <li>Điều phối xe cấp cứu</li>
          </ul>
          <button className="primary" onClick={() => window.open("tel:1900633682")}>Gọi ngay</button>
        </article>
        <article className="support-card">
          <div>
            <h3>Trợ lý HealthCare+</h3>
            <p>
              Sử dụng widget góc phải màn hình để hỏi về phác đồ, công nghệ hoặc chuyển sang điều dưỡng thật.
            </p>
          </div>
          <button className="ghost" onClick={() => onNavigate("support")}>Mở chat AI</button>
        </article>
      </section>

      <section className="support-resources">
        <div className="section-header">
          <h4>Tài liệu nhanh</h4>
          <button className="ghost" onClick={() => onNavigate("medical-records")}>Xem hồ sơ số</button>
        </div>
        <div className="resource-grid">
          {RESOURCES.map((res) => (
            <article key={res.title}>
              <span className="emoji">{res.icon}</span>
              <h5>{res.title}</h5>
              <p>{res.file}</p>
              <button className="link">Tải về</button>
            </article>
          ))}
        </div>
      </section>

      <section className="support-faq">
        <h4>Câu hỏi thường gặp</h4>
        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const open = openFaq === index;
            return (
              <article key={faq.question} className={open ? "faq-item open" : "faq-item"}>
                <button type="button" onClick={() => setOpenFaq(open ? null : index)}>
                  {faq.question}
                  <span>{open ? "−" : "+"}</span>
                </button>
                {open && <p>{faq.answer}</p>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export { SupportCenterPage };
