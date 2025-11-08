const Joi = require('joi');
const db = require('../providers/db');

const createSchema = Joi.object({
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
  max_patients: Joi.number().integer().min(1).max(20).default(1),
  notes: Joi.string().max(500).allow('', null),
}).options({ abortEarly: false });

function mapSlot(row) {
  if (!row) return null;
  return {
    availability_id: row.availability_id,
    doctor_id: row.doctor_id,
    start_time: row.start_time,
    end_time: row.end_time,
    max_patients: row.max_patients,
    booked_patients: row.booked_patients,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getById(id) {
  const [rows] = await db.query(
    `SELECT availability_id, doctor_id, start_time, end_time, max_patients, booked_patients, status, notes, created_at, updated_at 
     FROM doctor_availability WHERE availability_id = ?`,
    [id]
  );
  return mapSlot(rows[0]);
}

async function findByDoctor(doctorId, { from = null, to = null, status = null } = {}) {
  const where = ['doctor_id = ?'];
  const params = [doctorId];
  if (from) {
    where.push('end_time >= ?');
    params.push(new Date(from));
  }
  if (to) {
    where.push('start_time <= ?');
    params.push(new Date(to));
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  const sql = `SELECT availability_id, doctor_id, start_time, end_time, max_patients, booked_patients, status, notes, created_at, updated_at 
    FROM doctor_availability 
    WHERE ${where.join(' AND ')} 
    ORDER BY start_time ASC`;
  const [rows] = await db.query(sql, params);
  return rows.map(mapSlot);
}

async function create(doctorId, payload) {
  const { error, value } = createSchema.validate(payload);
  if (error) {
    const err = new Error('Validation error');
    err.status = 400;
    err.details = error.details;
    throw err;
  }
  const start = new Date(value.start_time);
  const end = new Date(value.end_time);

  const [overlaps] = await db.query(
    `SELECT availability_id FROM doctor_availability 
     WHERE doctor_id = ? 
       AND status <> 'blocked'
       AND NOT (? >= end_time OR ? <= start_time)`,
    [doctorId, start, end]
  );
  if (overlaps.length) {
    const err = new Error('Availability overlaps an existing slot');
    err.status = 409;
    throw err;
  }

  const [result] = await db.query(
    `INSERT INTO doctor_availability (doctor_id, start_time, end_time, max_patients, notes) 
     VALUES (?, ?, ?, ?, ?)`,
    [doctorId, start, end, value.max_patients, value.notes || null]
  );
  return await getById(result.insertId);
}

async function remove(availabilityId) {
  const slot = await getById(availabilityId);
  if (!slot) return null;
  const [booked] = await db.query(
    `SELECT COUNT(*) AS total FROM appointment 
     WHERE availability_id = ? AND status = 'scheduled'`,
    [availabilityId]
  );
  if (booked[0]?.total > 0) {
    const err = new Error('Cannot remove availability that still has scheduled appointments');
    err.status = 409;
    throw err;
  }
  await db.query('DELETE FROM doctor_availability WHERE availability_id = ?', [availabilityId]);
  return slot;
}

async function slotCovers(availabilityId, start, end) {
  const slot = await getById(availabilityId);
  if (!slot) return false;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate >= slot.start_time && endDate <= slot.end_time;
}

async function claim(doctorId, start, end) {
  const [rows] = await db.query(
    `SELECT availability_id 
       FROM doctor_availability
      WHERE doctor_id = ?
        AND status = 'available'
        AND start_time <= ?
        AND end_time >= ?
      ORDER BY start_time ASC
      LIMIT 1`,
    [doctorId, start, end]
  );
  if (!rows.length) return null;
  const availabilityId = rows[0].availability_id;
  const [update] = await db.query(
    `UPDATE doctor_availability 
        SET booked_patients = booked_patients + 1,
            status = CASE WHEN booked_patients + 1 >= max_patients THEN 'blocked' ELSE status END,
            updated_at = NOW()
      WHERE availability_id = ?
        AND booked_patients < max_patients`,
    [availabilityId]
  );
  if (!update.affectedRows) return null;
  return await getById(availabilityId);
}

async function reclaim(availabilityId) {
  const [update] = await db.query(
    `UPDATE doctor_availability 
        SET booked_patients = booked_patients + 1,
            status = CASE WHEN booked_patients + 1 >= max_patients THEN 'blocked' ELSE status END,
            updated_at = NOW()
      WHERE availability_id = ?
        AND booked_patients < max_patients`,
    [availabilityId]
  );
  if (!update.affectedRows) return null;
  return await getById(availabilityId);
}

async function release(availabilityId) {
  if (!availabilityId) return null;
  const [update] = await db.query(
    `UPDATE doctor_availability 
        SET booked_patients = GREATEST(booked_patients - 1, 0),
            status = CASE WHEN booked_patients - 1 < max_patients THEN 'available' ELSE status END,
            updated_at = NOW()
      WHERE availability_id = ?`,
    [availabilityId]
  );
  if (!update.affectedRows) return null;
  return await getById(availabilityId);
}

module.exports = {
  create,
  findByDoctor,
  remove,
  claim,
  reclaim,
  release,
  slotCovers,
  getById,
};
