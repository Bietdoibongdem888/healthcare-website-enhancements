const Joi = require('joi');
const { SupportSession, SupportMessage, Patient } = require('../database');

const sessionSchema = Joi.object({
  channel: Joi.string().valid('hotline', 'ai').default('ai'),
  patient_id: Joi.number().integer().allow(null),
  contact_name: Joi.string().max(150).allow('', null),
  contact_email: Joi.string().email().allow('', null),
  contact_phone: Joi.string().max(20).allow('', null),
  last_topic: Joi.string().max(255).allow('', null),
}).options({ abortEarly: false });

const messageSchema = Joi.object({
  author: Joi.string().valid('patient', 'agent', 'assistant').required(),
  content: Joi.string().min(2).max(2000).required(),
  patient_id: Joi.number().integer().allow(null),
}).options({ abortEarly: false });

function ensureValid(error) {
  if (!error) return;
  const err = new Error('Validation');
  err.status = 400;
  err.details = error.details;
  throw err;
}

function toSession(session) {
  if (!session) return null;
  const plain = session.get({ plain: true });
  if (session.patient) {
    plain.patient = session.patient.get({ plain: true });
  }
  return plain;
}

function toMessage(message) {
  if (!message) return null;
  const plain = message.get({ plain: true });
  if (message.patient) {
    plain.patient = message.patient.get({ plain: true });
  }
  return plain;
}

async function createSession(payload = {}) {
  const { error, value } = sessionSchema.validate(payload);
  ensureValid(error);
  const session = await SupportSession.create(value);
  return toSession(session);
}

async function findSessionById(id) {
  const session = await SupportSession.findByPk(id, {
    include: [{ model: Patient, as: 'patient', attributes: ['patient_id', 'first_name', 'last_name', 'email', 'contact_no'] }],
  });
  return toSession(session);
}

async function listMessages(sessionId, { limit = 100 } = {}) {
  const messages = await SupportMessage.findAll({
    where: { session_id: sessionId },
    include: [{ model: Patient, as: 'patient', attributes: ['patient_id', 'first_name', 'last_name', 'email'] }],
    order: [['created_at', 'ASC'], ['message_id', 'ASC']],
    limit: Number(limit),
  });
  return messages.map(toMessage);
}

async function appendMessage(sessionId, payload) {
  const { error, value } = messageSchema.validate(payload);
  ensureValid(error);
  const message = await SupportMessage.create({ ...value, session_id: sessionId });
  await SupportSession.update({ updated_at: new Date() }, { where: { session_id: sessionId } });
  return toMessage(await SupportMessage.findByPk(message.message_id, {
    include: [{ model: Patient, as: 'patient', attributes: ['patient_id', 'first_name', 'last_name', 'email'] }],
  }));
}

async function closeSession(sessionId) {
  await SupportSession.update({ status: 'closed', updated_at: new Date() }, { where: { session_id: sessionId } });
  return findSessionById(sessionId);
}

async function updateTopic(sessionId, topic) {
  await SupportSession.update({ last_topic: topic || null }, { where: { session_id: sessionId } });
  return findSessionById(sessionId);
}

async function deleteSession(sessionId) {
  const session = await SupportSession.findByPk(sessionId);
  if (!session) return null;
  await session.destroy();
  return toSession(session);
}

module.exports = {
  createSession,
  findSessionById,
  listMessages,
  appendMessage,
  closeSession,
  updateTopic,
  deleteSession,
};
