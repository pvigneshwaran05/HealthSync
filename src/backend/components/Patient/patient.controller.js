const { response } = require('express');
const {patientModel} = require('../../db')
const {PatientHealthData} = require('../../db')
const {BlogModel} = require('../../db')
const {doctorModel} = require('../../db')
const {UserClickModel} = require('../../db')
const axios = require('axios');



// Signup for Patients
const patientSignup = async (req, res) => {
    const { name, email, password, phone, address, dateOfBirth, gender } = req.body;
    // console.log(name);
    
    try {
        const existingUser = await patientModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const newPatient = new patientModel({ name, email, password, phone, address, dateOfBirth, gender });
        await newPatient.save();

        const newHealthData = new PatientHealthData({
            email,
            healthData: {
                smoking_status: { value: null, date: null },
                bmi: { value: null, date: null },
                blood_pressure: { value: null, date: null },
                glucose_levels: { value: null, date: null },
                cholesterol_ldl: { value: null, date: null },
                cholesterol_hdl: { value: null, date: null },
                cholesterol_total: { value: null, date: null },
                hemoglobin: { value: null, date: null },
                alt: { value: null, date: null },
                ast: { value: null, date: null },
                bilirubin: { value: null, date: null },
                creatinine: { value: null, date: null },
                egfr: { value: null, date: null },
                bun: { value: null, date: null },
                hba1c: { value: null, date: null },
                wbc: { value: null, date: null },
            },
        });

        await newHealthData.save();

        res.status(201).json({ message: "Patient signup successful" , success: true});

    } catch (error) {
        res.status(500).json({ message: "Error signing up", error });
    }
};

