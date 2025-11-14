const Joi = require('joi');
const { MedicalRecord, Doctor } = require('../database');

const schema = Joi.object({
  patient_id: Joi.number().integer().required(),
  doctor_id: Joi.number().integer().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
}).options({ abortEarly: false });

function ensureValid(error) {
  if (!error) return;
  const err = new Error('Validation');
  err.status = 400;
  err.details = error.details;
  throw err;
}

function serialize(record) {
  if (!record) return null;
  const plain = record.get({ plain: true });
  if (record.doctor) {
    plain.doctor = record.doctor.get({ plain: true });
  }
  return plain;
}

async function create(payload) {
  const { error, value } = schema.validate(payload);
  ensureValid(error);
  const record = await MedicalRecord.create(value);
  return serialize(record);
}

async function findByPatient(patientId) {
  const records = await MedicalRecord.findAll({
    where: { patient_id: patientId },
    include: [{ model: Doctor, as: 'doctor', attributes: ['doctor_id', 'first_name', 'last_name', 'specialty'] }],
    order: [['created_at', 'DESC']],
  });
  return records.map(serialize);
}

async function getById(id) {
  const record = await MedicalRecord.findByPk(id, {
    include: [{ model: Doctor, as: 'doctor', attributes: ['doctor_id', 'first_name', 'last_name', 'specialty'] }],
  });
  return serialize(record);
}

module.exports = {
  create,
  findByPatient,
  getById,
};
