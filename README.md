# HealthCare+ Website Enhancements
This bundle mirrors the earlier Pan project structure (client + server) but with data, flows and copy tailored for a healthcare portal.

## Project layout

- `client/` – public-facing React (Vite + TypeScript) application
- `portal/` – management portal (React + TypeScript)
- `server/` – Express 4 API with JWT auth, Redis blacklist, MySQL models and seeded healthcare data converted from the Pan domain
- `README.md` – this file

## Getting started

### Client (public app)
```powershell
cd client
npm i
npm run dev
```

### Portal (internal app)
```powershell
cd portal
npm i
npm run dev
```

### Server (API)
```powershell
cd server
npm i
npm run dev
# optional but recommended once MySQL is up:
npm run seed
```

> The seed script loads a comprehensive set of doctors, patients, appointments and medical records that were mapped from the original Pan bakery dataset into the healthcare context.
> It now also seeds doctor availability slots that power the booking flow.

## What's new in this iteration
- Doctor availability management (backend + portal `/admin/availability`) with conflict-aware scheduling.
- Department catalog + API, doctors được gán vào khoa để phủ các màn hình “Bệnh điều trị” và “Đội ngũ bác sĩ”.
- Appointment reporting endpoint (`GET /api/v1/appointments/stats/summary`) surfaced on the admin portal for quick KPIs.
- New OpenAPI document (`server/docs/openapi.yaml`) loaded automatically at `/api-docs`.
- Schema/seed refresh introducing `department`, `doctor_availability` tables and richer healthcare sample data.
- Email xác nhận lịch hẹn được gửi qua Nodemailer (cấu hình SMTP bằng các biến `MAIL_*`, mặc định log ra console ở chế độ demo).
- Public client mở thêm các trang “Bệnh điều trị”, “Công nghệ hiện đại”, “Cảm nhận khách hàng”, “Đội ngũ bác sĩ”, “Trung tâm hỗ trợ” cùng widget chat (Hotline + AI) kết nối API `/api/v1/support`.
- Trang đặt lịch mới có 3 bước (chọn bác sĩ → nhập thông tin → in/tải phiếu), kiểm tra số điện thoại 10 số, email hợp lệ và mật khẩu mạnh.
- Hồ sơ y tế bổ sung modal “Xem chi tiết/In phiếu/Tải đơn”, khả năng thêm bác sĩ/cơ sở đã liên kết và hướng dẫn chuẩn bị trước khám.
- Login/Register (client) bổ sung xác thực dữ liệu, luồng quên mật khẩu và nút social login thực sự mở OAuth backend.

## Sample credentials

Same as in `server/README.md`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@healthcareplus.vn` | `Admin@123` |
| Admin | `support@healthcareplus.vn` | `Support@123` |
| User | `linh.tran@care.vn` | `Patient@123` |
| User | `bao.le@care.vn` | `Patient@123` |
| User | `chi.nguyen@care.vn` | `Patient@123` |
| User | `hoa.dang@care.vn` | `Patient@123` |

Make sure MySQL (default `localhost:3307`) and Redis are running before launching the API or seed script. Update `.env` if you need different connection parameters.
