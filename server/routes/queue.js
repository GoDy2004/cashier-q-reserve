const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/queueController');
const { authMiddleware } = require('../models/authMiddleware');

router.get('/', ctrl.getAllQueues);
router.get('/stats', ctrl.getQueueStats);
router.get('/student/:student_id', ctrl.getStudentQueues);
router.post('/', ctrl.createQueue);
router.put('/next', authMiddleware, ctrl.callNext);
router.put('/done/:id', authMiddleware, ctrl.markDone);
router.put('/skip/:id', authMiddleware, ctrl.skipQueue);
router.put('/cancel/:id', ctrl.cancelQueue);
router.delete('/reset', authMiddleware, ctrl.resetQueue);

module.exports = router;