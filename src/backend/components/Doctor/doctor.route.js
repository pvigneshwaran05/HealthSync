const express = require('express');
const router = express.Router();
const {doctorSignin, doctorSignup} = require('./doctor.controller')

router.post('/signup', doctorSignup);
router.post('/login', doctorSignin);

module.exports = router;