const express = require('express');
const router = express.Router();
const {patientSignin, patientSignup} = require('./patient.controller')

router.post('/signup', patientSignup);
router.post('/login', patientSignin);

module.exports = router;