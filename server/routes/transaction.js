const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transactionController');
const { authMiddleware } = require('../models/authMiddleware');

router.get('/', ctrl.getAllTransactions);
router.get('/stats', ctrl.getTransactionStats);
router.post('/', ctrl.createTransaction);
router.put('/:id', authMiddleware, ctrl.updateTransaction);
router.delete('/:id', authMiddleware, ctrl.deleteTransaction);

module.exports = router;