const express = require('express');
const router = express.Router();
const {patientSignin, patientSignup, patientDetails, documentUpload, patientAllDetails, getBlogs, blogClick, blogExit} = require('./patient.controller')

router.post('/signup', patientSignup);
router.post('/login', patientSignin);
router.get('/details', patientDetails);
router.post('/upload-documents', documentUpload);
router.get('/patientAllDetails', patientAllDetails);
router.get('/blogs', getBlogs);
router.post('/track-blog-click', blogClick);
router.post('/track-blog-exit', blogExit);

module.exports = router;