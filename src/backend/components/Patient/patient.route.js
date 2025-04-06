const express = require('express');
const router = express.Router();
const {patientSignin, patientSignup, patientDetails, documentUpload, patientAllDetails, getBlogs, blogClick, blogExit, getPatientDocuments, getDocumentById, deleteDocument} = require('./patient.controller')

router.post('/signup', patientSignup);
router.post('/login', patientSignin);
router.get('/details', patientDetails);
router.post('/upload-document', documentUpload);
router.get('/patientAllDetails', patientAllDetails);
router.get('/blogs', getBlogs);
router.post('/track-blog-click', blogClick);
router.post('/track-blog-exit', blogExit);
router.get('/documents', getPatientDocuments);
router.get('/document/:id', getDocumentById);
router.delete('/document/:id', deleteDocument);


module.exports = router;