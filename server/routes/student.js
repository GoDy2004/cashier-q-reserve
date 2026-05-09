const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { authMiddleware } = require('../models/authMiddleware');

router.get('/:id', authMiddleware, ctrl.getStudentProfile);
router.put('/:id', authMiddleware, ctrl.updateStudentProfile);
router.put('/:id/change-password', authMiddleware, ctrl.changePassword);
router.get('/:id/transactions', authMiddleware, ctrl.getStudentTransactions);

module.exports = router;