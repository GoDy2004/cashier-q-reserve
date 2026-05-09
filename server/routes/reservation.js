// reservation.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservationController');
router.get('/', ctrl.getAllReservations);
router.get('/count/today', ctrl.getTodayReservationCount);
router.get('/:id', ctrl.getReservationById);
router.put('/:id/status', ctrl.updateReservationStatus);
module.exports = router;
