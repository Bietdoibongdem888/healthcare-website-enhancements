# Server skeleton

This folder is a lightweight server skeleton created to mirror the `Pan/server` structure and now ships with a healthcare dataset converted from the original Pan inventory sample.

How to use:

1. cd server
2. npm i
3. npm run dev
4. (Optional) `npm run seed` to load the HealthCare+ sample data set (doctors, patients, appointments, medical records, audit log).

The server exposes a small health endpoint at `/api/v1/health`.

## Sample Accounts

| Role   | Email                        | Password     |
|--------|------------------------------|--------------|
| Admin  | `admin@healthcareplus.vn`    | `Admin@123`  |
| Admin  | `support@healthcareplus.vn`  | `Support@123`|
| User   | `linh.tran@care.vn`          | `Patient@123`|
| User   | `bao.le@care.vn`             | `Patient@123`|
| User   | `chi.nguyen@care.vn`         | `Patient@123`|
| User   | `hoa.dang@care.vn`           | `Patient@123`|

## PAN-style Enhancements

- Error helpers under `helpers/errors`
- JWT with access/refresh + Redis blacklist under `src/providers/jwt.js`
- Middleware: `auth`, `error`, `permit`, `validate` under `src/middleware`
- Config via `config` package; edit `config/default.json` or `.env`

### Env Vars
- `PORT` (default 3000)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`
- `REDIS_URL` (for token blacklist)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` (bắt buộc khi `mail.transport = "smtp"`, nếu không hệ thống sẽ log email ra console)
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`/`FACEBOOK_CLIENT_SECRET` (tùy chọn cho social login)

### Endpoints
- `POST /api/v1/auth/login` -> { access, refresh, token }
- `POST /api/v1/auth/refresh` -> { access, refresh }
- `POST /api/v1/auth/logout` -> { message }

Appointments (auth required unless noted)
- `GET /api/v1/appointments` (doctor_id, patient_id, status, from, to)
- `GET /api/v1/appointments/mine` (auth → patient scope)
- `GET /api/v1/appointments/:id`
- `GET /api/v1/appointments/stats/summary` (admin)
- `GET /api/v1/appointments/patient/:patientId`
- `POST /api/v1/appointments` { patient_id, doctor_id, start_time, end_time?, notes } *(public booking allowed)*
- `POST /api/v1/appointments/:id/reschedule` { start_time, end_time? }
- `POST /api/v1/appointments/:id/cancel`

### Notes
- Run SQL in `db/schema.sql` and the migration section to add `end_time`, `status` and index.
- After edits, `npm i` to install new deps.

## Doctors
- GET /api/v1/doctors?q=&specialty=&limit=&offset=
- GET /api/v1/doctors/:id
- POST /api/v1/doctors (admin)
- PUT /api/v1/doctors/:id (admin)

## Departments
- GET /api/v1/departments
- GET /api/v1/departments/:id
- POST /api/v1/departments (admin)
- PUT /api/v1/departments/:id (admin)
- Doctor payloads bắt buộc `department_id` phải tồn tại (server sẽ trả lỗi 400 nếu ID không hợp lệ).

## Support & Hotline
- POST /api/v1/support/sessions { channel: "ai"|"hotline", contact_name?, contact_email?, topic? }
- GET /api/v1/support/sessions/:id
- GET /api/v1/support/sessions/:id/messages
- POST /api/v1/support/sessions/:id/messages { content }

> Channel = `ai`: bot phản hồi theo tri thức HealthCare+ (lấy dữ liệu khoa từ bảng `department`). Channel = `hotline`: lưu hội thoại và tự động gửi thông báo tiếp nhận cho điều dưỡng.

### Cấu trúc bảng mới
- `support_session`: lưu thông tin sesssion, liên kết `patient_id` (nullable), hotline/ai.
- `support_message`: lưu từng tin nhắn, đồng bộ với widget chat ở client.

## Availability
- GET /api/v1/doctors/:doctorId/availability (upcoming slots)
- POST /api/v1/doctors/:doctorId/availability (admin)
- DELETE /api/v1/doctors/:doctorId/availability/:availabilityId (admin)

## Patients
- GET /api/v1/patients?q=&limit=&offset=
- GET /api/v1/patients/:id
- POST /api/v1/patients (admin)
- PUT /api/v1/patients/:id (admin)

All write operations require `role=admin` in JWT payload.

## Auth Endpoints
- POST /api/v1/auth/register { first_name, last_name, email, password, role? }
- POST /api/v1/auth/login { email, password }
- POST /api/v1/auth/refresh { access, refresh }
- POST /api/v1/auth/logout { access, refresh }
- POST /api/v1/auth/change-password { current_password, new_password } (auth)
- GET  /api/v1/auth/me (auth)
- POST /api/v1/auth/forgot-password/email-otp { email }
- POST /api/v1/auth/reset-password/email-otp { email, otp, new_password }
- POST /api/v1/auth/forgot-password/phone { phone }
- POST /api/v1/auth/reset-password/phone { phone, otp, new_password }

## Public Endpoints
- GET /api/v1/doctors?q=&specialty=&district=&limit=&offset=
- GET /api/v1/doctors/:id
- GET /api/v1/doctors/:doctorId/availability
- POST /api/v1/appointments { doctor_id, start_time, notes?, patient_id? | patient{ first_name, last_name, contact_no, email } }

## Email thông báo
- Sau khi tạo lịch hẹn, hệ thống tự động gửi email xác nhận cho bệnh nhân (qua Nodemailer). Nếu chưa cấu hình SMTP, nội dung sẽ được ghi ra console.

## Records (auth)
- GET /api/v1/records/patient/:patientId
- GET /api/v1/records/:id
- POST /api/v1/records (admin)
