const express = require('express');
const router = express.Router();
const {doctorSignin, doctorSignup, doctorDetails} = require('./doctor.controller')

router.post('/signup', doctorSignup);
router.get('/details', doctorDetails);
router.post('/login', doctorSignin);

module.exports = router;