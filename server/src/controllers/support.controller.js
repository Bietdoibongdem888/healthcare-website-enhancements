const Joi = require('joi');
const Support = require('../models/support.model');
const Department = require('../models/department.model');

const createSchema = Joi.object({
  channel: Joi.string().valid('hotline', 'ai').default('ai'),
  contact_name: Joi.string().max(150).allow('', null),
  contact_email: Joi.string().email().allow('', null),
  contact_phone: Joi.string().max(20).allow('', null),
  patient_id: Joi.number().integer().positive().allow(null),
  initial_message: Joi.string().allow('', null),
  topic: Joi.string().max(255).allow('', null),
});

const messageSchema = Joi.object({
  content: Joi.string().min(2).max(2000).required(),
});

function normalize(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function createSession(req, res, next) {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error('Validation');
      err.status = 400;
      err.details = error.details;
      throw err;
    }
    const session = await Support.createSession({
      channel: value.channel,
      patient_id: value.patient_id || null,
      contact_name: value.contact_name,
      contact_email: value.contact_email,
      contact_phone: value.contact_phone,
      last_topic: value.topic,
    });
    const messages = [];
    if (value.initial_message?.trim()) {
      const msg = await Support.appendMessage(session.session_id, {
        author: 'patient',
        content: value.initial_message.trim(),
      });
      messages.push(msg);
    }
    res.status(201).json({ session, messages });
  } catch (err) {
    next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await Support.findSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const messages = await Support.listMessages(session.session_id, { limit: 500 });
    res.json({ session, messages });
  } catch (err) {
    next(err);
  }
}

async function listMessages(req, res, next) {
  try {
    const session = await Support.findSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const messages = await Support.listMessages(session.session_id, { limit: 500 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

function buildAcknowledgement(session) {
  const name = session.contact_name || 'bạn';
  return `Xin chào ${name}, đội ngũ trực tuyến đã nhận được tin nhắn. Hotline 1900 633 682 sẽ liên hệ trong ít phút (giờ hành chính) hoặc bạn có thể theo dõi cuộc trò chuyện này để nhận phản hồi nhanh.`;
}

async function buildAssistantResponse(content, session) {
  const normalized = normalize(content);
  const departments = await Department.findAll();

  const findDepartment = () =>
    departments.find((dept) => normalized.includes(normalize(dept.name)) || normalized.includes(dept.name.split(' ')[1]?.toLowerCase() || ''));

  const matchedDept = findDepartment();

  const base = [];
  if (normalized.includes('lich') || normalized.includes('hen') || normalized.includes('dat')) {
    base.push(
      'Bạn có thể đặt lịch nhanh trên mục Đặt lịch của cổng khách hàng hoặc bấm “Đặt lịch khám” ở góc phải. Sau khi chọn bác sĩ/khung giờ, hệ thống sẽ gửi email xác nhận ngay.',
    );
  }
  if (matchedDept) {
    base.push(
      `Đối với ${matchedDept.name.toLowerCase()}, chúng tôi có đội ngũ bác sĩ đầu ngành cùng công nghệ điều trị cá thể hóa. Bạn có thể chọn mục “Đội ngũ bác sĩ” để xem danh sách chi tiết hoặc đặt lịch trực tiếp.`,
    );
  }
  if (normalized.includes('cong nghe') || normalized.includes('ai') || normalized.includes('robot')) {
    base.push(
      'HealthCare+ hiện áp dụng phòng mổ hybrid, AI đọc phim và hệ thống theo dõi từ xa 24/7. Lộ trình trải nghiệm sẽ được hiển thị khi bạn truy cập mục “Công nghệ hiện đại”.',
    );
  }
  if (!base.length) {
    base.push(
      'Tôi là trợ lý HealthCare+ AI. Bạn có thể hỏi về lịch khám, chuyên khoa điều trị, chi phí dự kiến hoặc các bước chuẩn bị hồ sơ y tế và tôi sẽ hướng dẫn ngay.',
    );
  }
  const reply = base.join(' ');
  return {
    content: reply,
    topic: matchedDept ? matchedDept.name : session.last_topic,
  };
}

async function sendMessage(req, res, next) {
  try {
    const { error, value } = messageSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error('Validation');
      err.status = 400;
      err.details = error.details;
      throw err;
    }
    const session = await Support.findSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const messages = [];
    const userMessage = await Support.appendMessage(session.session_id, {
      author: 'patient',
      content: value.content.trim(),
    });
    messages.push(userMessage);

    if (session.channel === 'ai') {
      const ai = await buildAssistantResponse(value.content, session);
      const assistantMsg = await Support.appendMessage(session.session_id, {
        author: 'assistant',
        content: ai.content,
      });
      messages.push(assistantMsg);
      if (ai.topic) {
        await Support.updateTopic(session.session_id, ai.topic);
      }
    } else {
      const acknowledgement = buildAcknowledgement(session);
      const agentMsg = await Support.appendMessage(session.session_id, {
        author: 'agent',
        content: acknowledgement,
      });
      messages.push(agentMsg);
    }

    const freshSession = await Support.findSessionById(session.session_id);
    res.json({ session: freshSession, messages });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSession,
  getSession,
  listMessages,
  sendMessage,
};
