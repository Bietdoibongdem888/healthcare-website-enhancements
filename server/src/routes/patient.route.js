const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patient.controller');
const { auth, permit } = require('../middleware');

router.get('/', auth, ctrl.list);
router.get('/:id', auth, ctrl.get);
router.post('/', auth, permit('admin'), ctrl.create);
router.put('/:id', auth, permit('admin'), ctrl.update);

module.exports = router;
