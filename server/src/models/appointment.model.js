const db = require('../providers/db');
const Availability = require('./doctor_availability.model');

async function ensurePatientId(input) {
  if (input.patient_id) return input.patient_id;
  if (input.patient && (input.patient.first_name || input.patient.last_name || input.patient.email)) {
    const p = input.patient;
    const [res] = await db.query(
      'INSERT INTO patient (first_name,last_name,contact_no,email) VALUES (?,?,?,?)',
      [p.first_name || 'User', p.last_name || 'Client', p.contact_no || null, p.email || null]
    );
    return res.insertId;
  }
  return null;
}

function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function defaultEnd(start) {
  return new Date(start.getTime() + 30 * 60000);
}

async function hasConflict({ doctor_id, start_time, end_time, excludeId = null }) {
  const sql = `
    SELECT 1
      FROM appointment
     WHERE doctor_id = ?
       AND status = 'scheduled'
       AND start_time < ?
       AND end_time > ?
       ${excludeId ? 'AND appointment_id <> ?' : ''}
     LIMIT 1
  `;
  const params = excludeId
    ? [doctor_id, end_time, start_time, excludeId]
    : [doctor_id, end_time, start_time];
  const [rows] = await db.query(sql, params);
  return rows.length > 0;
}

async function create(appointment) {
  let { patient_id, doctor_id, start_time, end_time: end } = appointment;
  patient_id = await ensurePatientId(appointment);
  const start = toDate(start_time);
  if (!patient_id || !doctor_id || !start) {
    const err = new Error('Invalid payload');
    err.status = 400;
    throw err;
  }
  const end_time = toDate(end) || defaultEnd(start);

  const conflict = await hasConflict({ doctor_id, start_time: start, end_time });
  if (conflict) {
    const err = new Error('Doctor has a conflicting appointment');
    err.status = 409;
    throw err;
  }

  const slot = await Availability.claim(doctor_id, start, end_time);
  if (!slot) {
    const err = new Error('No availability slot matches the requested time window');
    err.status = 409;
    throw err;
  }

  try {
    const [result] = await db.query(
      'INSERT INTO appointment (patient_id, doctor_id, availability_id, start_time, end_time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, slot.availability_id, start, end_time, appointment.notes || '', 'scheduled']
    );
    return {
      id: result.insertId,
      patient_id,
      doctor_id,
      availability_id: slot.availability_id,
      start_time: start,
      end_time,
      status: 'scheduled',
      notes: appointment.notes || '',
    };
  } catch (err) {
    await Availability.release(slot.availability_id);
    throw err;
  }
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM appointment WHERE appointment_id = ?', [id]);
  return rows[0] || null;
}

