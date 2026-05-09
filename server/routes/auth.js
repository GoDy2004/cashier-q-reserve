const express = require('express');
const router = express.Router();
const { staffLogin, studentLogin, studentRegister } = require('../controllers/authController');

router.post('/login', staffLogin);
router.post('/student/login', studentLogin);
router.post('/student/register', studentRegister);

module.exports = router;
