const nodemailer = require('nodemailer');
const config = require('config');

const mailConfig = config.has('mail')
  ? config.get('mail')
  : {
      transport: 'console',
      from: 'no-reply@healthcare.local',
      smtp: {},
    };

let transporter = null;

if (mailConfig.transport === 'smtp') {
  transporter = nodemailer.createTransport({
    host: mailConfig.smtp?.host,
    port: Number(mailConfig.smtp?.port || 587),
    secure: Boolean(mailConfig.smtp?.secure),
    auth: mailConfig.smtp?.user
      ? {
          user: mailConfig.smtp.user,
          pass: mailConfig.smtp.pass,
        }
      : undefined,
  });
}

async function sendMail({ to, subject, html, text }) {
  if (!to) return;
  if (transporter) {
    await transporter.sendMail({
      from: mailConfig.from,
      to,
      subject,
      html,
      text,
    });
    return;
  }

  console.log('📧 [MAIL:DRY-RUN] --------------------------------');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Text:', text || '');
  console.log('HTML:', html || '');
  console.log('---------------------------------------------------');
}

async function send(to, subject, html, text) {
  await sendMail({ to, subject, html, text });
}

function resetTemplate(link) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;padding:8px 0;">
      <h2 style="color:#0ea5e9;margin-bottom:8px;">Đặt lại mật khẩu HealthCare+</h2>
      <p>Xin chào,</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Nhấn vào nút bên dưới trong vòng 60 phút để tiếp tục.</p>
      <p>
        <a href="${link}" style="background:#0ea5e9;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">Đặt lại mật khẩu</a>
      </p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu của bạn vẫn an toàn.</p>
      <p>Trân trọng,<br/>Đội ngũ HealthCare+</p>
    </div>
  `;
}

function appointmentTemplate({ patientName, doctorName, department, location, startTime, notes, bookingCode }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a">
      <h2 style="color:#0ea5e9">Xác nhận lịch hẹn HealthCare+</h2>
      <p>Chào ${patientName || 'Quý khách'},</p>
      <p>Lịch hẹn của bạn đã được xác nhận. Vui lòng kiểm tra chi tiết dưới đây:</p>
      <ul style="line-height:1.6">
        <li><strong>Bác sĩ:</strong> ${doctorName}</li>
        <li><strong>Khoa:</strong> ${department || 'Tổng quát'}</li>
        <li><strong>Thời gian:</strong> ${startTime}</li>
        <li><strong>Địa điểm:</strong> ${location || 'HealthCare+ Clinic'}</li>
        <li><strong>Mã lịch hẹn:</strong> ${bookingCode}</li>
      </ul>
      ${notes ? `<p><strong>Ghi chú của bạn:</strong> ${notes}</p>` : ''}
      <p>Nếu cần hỗ trợ, hãy phản hồi email này hoặc gọi hotline 1900 xxxx.</p>
      <p>Trân trọng,<br />Đội ngũ HealthCare+</p>
    </div>
  `;
}

async function sendAppointmentConfirmation({
  to,
  patientName,
  doctorName,
  department,
  location,
  startTime,
  notes,
  bookingCode,
}) {
  const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const formattedTime = startTime instanceof Date ? dateFormatter.format(startTime) : startTime;
  const subject = `Xác nhận lịch hẹn với ${doctorName}`;
  const html = appointmentTemplate({
    patientName,
    doctorName,
    department,
    location,
    startTime: formattedTime,
    notes,
    bookingCode,
  });
  await sendMail({
    to,
    subject,
    html,
    text: `Lịch hẹn với ${doctorName} vào ${formattedTime} tại ${location}. Mã: ${bookingCode}`,
  });
}

module.exports = {
  sendMail,
  sendAppointmentConfirmation,
  send,
  resetTemplate,
};
