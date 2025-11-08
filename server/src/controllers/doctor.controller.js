const Doctor = require('../models/doctor.model');

function handleError(res, err) {
  const status = err.status || 500;
  return res.status(status).json({ message: err.message || 'Internal server error', details: err.details || undefined });
}

async function list(req, res) {
  try {
    const rows = await Doctor.findAll({
      q: req.query.q,
      specialty: req.query.specialty,
      district: req.query.district,
      department_id: req.query.department_id,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.json(rows);
  } catch (err) { handleError(res, err); }
}

async function get(req, res) {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doc);
  } catch (err) { handleError(res, err); }
}

async function create(req, res) {
  try {
    const created = await Doctor.create(req.body);
    res.status(201).json(created);
  } catch (err) { handleError(res, err); }
}

async function update(req, res) {
  try {
    const updated = await Doctor.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Doctor not found' });
    res.json(updated);
  } catch (err) { handleError(res, err); }
}

module.exports = { list, get, create, update };
