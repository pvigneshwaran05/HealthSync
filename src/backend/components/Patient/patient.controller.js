const { response } = require('express');
const {patientModel} = require('../../db')
const {PatientHealthData} = require('../../db')
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

module.exports = {
    patientSignup,
    patientSignin,
    patientDetails,
    documentUpload,
    patientAllDetails
}