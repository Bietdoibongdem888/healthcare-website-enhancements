const Appointment = require('../models/appointment.model');
const { sendAppointmentConfirmation } = require('../providers/mail');
const { Prohibited, Unauthorized } = require('../../helpers/errors');

function isAdmin(req) {
  return req.user?.role === 'admin';
}

function isDoctor(req) {
  return req.user?.role === 'doctor' && req.user?.doctor_id;
}

function isPatient(req) {
  return req.user?.role === 'patient' && req.user?.patient_id;
}

function canAccessAppointment(req, appointment) {
  if (isAdmin(req)) return true;
  if (isDoctor(req) && appointment.doctor_id === req.user.doctor_id) return true;
  if (isPatient(req) && appointment.patient_id === req.user.patient_id) return true;
  return false;
}

async function list(req, res, next) {
  try {
    const filters = {
      doctor_id: req.query.doctor_id,
      patient_id: req.query.patient_id,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
    };
    if (isPatient(req)) {
      filters.patient_id = req.user.patient_id;
    }
    if (isDoctor(req)) {
      filters.doctor_id = req.user.doctor_id;
    }
    const rows = await Appointment.findAll(filters);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const patientId = req.user?.patient_id;
    if (!patientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const rows = await Appointment.findByPatient(patientId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (!canAccessAppointment(req, appt)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const payload = req.body;
    const result = await Appointment.create(payload);
    try {
      const detail = await Appointment.findDetailedById(result.id);
      if (detail?.patient_email) {
        const patientName = [detail.patient_first_name, detail.patient_last_name].filter(Boolean).join(' ') || 'Quý khách';
        const doctorName = `BS. ${[detail.doctor_first_name, detail.doctor_last_name].filter(Boolean).join(' ')}`.trim();
        await sendAppointmentConfirmation({
          to: detail.patient_email,
          patientName,
          doctorName,
          department: detail.department_name || detail.specialty,
          location: detail.hospital || 'HealthCare+',
          startTime: detail.start_time,
          notes: detail.notes,
          bookingCode: `HC-${String(result.id).padStart(6, '0')}`,
        });
      }
    } catch (mailErr) {
      console.log('[APPOINTMENT MAIL ERROR]', mailErr?.message);
    }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const existing = await Appointment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (!canAccessAppointment(req, existing)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    const appt = await Appointment.cancel(req.params.id);
    res.json(appt || existing);
  } catch (err) {
    next(err);
  }
}

async function reschedule(req, res, next) {
  try {
    const existing = await Appointment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (!canAccessAppointment(req, existing)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    const appt = await Appointment.reschedule(req.params.id, req.body);
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function listByPatient(req, res, next) {
  try {
    const patientId = req.params.patientId;
    if (isPatient(req) && Number(patientId) !== Number(req.user.patient_id)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    if (isDoctor(req) && !isAdmin(req)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    const rows = await Appointment.findByPatient(patientId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function summary(req, res, next) {
  try {
    const window = parseInt(req.query.window, 10);
    const data = await Appointment.summary({ windowDays: Number.isNaN(window) ? 14 : window });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function updateFields(req, res, next) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (!isAdmin(req) && !(isDoctor(req) && appt.doctor_id === req.user.doctor_id)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    const updated = await Appointment.updateFields(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    const deleted = await Appointment.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted', appointment: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, listMine, getById, create, cancel, reschedule, listByPatient, summary, updateFields, remove };
