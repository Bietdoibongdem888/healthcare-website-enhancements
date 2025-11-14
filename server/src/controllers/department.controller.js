const Department = require('../models/department.model');

function handleError(res, err) {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    details: err.details || undefined,
  });
}

async function list(_, res) {
  try {
    const rows = await Department.findAll();
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
}

async function get(req, res) {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) {
    handleError(res, err);
  }
}

async function create(req, res) {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    handleError(res, err);
  }
}

async function update(req, res) {
  try {
    const dept = await Department.update(req.params.id, req.body);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) {
    handleError(res, err);
  }
}

async function remove(req, res) {
  try {
    const dept = await Department.remove(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted', department: dept });
  } catch (err) {
    handleError(res, err);
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
};

