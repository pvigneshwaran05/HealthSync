const express = require('express');
const router = express.Router();
const {patientSignin, patientSignup, patientDetails} = require('./patient.controller')

router.post('/signup', patientSignup);
router.post('/login', patientSignin);
router.get('/details', patientDetails)

module.exports = router;