const Joi = require('joi');
const { Op } = require('sequelize');
const { Doctor, Department } = require('../database');

const baseSchema = {
  first_name: Joi.string().min(2).max(150).required(),
  last_name: Joi.string().min(2).max(150).required(),
  specialty: Joi.string().min(2).max(150).required(),
  hospital: Joi.string().min(2).max(255).allow('', null),
  district: Joi.string().min(2).max(100).allow('', null),
  department_id: Joi.number().integer().positive().allow(null),
};

const createSchema = Joi.object(baseSchema).options({ abortEarly: false });
const updateSchema = Joi.object(baseSchema).fork(Object.keys(baseSchema), (schema) => schema.optional()).min(1).options({ abortEarly: false });

function ensureValid(error) {
  if (!error) return;
  const err = new Error('Validation');
  err.status = 400;
  err.details = error.details;
  throw err;
}

function serialize(doctor) {
  if (!doctor) return null;
  const plain = doctor.get({ plain: true });
  if (doctor.department) {
    plain.department = doctor.department.get({ plain: true });
    plain.department_name = doctor.department.name;
  }
  plain.name = `${plain.first_name} ${plain.last_name}`.trim();
  return plain;
}

function buildFilters({ q, specialty, district, department_id }) {
  const where = {};
  if (specialty) where.specialty = specialty;
  if (district) where.district = district;
  if (department_id) where.department_id = department_id;
  if (q) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${q}%` } },
      { last_name: { [Op.like]: `%${q}%` } },
      { specialty: { [Op.like]: `%${q}%` } },
      { hospital: { [Op.like]: `%${q}%` } },
    ];
  }
  return where;
}

async function findAll({ q, specialty, district, department_id, limit = 50, offset = 0 } = {}) {
  const doctors = await Doctor.findAll({
    where: buildFilters({ q, specialty, district, department_id }),
    include: [{ model: Department, as: 'department', attributes: ['department_id', 'name'] }],
    order: [['doctor_id', 'DESC']],
    limit: Number(limit),
    offset: Number(offset),
  });
  return doctors.map(serialize);
}

async function findById(id) {
  const doctor = await Doctor.findByPk(id, {
    include: [{ model: Department, as: 'department', attributes: ['department_id', 'name'] }],
  });
  return serialize(doctor);
}

async function ensureDepartmentExists(departmentId) {
  if (!departmentId) return;
  const dept = await Department.findByPk(departmentId);
  if (!dept) {
    const err = new Error('Department does not exist');
    err.status = 400;
    err.details = [{ message: 'Department not found', path: ['department_id'] }];
    throw err;
  }
}

async function create(payload) {
  const { error, value } = createSchema.validate(payload);
  ensureValid(error);
  await ensureDepartmentExists(value.department_id);
  const doctor = await Doctor.create(value);
  return findById(doctor.doctor_id);
}

async function update(id, payload) {
  const { error, value } = updateSchema.validate(payload);
  ensureValid(error);
  const doctor = await Doctor.findByPk(id);
  if (!doctor) return null;
  if (Object.prototype.hasOwnProperty.call(value, 'department_id')) {
    await ensureDepartmentExists(value.department_id);
  }
  await doctor.update(value);
  return findById(id);
}

async function remove(id) {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) return null;
  await doctor.destroy();
  return serialize(doctor);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
