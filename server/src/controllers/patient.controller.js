const Patient = require('../models/patient.model');

function handleError(res, err) {
  const status = err.status || 500;
  return res.status(status).json({ message: err.message || 'Internal server error', details: err.details || undefined });
}

async function list(req, res) {
  try {
    const rows = await Patient.findAll({ q: req.query.q, limit: req.query.limit, offset: req.query.offset });
    res.json(rows);
  } catch (err) { handleError(res, err); }
}

async function get(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) { handleError(res, err); }
}

async function create(req, res) {
  try {
    const created = await Patient.create(req.body);
    res.status(201).json(created);
  } catch (err) { handleError(res, err); }
}

async function update(req, res) {
  try {
    const updated = await Patient.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Patient not found' });
    res.json(updated);
  } catch (err) { handleError(res, err); }
}

module.exports = { list, get, create, update };
