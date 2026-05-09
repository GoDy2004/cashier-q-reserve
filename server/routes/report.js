const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/scheduleReportController');
const { authMiddleware } = require('../models/authMiddleware');

router.get('/summary', authMiddleware, ctrl.getReportSummary);

module.exports = router;
