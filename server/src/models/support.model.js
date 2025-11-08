const Joi = require('joi');
const db = require('../providers/db');

const sessionSchema = Joi.object({
  channel: Joi.string().valid('hotline', 'ai').default('ai'),
  patient_id: Joi.number().integer().positive().allow(null),
  contact_name: Joi.string().max(150).allow('', null),
  contact_email: Joi.string().email().allow('', null),
  contact_phone: Joi.string().max(20).allow('', null),
  last_topic: Joi.string().max(255).allow('', null),
});

const messageSchema = Joi.object({
  author: Joi.string().valid('patient', 'agent', 'assistant').required(),
  content: Joi.string().min(2).max(2000).required(),
});

async function createSession(payload = {}) {
  const { error, value } = sessionSchema.validate(payload, { abortEarly: false });
  if (error) {
    const err = new Error('Validation');
    err.status = 400;
    err.details = error.details;
    throw err;
  }
  const [res] = await db.query(
    `INSERT INTO support_session (channel, patient_id, contact_name, contact_email, contact_phone, last_topic)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      value.channel,
      value.patient_id || null,
      value.contact_name || null,
      value.contact_email || null,
      value.contact_phone || null,
      value.last_topic || null,
    ],
  );
  return findSessionById(res.insertId);
}

async function findSessionById(id) {
  const [rows] = await db.query(
    `SELECT session_id, channel, patient_id, contact_name, contact_email, contact_phone, status, last_topic,
            created_at, updated_at
       FROM support_session
      WHERE session_id = ?`,
    [id],
  );
  return rows[0] || null;
}

async function listMessages(sessionId, { limit = 100 } = {}) {
  const [rows] = await db.query(
    `SELECT message_id, session_id, author, content, created_at
       FROM support_message
      WHERE session_id = ?
      ORDER BY created_at ASC, message_id ASC
      LIMIT ?`,
    [sessionId, Number(limit)],
  );
  return rows;
}

async function appendMessage(sessionId, payload) {
  const { error, value } = messageSchema.validate(payload, { abortEarly: false });
  if (error) {
    const err = new Error('Validation');
    err.status = 400;
    err.details = error.details;
    throw err;
  }
  const [res] = await db.query(
    `INSERT INTO support_message (session_id, author, content) VALUES (?, ?, ?)`,
    [sessionId, value.author, value.content],
  );
  await db.query('UPDATE support_session SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?', [sessionId]);
  const [rows] = await db.query(
    'SELECT message_id, session_id, author, content, created_at FROM support_message WHERE message_id = ?',
    [res.insertId],
  );
  return rows[0];
}

async function closeSession(sessionId) {
  await db.query(
    'UPDATE support_session SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?',
    ['closed', sessionId],
  );
  return findSessionById(sessionId);
}

async function updateTopic(sessionId, topic) {
  await db.query('UPDATE support_session SET last_topic = ? WHERE session_id = ?', [
    topic || null,
    sessionId,
  ]);
}

module.exports = {
  createSession,
  findSessionById,
  listMessages,
  appendMessage,
  closeSession,
  updateTopic,
};
