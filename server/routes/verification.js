const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/verificationController');
const { authMiddleware } = require('../models/authMiddleware');

router.get('/', authMiddleware, ctrl.getAllVerifications);
router.get('/pending/count', ctrl.getPendingCount);
router.get('/:id', authMiddleware, ctrl.getVerificationById);
router.put('/:id/verify', authMiddleware, ctrl.verifyPayment);
router.put('/:id/reject', authMiddleware, ctrl.rejectPayment);
router.post('/', ctrl.submitVerification);

module.exports = router;
