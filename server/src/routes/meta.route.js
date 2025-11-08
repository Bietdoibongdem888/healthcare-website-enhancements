const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/meta.controller');

router.get('/specialties', ctrl.specialties);
router.get('/districts', ctrl.districts);

module.exports = router;
