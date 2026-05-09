const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/scheduleReportController');
const { authMiddleware } = require('../models/authMiddleware');

router.get('/', ctrl.getTodaySchedules);
router.post('/', authMiddleware, ctrl.createSchedule);
router.put('/:id', authMiddleware, ctrl.updateSchedule);
router.delete('/:id', authMiddleware, ctrl.deleteSchedule);

module.exports = router;