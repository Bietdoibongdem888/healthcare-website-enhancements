const Joi = require('joi');
const db = require('../providers/db');

async function findAll() {
  const [rows] = await db.query('SELECT department_id, name, description FROM department ORDER BY name ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await db.query('SELECT department_id, name, description FROM department WHERE department_id = ?', [id]);
  return rows[0] || null;
}

async function create(payload) {
  const { error, value } = validate(payload);
  if (error) {
    const err = new Error('Validation');
    err.status = 400;
    err.details = error.details;
    throw err;
  }
  const [res] = await db.query('INSERT INTO department (name, description) VALUES (?, ?)', [value.name, value.description || null]);
  return { department_id: res.insertId, ...value };
}

async function update(id, payload) {
  const { error, value } = validate(payload);
  if (error) {
    const err = new Error('Validation');
    err.status = 400;
    err.details = error.details;
    throw err;
  }
  const current = await findById(id);
  if (!current) return null;
  await db.query('UPDATE department SET name = ?, description = ? WHERE department_id = ?', [
    value.name,
    value.description || null,
    id,
  ]);
  return { department_id: Number(id), ...value };
}

function validate(body) {
  return Joi.object({
    name: Joi.string().min(2).max(150).required(),
    description: Joi.string().allow('', null),
  })
    .options({ abortEarly: false })
    .validate(body);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
};
