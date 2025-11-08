const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/support.controller');

router.post('/sessions', ctrl.createSession);
router.get('/sessions/:sessionId', ctrl.getSession);
router.get('/sessions/:sessionId/messages', ctrl.listMessages);
router.post('/sessions/:sessionId/messages', ctrl.sendMessage);

module.exports = router;
