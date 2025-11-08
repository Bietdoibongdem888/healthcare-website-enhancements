const Availability = require('../models/doctor_availability.model');

function parseDoctorId(req) {
  const doctorId = Number(req.params.doctorId);
  if (!doctorId) {
    const err = new Error('Invalid doctor id');
    err.status = 400;
    throw err;
  }
  return doctorId;
}

async function list(req, res, next) {
  try {
    const doctorId = parseDoctorId(req);
    const slots = await Availability.findByDoctor(doctorId, {
      from: req.query.from,
      to: req.query.to,
      status: req.query.status,
    });
    res.json(slots);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const doctorId = parseDoctorId(req);
    const slot = await Availability.create(doctorId, req.body || {});
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    parseDoctorId(req); // ensures doctor exists syntactically; business rules handled by FK
    const availabilityId = Number(req.params.availabilityId);
    if (!availabilityId) {
      const err = new Error('Invalid availability id');
      err.status = 400;
      throw err;
    }
    const removed = await Availability.remove(availabilityId);
    if (!removed) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    res.json(removed);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create,
  remove,
};