async function findDetailedById(id) {
  const [rows] = await db.query(
    `SELECT a.*,
            p.first_name AS patient_first_name,
            p.last_name AS patient_last_name,
            p.email AS patient_email,
            d.first_name AS doctor_first_name,
            d.last_name AS doctor_last_name,
            d.hospital,
            d.specialty,
            dep.name AS department_name
       FROM appointment a
       JOIN patient p ON p.patient_id = a.patient_id
       JOIN doctor d ON d.doctor_id = a.doctor_id
       LEFT JOIN department dep ON dep.department_id = d.department_id
      WHERE a.appointment_id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findAll(filter = {}) {
  const where = [];
  const params = [];
  if (filter.doctor_id) {
    where.push('doctor_id = ?');
    params.push(filter.doctor_id);
  }
  if (filter.patient_id) {
    where.push('patient_id = ?');
    params.push(filter.patient_id);
  }
  if (filter.status) {
    where.push('status = ?');
    params.push(filter.status);
  }
  if (filter.from) {
    const d = toDate(filter.from);
    if (d) {
      where.push('start_time >= ?');
      params.push(d);
    }
  }
  if (filter.to) {
    const d = toDate(filter.to);
    if (d) {
      where.push('start_time <= ?');
      params.push(d);
    }
  }
  const sql = `SELECT * FROM appointment ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY start_time DESC`;
  const [rows] = await db.query(sql, params);
  return rows;
}

async function cancel(id) {
  const appt = await findById(id);
  if (!appt) return null;
  await db.query('UPDATE appointment SET status = ? WHERE appointment_id = ?', ['canceled', id]);
  if (appt.availability_id) {
    await Availability.release(appt.availability_id);
  }
  return { ...appt, status: 'canceled' };
}

async function reschedule(id, payload) {
  const appt = await findById(id);
  if (!appt) return null;

  const start = toDate(payload.start_time);
  const end_time = toDate(payload.end_time) || (start ? defaultEnd(start) : null);
  if (!start || !end_time || end_time <= start) {
    const err = new Error('Invalid start_time/end_time');
    err.status = 400;
    throw err;
  }

  const conflict = await hasConflict({
    doctor_id: appt.doctor_id,
    start_time: start,
    end_time,
    excludeId: id,
  });
  if (conflict) {
    const err = new Error('Doctor has a conflicting appointment');
    err.status = 409;
    throw err;
  }

  const oldAvailabilityId = appt.availability_id || null;
  let availabilityIdToUse = oldAvailabilityId;
  let claimedNewSlot = null;

  const canReuseCurrent = oldAvailabilityId
    ? await Availability.slotCovers(oldAvailabilityId, start, end_time)
    : false;

  if (!canReuseCurrent) {
    claimedNewSlot = await Availability.claim(appt.doctor_id, start, end_time);
    if (!claimedNewSlot) {
      const err = new Error('No availability slot matches the requested time window');
      err.status = 409;
      throw err;
    }
    availabilityIdToUse = claimedNewSlot.availability_id;
  }

  try {
    await db.query(
      'UPDATE appointment SET start_time = ?, end_time = ?, availability_id = ? WHERE appointment_id = ?',
      [start, end_time, availabilityIdToUse, id]
    );
  } catch (err) {
    if (claimedNewSlot) {
      await Availability.release(claimedNewSlot.availability_id);
    }
    throw err;
  }

  if (claimedNewSlot && oldAvailabilityId && oldAvailabilityId !== claimedNewSlot.availability_id) {
    await Availability.release(oldAvailabilityId);
  }

  return { ...appt, start_time: start, end_time, availability_id: availabilityIdToUse };
}

async function findByPatient(patientId) {
  const [rows] = await db.query('SELECT * FROM appointment WHERE patient_id = ? ORDER BY start_time DESC', [patientId]);
  return rows;
}

async function summary({ windowDays = 14 } = {}) {
  const [statusRows] = await db.query('SELECT status, COUNT(*) AS total FROM appointment GROUP BY status');
  const [upcomingRows] = await db.query(
    `SELECT d.doctor_id,
            d.first_name,
            d.last_name,
            COUNT(*) AS upcoming
       FROM appointment a
       JOIN doctor d ON d.doctor_id = a.doctor_id
      WHERE a.status = 'scheduled'
        AND a.start_time >= NOW()
      GROUP BY d.doctor_id, d.first_name, d.last_name
      ORDER BY upcoming DESC
      LIMIT 8`
  );
  const [dailyRows] = await db.query(
    `SELECT DATE(start_time) AS day, COUNT(*) AS total
       FROM appointment
      WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(start_time)
      ORDER BY day ASC`,
    [windowDays]
  );
  const [utilRows] = await db.query(
    `SELECT availability_id, doctor_id, start_time, end_time, max_patients, booked_patients
       FROM doctor_availability
      WHERE start_time >= NOW()
      ORDER BY start_time ASC
      LIMIT 20`
  );

  return {
    by_status: statusRows.map((row) => ({ status: row.status, total: Number(row.total) })),
    top_doctors: upcomingRows.map((row) => ({
      doctor_id: row.doctor_id,
      name: `${row.first_name} ${row.last_name}`.trim(),
      upcoming: Number(row.upcoming),
    })),
    daily_trend: dailyRows.map((row) => ({ day: row.day, total: Number(row.total) })),
    utilization: utilRows.map((row) => ({
      availability_id: row.availability_id,
      doctor_id: row.doctor_id,
      start_time: row.start_time,
      end_time: row.end_time,
      max_patients: row.max_patients,
      booked_patients: row.booked_patients,
      utilization: row.max_patients ? Number((row.booked_patients / row.max_patients).toFixed(2)) : 0,
    })),
  };
}

module.exports = {
  create,
  findById,
  findDetailedById,
  findAll,
  cancel,
  reschedule,
  findByPatient,
  summary,
};
