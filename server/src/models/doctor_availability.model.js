const Joi = require('joi');
const { Op, Transaction, where, col } = require('sequelize');
const { Availability, Appointment, sequelize } = require('../database');

const createSchema = Joi.object({
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
  max_patients: Joi.number().integer().min(1).max(20).default(1),
  notes: Joi.string().max(500).allow('', null),
}).options({ abortEarly: false });

const updateSchema = Joi.object({
  start_time: Joi.date().iso(),
  end_time: Joi.date().iso(),
  max_patients: Joi.number().integer().min(1).max(20),
  status: Joi.string().valid('available', 'blocked'),
  notes: Joi.string().max(500).allow('', null),
})
  .min(1)
  .options({ abortEarly: false });

function assertValid(error) {
  if (!error) return;
  const err = new Error('Validation');
  err.status = 400;
  err.details = error.details;
  throw err;
}

function serialize(slot) {
  return slot ? slot.get({ plain: true }) : null;
}

function overlapWhere(doctorId, start, end, excludeId = null) {
  const where = {
    doctor_id: doctorId,
    status: { [Op.ne]: 'blocked' },
    [Op.and]: [
      { start_time: { [Op.lt]: end } },
      { end_time: { [Op.gt]: start } },
    ],
  };
  if (excludeId) {
    where.availability_id = { [Op.ne]: excludeId };
  }
  return where;
}

async function ensureNoOverlap(doctorId, start, end, excludeId = null) {
  const conflict = await Availability.count({ where: overlapWhere(doctorId, start, end, excludeId) });
  if (conflict > 0) {
    const err = new Error('Availability overlaps an existing slot');
    err.status = 409;
    throw err;
  }
}

async function getById(id) {
  const slot = await Availability.findByPk(id);
  return serialize(slot);
}

async function findByDoctor(doctorId, { from = null, to = null, status = null } = {}) {
  const where = { doctor_id: doctorId };
  if (from) {
    where.end_time = { [Op.gte]: new Date(from) };
  }
  if (to) {
    where.start_time = where.start_time || {};
    where.start_time[Op.lte] = new Date(to);
  }
  if (status) where.status = status;
  const slots = await Availability.findAll({
    where,
    order: [['start_time', 'ASC']],
  });
  return slots.map(serialize);
}

async function create(doctorId, payload) {
  const { error, value } = createSchema.validate(payload);
  assertValid(error);
  const start = new Date(value.start_time);
  const end = new Date(value.end_time);
  await ensureNoOverlap(doctorId, start, end);
  const slot = await Availability.create({
    doctor_id: doctorId,
    start_time: start,
    end_time: end,
    max_patients: value.max_patients,
    notes: value.notes || null,
  });
  return serialize(slot);
}

async function update(availabilityId, payload) {
  const { error, value } = updateSchema.validate(payload);
  assertValid(error);
  const slot = await Availability.findByPk(availabilityId);
  if (!slot) return null;
  const start = value.start_time ? new Date(value.start_time) : slot.start_time;
  const end = value.end_time ? new Date(value.end_time) : slot.end_time;
  if (end <= start) {
    const err = new Error('end_time must be greater than start_time');
    err.status = 400;
    throw err;
  }
  if (typeof value.max_patients === 'number' && value.max_patients < slot.booked_patients) {
    const err = new Error('max_patients cannot be lower than current bookings');
    err.status = 409;
    throw err;
  }
  await ensureNoOverlap(slot.doctor_id, start, end, slot.availability_id);
  await slot.update({
    start_time: start,
    end_time: end,
    max_patients: value.max_patients ?? slot.max_patients,
    status: value.status ?? slot.status,
    notes: Object.prototype.hasOwnProperty.call(value, 'notes') ? value.notes || null : slot.notes,
  });
  return serialize(slot);
}

async function remove(availabilityId) {
  const slot = await Availability.findByPk(availabilityId);
  if (!slot) return null;
  const activeAppointments = await Appointment.count({
    where: {
      availability_id: availabilityId,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });
  if (activeAppointments > 0) {
    const err = new Error('Cannot remove availability with scheduled appointments');
    err.status = 409;
    throw err;
  }
  await slot.destroy();
  return serialize(slot);
}

async function withinTransaction(existingTx, handler) {
  if (existingTx) {
    return handler(existingTx);
  }
  const transaction = await sequelize.transaction();
  try {
    const result = await handler(transaction);
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function claim(doctorId, start, end, options = {}) {
  return withinTransaction(options.transaction, async (transaction) => {
    const slot = await Availability.findOne({
      where: {
        doctor_id: doctorId,
        [Op.and]: [
          { start_time: { [Op.lte]: start } },
          { end_time: { [Op.gte]: end } },
          where(col('booked_patients'), '<', col('max_patients')),
        ],
      },
      transaction,
      lock: Transaction.LOCK.UPDATE,
      skipLocked: true,
      order: [['start_time', 'ASC']],
    });
    if (!slot) return null;
    slot.booked_patients += 1;
    if (slot.booked_patients >= slot.max_patients) {
      slot.status = 'blocked';
    }
    await slot.save({ transaction });
    return serialize(slot);
  });
}

async function reclaim(availabilityId, options = {}) {
  return withinTransaction(options.transaction, async (transaction) => {
    const slot = await Availability.findByPk(availabilityId, { transaction, lock: Transaction.LOCK.UPDATE });
    if (!slot) return null;
    if (slot.booked_patients >= slot.max_patients) {
      slot.status = 'blocked';
    }
    slot.booked_patients += 1;
    await slot.save({ transaction });
    return serialize(slot);
  });
}

async function release(availabilityId, options = {}) {
  if (!availabilityId) return null;
  return withinTransaction(options.transaction, async (transaction) => {
    const slot = await Availability.findByPk(availabilityId, { transaction, lock: Transaction.LOCK.UPDATE });
    if (!slot) return null;
    slot.booked_patients = Math.max(slot.booked_patients - 1, 0);
    if (slot.booked_patients < slot.max_patients) {
      slot.status = 'available';
    }
    await slot.save({ transaction });
    return serialize(slot);
  });
}

async function slotCovers(availabilityId, start, end) {
  const slot = await Availability.findByPk(availabilityId);
  if (!slot) return false;
  return start >= slot.start_time && end <= slot.end_time;
}

module.exports = {
  findByDoctor,
  create,
  update,
  remove,
  claim,
  reclaim,
  release,
  slotCovers,
  getById,
};
