const Joi = require('joi');
const db = require('../providers/db');
const Department = require('./department.model');

async function ensureDepartmentExists(department_id) {
  if (department_id == null) return null;
  const dept = await Department.findById(department_id);
  if (!dept) {
    const err = new Error('Department does not exist');
    err.status = 400;
    err.details = [{ message: 'Department does not exist', path: ['department_id'] }];
    throw err;
  }
  return dept;
}

async function findAll({ q, specialty, district, department_id, limit = 50, offset = 0 } = {}) {
  const where = [];
  const params = [];
  if (q) {
    where.push(
      '(d.first_name LIKE ? OR d.last_name LIKE ? OR d.specialty LIKE ? OR d.hospital LIKE ? OR dep.name LIKE ?)',
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (specialty) { where.push('d.specialty = ?'); params.push(specialty); }
  if (district) { where.push('d.district = ?'); params.push(district); }
  if (department_id) { where.push('d.department_id = ?'); params.push(department_id); }
  const sql = `
    SELECT d.doctor_id,
           d.first_name,
           d.last_name,
           d.specialty,
           d.hospital,
           d.district,
           d.department_id,
           dep.name AS department_name,
           d.rating,
           d.reviews
      FROM doctor d
      LEFT JOIN department dep ON dep.department_id = d.department_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY d.doctor_id DESC
     LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));
  const [rows] = await db.query(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT d.doctor_id,
            d.first_name,
            d.last_name,
            d.specialty,
            d.hospital,
            d.district,
            d.department_id,
            dep.name AS department_name,
            d.rating,
            d.reviews
       FROM doctor d
       LEFT JOIN department dep ON dep.department_id = d.department_id
      WHERE d.doctor_id = ?`,
    [id],
  );
  return rows[0] || null;
}

async function create(doc) {
  const { error, value } = validateCreate(doc);
  if (error) {
    const e = new Error('Validation');
    e.status = 400;
    e.details = error.details;
    throw e;
  }
  await ensureDepartmentExists(value.department_id ?? null);
  const [res] = await db.query(
    'INSERT INTO doctor (first_name, last_name, specialty, hospital, district, department_id) VALUES (?, ?, ?, ?, ?, ?)',
    [value.first_name, value.last_name, value.specialty, value.hospital || null, value.district || null, value.department_id || null],
  );
  return findById(res.insertId);
}

async function update(id, doc) {
  const { error, value } = validateUpdate(doc);
  if (error) {
    const e = new Error('Validation');
    e.status = 400;
    e.details = error.details;
    throw e;
  }
  const current = await findById(id);
  if (!current) return null;
  if (Object.prototype.hasOwnProperty.call(value, 'department_id')) {
    await ensureDepartmentExists(value.department_id ?? null);
  }
  const edited = { ...current, ...value };
  await db.query(
    'UPDATE doctor SET first_name=?, last_name=?, specialty=?, hospital=?, district=?, department_id=? WHERE doctor_id=?',
    [
      edited.first_name,
      edited.last_name,
      edited.specialty,
      edited.hospital || null,
      edited.district || null,
      edited.department_id || null,
      id,
    ],
  );
  return findById(id);
}

function validateCreate(body) {
  return Joi.object({
    first_name: Joi.string().min(2).max(150).required(),
    last_name: Joi.string().min(2).max(150).required(),
    specialty: Joi.string().min(2).max(150).required(),
    hospital: Joi.string().min(2).max(255).allow('', null),
    district: Joi.string().min(2).max(100).allow('', null),
    department_id: Joi.number().integer().positive().allow(null),
  })
    .options({ abortEarly: false })
    .validate(body);
}

function validateUpdate(body) {
  return Joi.object({
    first_name: Joi.string().min(2).max(150),
    last_name: Joi.string().min(2).max(150),
    specialty: Joi.string().min(2).max(150),
    hospital: Joi.string().min(2).max(255).allow('', null),
    district: Joi.string().min(2).max(100).allow('', null),
    department_id: Joi.number().integer().positive().allow(null),
  })
    .min(1)
    .options({ abortEarly: false })
    .validate(body);
}

module.exports = { findAll, findById, create, update, validateCreate, validateUpdate };
