const express = require('express');
const router = express.Router();
const {doctorSignin, doctorSignup, doctorDetails, allBlogs, getPatients, postBlogs, getPatientReport} = require('./doctor.controller')

router.post('/signup', doctorSignup);
router.get('/details', doctorDetails);
router.post('/login', doctorSignin);
router.get('/blogs/:email?', allBlogs);
router.post('/blogs', postBlogs);
router.get('/patients', getPatients);
router.get('/patient/:patientEmail/report', getPatientReport);





module.exports = router;