const { Op, fn, col, literal } = require('sequelize');
const { Appointment, Patient, Doctor, Availability, Department, sequelize } = require('../database');
const AvailabilityService = require('./doctor_availability.model');

const ACTIVE_STATUSES = ['pending', 'confirmed'];

function defaultEnd(start) {
  return new Date(start.getTime() + 30 * 60000);
}

function toPlain(record) {
  if (!record) return null;
  const plain = record.get({ plain: true });
  plain.id = plain.appointment_id;
  return plain;
}

async function ensurePatientId(payload, transaction) {
  if (payload.patient_id) {
    const exists = await Patient.findByPk(payload.patient_id, { transaction });
    if (!exists) {
      const err = new Error('Patient not found');
      err.status = 400;
      throw err;
    }
    return payload.patient_id;
  }
  const details = payload.patient || {};
  if (!details.first_name && !details.last_name && !details.email) {
    return null;
  }
  const patient = await Patient.create(
    {
      first_name: details.first_name || 'User',
      last_name: details.last_name || 'Client',
      contact_no: details.contact_no || null,
      email: details.email || null,
      date_of_birth: details.date_of_birth || null,
      gender: details.gender || null,
      address: details.address || null,
    },
    { transaction }
  );
  return patient.patient_id;
}

async function hasConflict({ doctor_id, start_time, end_time, excludeId = null, transaction }) {
  const where = {
    doctor_id,
    status: { [Op.in]: ACTIVE_STATUSES },
    [Op.and]: [
      { start_time: { [Op.lt]: end_time } },
      { end_time: { [Op.gt]: start_time } },
    ],
  };
  if (excludeId) {
    where.appointment_id = { [Op.ne]: excludeId };
  }
  const count = await Appointment.count({ where, transaction });
  return count > 0;
}

async function withinTransaction(handler) {
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

async function create(payload) {
  return withinTransaction(async (transaction) => {
    const patientId = await ensurePatientId(payload, transaction);
    const doctorId = payload.doctor_id;
    const start = new Date(payload.start_time);
    if (!doctorId || Number.isNaN(start.getTime())) {
      const err = new Error('Invalid payload');
      err.status = 400;
      throw err;
    }
    const end = payload.end_time ? new Date(payload.end_time) : defaultEnd(start);
    if (await hasConflict({ doctor_id: doctorId, start_time: start, end_time: end, transaction })) {
      const err = new Error('Doctor has a conflicting appointment');
      err.status = 409;
      throw err;
    }
    const slot = await AvailabilityService.claim(doctorId, start, end, { transaction });
    if (!slot) {
      const err = new Error('No availability slot matches the requested time window');
      err.status = 409;
      throw err;
    }
    const appointment = await Appointment.create(
      {
        patient_id: patientId,
        doctor_id: doctorId,
        availability_id: slot.availability_id,
        start_time: start,
        end_time: end,
        notes: payload.notes || '',
        status: 'pending',
      },
      { transaction }
    );
    return toPlain(appointment);
  });
}

async function findById(id) {
  const appt = await Appointment.findByPk(id, {
    include: [
      { model: Patient, as: 'patient' },
      { model: Doctor, as: 'doctor', include: [{ model: Department, as: 'department', attributes: ['department_id', 'name'] }] },
      { model: Availability, as: 'availability' },
    ],
  });
  return toPlain(appt);
}

async function findDetailedById(id) {
  return findById(id);
}

async function findAll({ doctor_id, patient_id, status, from, to } = {}) {
  const where = {};
  if (doctor_id) where.doctor_id = doctor_id;
  if (patient_id) where.patient_id = patient_id;
  if (status) where.status = status;
  if (from || to) {
    where.start_time = {};
    if (from) where.start_time[Op.gte] = new Date(from);
    if (to) where.start_time[Op.lte] = new Date(to);
  }
  const rows = await Appointment.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['patient_id', 'first_name', 'last_name', 'email'] },
      { model: Doctor, as: 'doctor', attributes: ['doctor_id', 'first_name', 'last_name', 'specialty'] },
    ],
    order: [['start_time', 'DESC']],
  });
  return rows.map(toPlain);
}

async function cancel(id) {
  return withinTransaction(async (transaction) => {
    const appt = await Appointment.findByPk(id, { transaction });
    if (!appt) return null;
    if (appt.status === 'cancelled') return appt.get({ plain: true });
    if (appt.availability_id) {
      await AvailabilityService.release(appt.availability_id, { transaction });
    }
    await appt.update({ status: 'cancelled' }, { transaction });
    return toPlain(appt);
  });
}

