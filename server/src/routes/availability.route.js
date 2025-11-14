const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/doctor_availability.controller');
const { auth, permit } = require('../middleware');

router.put('/:id', auth, permit('admin'), ctrl.update);

module.exports = router;
