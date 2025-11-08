const express = require('express');
const router = express.Router();
const { auth, permit } = require('../middleware');
const ctrl = require('../controllers/department.controller');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', auth, permit('admin'), ctrl.create);
router.put('/:id', auth, permit('admin'), ctrl.update);

module.exports = router;