// Signin for Patients
const patientSignin = async (req, res) => {
    const { email, password } = req.body;
    
    
    try {
        const user = await patientModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Patient not found" });

        if (user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({ message: "Patient signin successful", user });
        // console.log(user);

    } catch (error) {
        res.status(500).json({ message: "Error signing in", error });
    }
};

// const patientDetails = async(req,res) => {
//     const email = req.query.email;
//     const patient = await patientModel.findOne({ email });
//     if (!patient) return res.status(404).json({ message: "Patient not found" });
//     res.json(patient);
// };

const patientDetails = async (req, res) => {
    try {
        const email = req.query.email;

        // Fetch patient basic details
        const patient = await patientModel.findOne({ email }, { password: 0, __v: 0 }); // Excluding sensitive fields
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Fetch patient health data
        const healthData = await PatientHealthData.findOne({ email }, { _id: 0, email: 0, __v: 0 });
        // console.log(healthData);
        // Construct the response in the required format
        const responseData = {
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            address: patient.address,
            blood_pressure: healthData?.healthData?.blood_pressure || { value: null, date: null },
            glucose_levels: healthData?.healthData?.glucose_levels || { value: null, date: null },
            bmi: healthData?.healthData?.bmi || { value: null, date: null },
            hba1c: healthData?.healthData?.hba1c || { value: null, date: null },
            cholesterol_ldl: healthData?.healthData?.cholesterol_ldl || { value: null, date: null }
        };

        // console.log(responseData);

        res.json(responseData);
    } catch (error) {
        console.error("Error fetching patient details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const patientAllDetails = async (req, res) => {
    try {
        const email = req.query.email;

        // Fetch patient details
        const patient = await patientModel.findOne({ email }, { password: 0, __v: 0 });
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        // Fetch patient health data
        const healthData = await PatientHealthData.findOne({ email }, { _id: 0, email: 0, __v: 0 });
        if (!healthData) return res.status(404).json({ message: "Health data not found" });

        // Extract only the systolic blood pressure value
        const bloodPressureStr = healthData?.healthData?.blood_pressure?.value || "0";
        const bloodPressure = parseInt(bloodPressureStr.split("/")[0]); // Extract systolic value

        // Prepare data for Flask API
        const medicalData = {
            age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
            gender: patient.gender || "Unknown",
            smoking_status: healthData?.healthData?.smoking_status?.value || "Unknown",
            bmi: healthData?.healthData?.bmi?.value || 0,
            blood_pressure: bloodPressure,
            glucose_levels: healthData?.healthData?.glucose_levels?.value || 0,
        };

        // Send request to Flask API
        const flaskResponse = await axios.post(
            "http://127.0.0.1:5000/predict_condition",
            medicalData,
            { headers: { "Content-Type": "application/json" } }
        );

        // Construct response
        const responseData = {
            patient_details: {
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                gender: patient.gender,
                address: patient.address,
                dateOfBirth: patient.dateOfBirth,
            },
            health_data: healthData.healthData,
            model_prediction: flaskResponse.data
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



const formatPatientDataForFlask = (healthData) => {
    return {
        smoking_status: healthData.smoking_status || { value: null, date: null },
        bmi: healthData.bmi || { value: null, date: null },
        blood_pressure: healthData.blood_pressure || { value: null, date: null },
        glucose_levels: healthData.glucose_levels || { value: null, date: null },
        cholesterol_ldl: healthData.cholesterol_ldl || { value: null, date: null },
        cholesterol_hdl: healthData.cholesterol_hdl || { value: null, date: null },
        cholesterol_total: healthData.cholesterol_total || { value: null, date: null },
        hemoglobin: healthData.hemoglobin || { value: null, date: null },
        alt: healthData.alt || { value: null, date: null },
        ast: healthData.ast || { value: null, date: null },
        bilirubin: healthData.bilirubin || { value: null, date: null },
        creatinine: healthData.creatinine || { value: null, date: null },
        egfr: healthData.egfr || { value: null, date: null },
        bun: healthData.bun || { value: null, date: null },
        hba1c: healthData.hba1c || { value: null, date: null },
        wbc: healthData.wbc || { value: null, date: null },
    };
};


const sendDataToFlaskAPI = async (patientEmail, extractedText, uploadDate) => {
    try {
        // Fetch health data from MongoDB
        const patientData = await PatientHealthData.findOne({ email: patientEmail });
        console.log(patientData)

        if (!patientData) {
            return { error: "Patient health data not found" };
        }

        // Format health data for Flask API
        const formattedHealthData = formatPatientDataForFlask(patientData.healthData);

        // Prepare request payload
        const requestData = {
            extracted_text: extractedText,
            upload_date: uploadDate,
            existing_patient_data: formattedHealthData,
        };

        // Send data to Flask API
        const response = await axios.post('http://127.0.0.1:5000/extractText', requestData);

        console.log(response.data);

        return response.data;
    } catch (error) {
        console.error("Error sending data to Flask API:", error.message);
        return { error: "Error processing request" };
    }
};

const documentUpload = async(req,res) => {
    const patientEmail = req.query.patientEmail;


    const extractedText = ''; // Assume extracted text is passed in the request body
    const uploadDate = '';  // Current timestamp as upload date

    try {
        const response = await sendDataToFlaskAPI(patientEmail, extractedText, uploadDate);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getBlogs = async (req, res) => {
    try {
        const blogs = await BlogModel.find().sort({ createdAt: -1 });

        // Fetch doctor details manually using email
        const doctorEmails = blogs.map(blog => blog.doctor_email);
        const doctors = await doctorModel.find({ email: { $in: doctorEmails } });

        // Create a map of doctor emails to their details
        const doctorMap = {};
        doctors.forEach(doctor => {
            doctorMap[doctor.email] = {
                specialty: doctor.specialty,
                hospital: doctor.hospital
            };
        });

        // Attach doctor details to each blog
        const blogsWithDoctorInfo = blogs.map(blog => ({
            _id: blog._id,
            title: blog.title,
            content: blog.content,
            doctor_email: blog.doctor_email,
            doctor_name: blog.doctor_name,
            specialty: doctorMap[blog.doctor_email]?.specialty || "Unknown",
            hospital: doctorMap[blog.doctor_email]?.hospital || "Unknown",
            comments: blog.comments,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt
        }));

        res.status(200).json(blogsWithDoctorInfo);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ error: "Server error while fetching blogs" });
    }
};

// const blogClick = async(req,res) => {
//     try {
//         const { user_email, blog_id } = req.body;
    
//         // Create a new user click entry
//         const newUserClick = new UserClickModel({
//           user_email,
//           blog_id
//         });
    
//         // Save the click data
//         await newUserClick.save();
//         console.log("Blog Tracked Successfully");
    
//         res.status(200).json({ message: 'Blog click tracked successfully' });
//       } catch (error) {
//         console.error('Error tracking blog click:', error);
//         res.status(500).json({ message: 'Failed to track blog click', error: error.message });
//       }
// }

// Controller for tracking blog clicks (start time)
const blogClick = async(req, res) => {
    try {
        const { user_email, blog_id, clicked_at } = req.body;
    
        // Create a new user click entry with start time
        const newUserClick = new UserClickModel({
          user_email,
          blog_id,
          clicked_at: clicked_at || new Date()
        });
    
        // Save the click data
        await newUserClick.save();
        console.log("Blog Open Tracked Successfully");
    
        res.status(200).json({ message: 'Blog open tracked successfully' });
    } catch (error) {
        console.error('Error tracking blog click:', error);
        res.status(500).json({ message: 'Failed to track blog click', error: error.message });
    }
};

// Controller for tracking blog exits (end time)
const blogExit = async(req, res) => {
    try {
        const { user_email, blog_id, exited_at } = req.body;
    
        // Find the most recent click record for this user and blog
        const userClick = await UserClickModel.findOne({
          user_email: user_email,
          blog_id: blog_id,
          exited_at: { $exists: false } // Find record without exit time
        }).sort({ clicked_at: -1 }); // Get the most recent
        
        if (userClick) {
          userClick.exited_at = exited_at || new Date();
          await userClick.save();
          console.log("Blog Exit Tracked Successfully");
          res.status(200).json({ message: "Exit time tracked successfully" });
        } else {
          console.log("No matching click record found");
          res.status(404).json({ message: "No matching click record found" });
        }
    } catch (error) {
        console.error('Error tracking blog exit:', error);
        res.status(500).json({ message: 'Failed to track blog exit', error: error.message });
    }
};



module.exports = {
    patientSignup,
    patientSignin,
    patientDetails,
    documentUpload,
    patientAllDetails,
    getBlogs,
    blogClick,
    blogExit
}