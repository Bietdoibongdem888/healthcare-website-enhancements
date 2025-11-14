const Joi = require('joi');
const { Op } = require('sequelize');
const { Patient } = require('../database');

const baseFields = {
  first_name: Joi.string().min(2).max(150).required(),
  last_name: Joi.string().min(2).max(150).required(),
  contact_no: Joi.string().pattern(/^\+?\d{8,20}$/).allow('', null),
  email: Joi.string().email().allow('', null),
  date_of_birth: Joi.date().less('now').allow(null),
  gender: Joi.string().valid('male', 'female', 'other').allow(null),
  address: Joi.string().max(255).allow('', null),
  medical_history: Joi.string().allow('', null),
};

const createSchema = Joi.object(baseFields).options({ abortEarly: false });
const updateSchema = Joi.object(baseFields).fork(Object.keys(baseFields), (schema) => schema.optional()).min(1).options({ abortEarly: false });

function ensureValid(error) {
  if (!error) return;
  const err = new Error('Validation');
  err.status = 400;
  err.details = error.details;
  throw err;
}

function toPlain(record) {
  return record ? record.get({ plain: true }) : null;
}

async function create(payload) {
  const { error, value } = createSchema.validate(payload);
  ensureValid(error);
  const patient = await Patient.create(value);
  return toPlain(patient);
}

async function findAll({ q, limit = 50, offset = 0 } = {}) {
  const where = {};
  if (q) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${q}%` } },
      { last_name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
    ];
  }
  const patients = await Patient.findAll({
    where,
    order: [['patient_id', 'DESC']],
    limit: Number(limit),
    offset: Number(offset),
  });
  return patients.map((p) => p.get({ plain: true }));
}

async function findById(id) {
  const patient = await Patient.findByPk(id);
  return toPlain(patient);
}

async function update(id, payload) {
  const { error, value } = updateSchema.validate(payload);
  ensureValid(error);
  const patient = await Patient.findByPk(id);
  if (!patient) return null;
  await patient.update(value);
  return toPlain(patient);
}

async function remove(id) {
  const patient = await Patient.findByPk(id);
  if (!patient) return null;
  await patient.destroy();
  return toPlain(patient);
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
};
