const express = require('express');
const Joi = require('joi');
const router = express.Router();
const ctrl = require('../controllers/appointment.controller');
const { auth, permit, validate } = require('../middleware');

const createSchema = Joi.object({
  patient_id: Joi.number().integer().optional(),
  patient: Joi.object({ first_name: Joi.string().allow('',null), last_name: Joi.string().allow('',null), contact_no: Joi.string().allow('',null), email: Joi.string().email().allow('',null) }).optional(),
  doctor_id: Joi.number().integer().required(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).optional(),
  notes: Joi.string().allow('').max(500).optional(),
}).options({ abortEarly: false });

const rescheduleSchema = Joi.object({
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).optional(),
}).options({ abortEarly: false });

router.get('/', auth, ctrl.list);
router.get('/mine', auth, ctrl.listMine);
router.get('/stats/summary', auth, permit('admin'), ctrl.summary);
router.get('/patient/:patientId', auth, ctrl.listByPatient);
router.get('/:id', auth, ctrl.getById);
router.post('/', validate(createSchema), ctrl.create); // public booking allowed
router.post('/:id/cancel', auth, ctrl.cancel);
router.post('/:id/reschedule', auth, validate(rescheduleSchema), ctrl.reschedule);

module.exports = router;