async function reschedule(id, payload) {
  return withinTransaction(async (transaction) => {
    const appt = await Appointment.findByPk(id, { transaction });
    if (!appt) return null;
    const start = new Date(payload.start_time);
    const end = payload.end_time ? new Date(payload.end_time) : defaultEnd(start);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      const err = new Error('Invalid reschedule payload');
      err.status = 400;
      throw err;
    }
    if (await hasConflict({ doctor_id: appt.doctor_id, start_time: start, end_time: end, excludeId: id, transaction })) {
      const err = new Error('Doctor has a conflicting appointment');
      err.status = 409;
      throw err;
    }

    let availabilityId = appt.availability_id;
    const canReuse = availabilityId
      ? await AvailabilityService.slotCovers(availabilityId, start, end)
      : false;
    let claimedSlot = null;
    if (!canReuse) {
      claimedSlot = await AvailabilityService.claim(appt.doctor_id, start, end, { transaction });
      if (!claimedSlot) {
        const err = new Error('No availability slot matches the requested time window');
        err.status = 409;
        throw err;
      }
      availabilityId = claimedSlot.availability_id;
    }

    await appt.update({ start_time: start, end_time: end, availability_id: availabilityId }, { transaction });

    if (claimedSlot && appt.availability_id && appt.availability_id !== availabilityId) {
      await AvailabilityService.release(appt.availability_id, { transaction });
    }

    return toPlain(appt);
  });
}

async function updateFields(id, payload = {}) {
  const allowedStatus = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (payload.status && !allowedStatus.includes(payload.status)) {
    const err = new Error('Invalid status value');
    err.status = 400;
    throw err;
  }
  const appt = await Appointment.findByPk(id);
  if (!appt) return null;
  await appt.update({
    status: payload.status || appt.status,
    notes: Object.prototype.hasOwnProperty.call(payload, 'notes') ? payload.notes : appt.notes,
  });
  return toPlain(appt);
}

async function findByPatient(patientId) {
  const rows = await Appointment.findAll({
    where: { patient_id: patientId },
    include: [{ model: Doctor, as: 'doctor', attributes: ['doctor_id', 'first_name', 'last_name', 'specialty'] }],
    order: [['start_time', 'DESC']],
  });
  return rows.map(toPlain);
}

async function summary({ windowDays = 14 } = {}) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 3600 * 1000);

  const [statusRows, topRows, dailyRows] = await Promise.all([
    Appointment.findAll({
      attributes: ['status', [fn('COUNT', col('appointment_id')), 'total']],
      group: ['status'],
    }),
    Appointment.findAll({
      attributes: ['doctor_id', [fn('COUNT', col('appointment_id')), 'upcoming']],
      where: {
        status: { [Op.in]: ACTIVE_STATUSES },
        start_time: { [Op.gte]: now },
      },
      include: [{ model: Doctor, as: 'doctor', attributes: ['first_name', 'last_name'] }],
      group: ['doctor_id', 'doctor.doctor_id', 'doctor.first_name', 'doctor.last_name'],
      order: [[literal('upcoming'), 'DESC']],
      limit: 8,
    }),
    Appointment.findAll({
      attributes: [
        [literal('DATE(start_time)'), 'day'],
        [fn('COUNT', col('appointment_id')), 'total'],
      ],
      where: { start_time: { [Op.gte]: windowStart } },
      group: [literal('day')],
      order: [[literal('day'), 'ASC']],
    }),
  ]);

  const utilization = await Availability.findAll({
    where: { start_time: { [Op.gte]: now } },
    attributes: ['availability_id', 'doctor_id', 'start_time', 'end_time', 'max_patients', 'booked_patients'],
    include: [{ model: Doctor, as: 'doctor', attributes: ['first_name', 'last_name'] }],
    order: [['start_time', 'ASC']],
    limit: 20,
  });

  return {
    by_status: statusRows.map((row) => ({
      status: row.get('status'),
      total: Number(row.get('total')),
    })),
    top_doctors: topRows.map((row) => ({
      doctor_id: row.get('doctor_id'),
      name: `${row.doctor.first_name} ${row.doctor.last_name}`.trim(),
      upcoming: Number(row.get('upcoming')),
    })),
    daily_trend: dailyRows.map((row) => ({
      day: row.get('day'),
      total: Number(row.get('total')),
    })),
    utilization: utilization.map((row) => {
      const plain = row.get({ plain: true });
      return {
        ...plain,
        doctor_name: `${plain.doctor?.first_name || ''} ${plain.doctor?.last_name || ''}`.trim(),
        utilization:
          plain.max_patients > 0 ? Number((plain.booked_patients / plain.max_patients).toFixed(2)) : 0,
      };
    }),
  };
}

async function remove(id) {
  return withinTransaction(async (transaction) => {
    const appt = await Appointment.findByPk(id, { transaction });
    if (!appt) return null;
    if (appt.availability_id) {
      await AvailabilityService.release(appt.availability_id, { transaction });
    }
    await appt.destroy({ transaction });
    return toPlain(appt);
  });
}

module.exports = {
  create,
  findById,
  findDetailedById,
  findAll,
  cancel,
  updateFields,
  reschedule,
  findByPatient,
  summary,
  remove,
};
