const Joi = require('joi');
const db = require('../providers/db');

async function create(patient) {
  const { error, value } = validateCreate(patient);
  if (error) { const e = new Error('Validation'); e.status=400; e.details=error; throw e; }
  const { first_name, last_name, contact_no, email } = value;
  const [result] = await db.query('INSERT INTO patient (first_name, last_name, contact_no, email) VALUES (?, ?, ?, ?)', [first_name, last_name, contact_no || null, email || null]);
  return { patient_id: result.insertId, first_name, last_name, contact_no: contact_no || null, email: email || null };
}

async function findAll({ q, limit = 50, offset = 0 } = {}) {
  const where = [];
  const params = [];
  if (q) { where.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const sql = `SELECT patient_id, first_name, last_name, contact_no, email FROM patient ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY patient_id DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));
  const [rows] = await db.query(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await db.query('SELECT patient_id, first_name, last_name, contact_no, email FROM patient WHERE patient_id = ?', [id]);
  return rows[0];
}

async function update(id, patient) {
  const { error, value } = validateUpdate(patient);
  if (error) { const e = new Error('Validation'); e.status=400; e.details=error; throw e; }
  const current = await findById(id);
  if (!current) return null;
  const edited = { ...current, ...value };
  await db.query('UPDATE patient SET first_name = ?, last_name = ?, contact_no = ?, email = ? WHERE patient_id = ?', [edited.first_name, edited.last_name, edited.contact_no || null, edited.email || null, id]);
  return edited;
}

function validateCreate(body) {
  return Joi.object({
    first_name: Joi.string().min(2).max(150).required(),
    last_name: Joi.string().min(2).max(150).required(),
    contact_no: Joi.string().pattern(/^\d+$/).min(9).max(20).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
  }).options({ abortEarly: false }).validate(body);
}

function validateUpdate(body) {
  return Joi.object({
    first_name: Joi.string().min(2).max(150),
    last_name: Joi.string().min(2).max(150),
    contact_no: Joi.string().pattern(/^\d+$/).min(9).max(20).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
  }).min(1).options({ abortEarly: false }).validate(body);
}

module.exports = { create, findAll, findById, update, validateCreate, validateUpdate };
