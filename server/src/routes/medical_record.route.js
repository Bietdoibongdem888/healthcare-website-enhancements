const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/medical_record.controller');
const { auth, permit } = require('../middleware');

router.get('/mine', auth, ctrl.listMine);
router.get('/patient/:patientId', auth, ctrl.listByPatient);
router.get('/:id', auth, ctrl.getById);
router.post('/', auth, permit('admin'), ctrl.create);

module.exports = router;

