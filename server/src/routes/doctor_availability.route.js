const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/doctor_availability.controller');
const { auth, permit } = require('../middleware');

router.get('/', ctrl.list);
router.post('/', auth, permit('admin'), ctrl.create);
router.delete('/:availabilityId', auth, permit('admin'), ctrl.remove);

module.exports = router;
