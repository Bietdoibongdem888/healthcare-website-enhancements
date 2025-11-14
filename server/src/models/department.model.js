const Joi = require('joi');
const { Department, Doctor } = require('../database');

const payloadSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().allow('', null),
}).options({ abortEarly: false });

function assertValid(error) {
  if (!error) return;
  const err = new Error('Validation');
  err.status = 400;
  err.details = error.details;
  throw err;
}

function toPlain(entity) {
  return entity ? entity.get({ plain: true }) : null;
}

async function findAll() {
  const departments = await Department.findAll({ order: [['name', 'ASC']] });
  return departments.map((dept) => dept.get({ plain: true }));
}

async function findById(id) {
  const dept = await Department.findByPk(id);
  return toPlain(dept);
}

async function create(payload) {
  const { error, value } = payloadSchema.validate(payload);
  assertValid(error);
  const department = await Department.create(value);
  return toPlain(department);
}

async function update(id, payload) {
  const { error, value } = payloadSchema.validate(payload);
  assertValid(error);
  const department = await Department.findByPk(id);
  if (!department) return null;
  await department.update(value);
  return toPlain(department);
}

async function remove(id) {
  const department = await Department.findByPk(id);
  if (!department) return null;
  const doctorCount = await Doctor.count({ where: { department_id: id } });
  if (doctorCount > 0) {
    const err = new Error('Department is currently assigned to doctors');
    err.status = 409;
    err.details = [{ message: 'Department has doctors assigned', path: ['department_id'] }];
    throw err;
  }
  await department.destroy();
  return toPlain(department);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
