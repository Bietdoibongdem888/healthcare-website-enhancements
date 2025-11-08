const Appointment = require('../models/appointment.model');
const { sendAppointmentConfirmation } = require('../providers/mail');

async function list(req, res, next) {
  try {
    const rows = await Appointment.findAll({
      doctor_id: req.query.doctor_id,
      patient_id: req.query.patient_id,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
    });
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
    const appt = await Appointment.cancel(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function reschedule(req, res, next) {
  try {
    const appt = await Appointment.reschedule(req.params.id, req.body);
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function listByPatient(req, res, next) {
  try {
    const patientId = req.params.patientId;
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

module.exports = { list, listMine, getById, create, cancel, reschedule, listByPatient, summary };
