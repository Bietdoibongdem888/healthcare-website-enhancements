const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/doctor.controller');
const { auth, permit } = require('../middleware');

router.get('/', ctrl.list); // public
router.get('/:id', ctrl.get); // public
router.post('/', auth, permit('admin'), ctrl.create);
router.put('/:id', auth, permit('admin'), ctrl.update);

module.exports = router;
