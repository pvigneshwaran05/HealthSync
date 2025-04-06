const express = require('express');
const router = express.Router();
const {doctorSignin, doctorSignup, doctorDetails, allBlogs, putBlogs, postBlogs} = require('./doctor.controller')

router.post('/signup', doctorSignup);
router.get('/details', doctorDetails);
router.post('/login', doctorSignin);
router.get('/blogs/:email?', allBlogs);
router.post('/blogs', postBlogs);



module.exports = router;