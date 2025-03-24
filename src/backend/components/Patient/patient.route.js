const express = require('express');
const router = express.Router();
const {patientSignin, patientSignup, patientDetails, documentUpload, patientAllDetails} = require('./patient.controller')

router.post('/signup', patientSignup);
router.post('/login', patientSignin);
router.get('/details', patientDetails);
router.post('/upload-documents', documentUpload);
router.get('/patientAllDetails', patientAllDetails);

module.exports = router;