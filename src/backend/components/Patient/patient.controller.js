const { response } = require('express');
const {patientModel} = require('../../db')
const {PatientHealthData} = require('../../db')
const {BlogModel} = require('../../db')
const {doctorModel} = require('../../db')
const {UserClickModel} = require('../../db')
const {DocumentModel} = require('../../db')

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);



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

// const documentUpload = async(req,res) => {
//     const patientEmail = req.query.patientEmail;


//     const extractedText = ''; // Assume extracted text is passed in the request body
//     const uploadDate = '';  // Current timestamp as upload date

//     try {
//         const response = await sendDataToFlaskAPI(patientEmail, extractedText, uploadDate);
//         res.json(response);
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

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

const updatePatientHealthData = async (patientEmail, newHealthData) => {
    try {
        // Find the patient's existing data
        let patientData = await PatientHealthData.findOne({ email: patientEmail });

        // If no existing data, create a new document
        if (!patientData) {
            patientData = new PatientHealthData({
                email: patientEmail,
                healthData: {}
            });
        }

        // Merge new health data into existing health data
        const existingHealthData = patientData.healthData || {};

        for (const key in newHealthData) {
            if (newHealthData.hasOwnProperty(key)) {
                // Update the value and date
                existingHealthData[key] = {
                    value: newHealthData[key].value,
                    date: newHealthData[key].date,
                };
            }
        }

        // Save the updated health data
        patientData.healthData = existingHealthData;
        await patientData.save();

        console.log("Patient health data updated successfully.");
        return { success: true };
    } catch (error) {
        console.error("Error updating patient health data:", error.message);
        return { error: "Error updating health data" };
    }
};


const sendDataToFlaskAPI = async (patientEmail, extractedText, uploadDate) => {
    try {
        // Fetch health data from MongoDB
        const patientData = await PatientHealthData.findOne({ email: patientEmail });
        console.log(patientData)

        // if (!patientData) {
        //     return { error: "Patient health data not found" };
        // }

        // Format health data for Flask API
        // const formattedHealthData = formatPatientDataForFlask(patientData.healthData);

        const formattedHealthData = patientData
            ? formatPatientDataForFlask(patientData.healthData)
            : null;

        // Prepare request payload
        const requestData = {
            extracted_text: extractedText,
            upload_date: uploadDate,
            existing_patient_data: formattedHealthData,
        };

        // Send data to Flask API
        const response = await axios.post('http://127.0.0.1:5000/extractText', requestData);

        console.log(response.data);

        await updatePatientHealthData(patientEmail, response.data.data);

        return response.data;
    } catch (error) {
        console.error("Error sending data to Flask API:", error.message);
        return { error: "Error processing request" };
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original name and timestamp
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filter files by type
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed.'), false);
    }
};

// Configure upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Helper function to determine report category
const getReportCategory = (reportName) => {
    const reportCategories = {
        "General Reports": [
            "Prescription", "Discharge Summary", "Medical History Report", "Consultation Notes"
        ],
        "Diagnostic Reports": [
            "Blood Test Report", "Urine Test Report", "Stool Test Report",
            "Hormone Test Report", "Genetic Test Report"
        ],
        "Imaging Reports": [
            "X-ray Report", "MRI Report", "CT Scan Report", "Ultrasound Report",
            "Mammogram Report", "PET Scan Report", "Doppler Scan Report"
        ],
        "Cardiovascular Reports": [
            "ECG Report", "Echocardiogram Report", "Holter Monitor Report", "Cardiac Stress Test Report"
        ],
        "Pulmonary Reports": [
            "Spirometry Report", "Chest X-ray Report", "Sleep Study Report"
        ],
        "Pathology & Microbiology Reports": [
            "Biopsy Report", "Culture & Sensitivity Report", "Allergy Test Report"
        ],
        "Endocrinology Reports": [
            "Diabetes Report", "Thyroid Function Report", "Bone Density Report"
        ],
        "Gastroenterology Reports": [
            "Endoscopy Report", "Colonoscopy Report", "Liver Function Test Report",
            "Pancreatic Function Test Report"
        ],
        "Neurology Reports": [
            "EEG Report", "Nerve Conduction Study Report", "CSF Analysis Report"
        ],
        "Orthopedic Reports": [
            "Bone X-ray Report", "Arthroscopy Report", "DEXA Scan Report"
        ],
        "Ophthalmology Reports": [
            "Vision Test Report", "Retinal Scan Report", "OCT Report", "Corneal Topography Report"
        ],
        "Dermatology Reports": [
            "Skin Biopsy Report", "Allergy Patch Test Report", "Mole Mapping Report"
        ],
        "Gynecology & Obstetrics Reports": [
            "Pregnancy Test Report", "Ultrasound OB/GYN Report", "Pap Smear Report", "Hormone Panel Report"
        ],
        "Oncology Reports": [
            "Tumor Marker Report", "Chemotherapy Report", "Radiotherapy Report", "PET Scan Report"
        ]
    };

    for (const [category, reports] of Object.entries(reportCategories)) {
        if (reports.includes(reportName)) {
            return category;
        }
    }
    
    return "Other";
};

// Helper function to extract text from different file types
const extractTextFromFile = async (filePath, fileType) => {
    try {
        if (fileType.includes('pdf')) {
            const dataBuffer = await readFile(filePath);
            const pdfData = await pdf(dataBuffer);
            return pdfData.text;
        } 
        else if (fileType.includes('doc') || fileType.includes('docx')) {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }
        // For image files, we can't extract text directly without OCR
        // For simplicity, we're returning a placeholder text
        else if (fileType.includes('image')) {
            return "Image file - text extraction not available without OCR";
        }
        return "";
    } catch (error) {
        console.error("Error extracting text:", error);
        return "";
    }
};

// Send data to Flask API (if needed)
// const sendDataToFlaskAPI = async (patientEmail, extractedText, uploadDate) => {
//     try {
//         // Implement API call to Flask here if needed
//         return { success: true, message: "Data sent to Flask API" };
//     } catch (error) {
//         console.error("Error sending data to Flask API:", error);
//         throw error;
//     }
// };

// Document upload controller
const documentUpload = async (req, res) => {
    // Use multer middleware for single file upload
    const singleUpload = upload.single('file');
    
    singleUpload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        const patientEmail = req.query.patientEmail;
        if (!patientEmail) {
            return res.status(400).json({ error: "Patient email is required" });
        }
        
        try {
            // Verify patient exists
            const patient = await patientModel.findOne({ email: patientEmail });
            if (!patient) {
                return res.status(404).json({ error: "Patient not found" });
            }
            
            const { 
                reportName, 
                reportDate, 
                documentType 
            } = req.body;
            
            if (!reportName) {
                return res.status(400).json({ error: "Report name is required" });
            }
            
            // Extract text from the uploaded file
            const filePath = req.file.path;
            const extractedText = await extractTextFromFile(filePath, req.file.mimetype);
            const uploadDate = new Date();
            
            // Determine report category
            const category = getReportCategory(reportName);
            
            // Create new document record
            const newDocument = new DocumentModel({
                patientEmail,
                reportName,
                reportType: documentType || "medical",
                category,
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                uploadDate,
                reportDate: reportDate || uploadDate,
                extractedText,
                filePath: filePath
            });
            
            // Save document to database
            await newDocument.save();
            
            // Send data to Flask API if needed
            await sendDataToFlaskAPI(patientEmail, extractedText, uploadDate.toISOString());
            
            res.status(201).json({ 
                success: true, 
                message: "Document uploaded successfully",
                document: {
                    id: newDocument._id,
                    reportName,
                    category,
                    uploadDate,
                    reportDate: newDocument.reportDate
                }
            });
            
        } catch (error) {
            console.error("Error uploading document:", error);
            
            // Check if this is a duplicate document error
            if (error.code === 11000) {
                return res.status(409).json({ 
                    error: "A document with this name and date already exists for this patient" 
                });
            }
            
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};

// Get all documents for a patient
const getPatientDocuments = async (req, res) => {
    try {
        const patientEmail = req.query.patientEmail;
        
        if (!patientEmail) {
            return res.status(400).json({ error: "Patient email is required" });
        }
        
        const documents = await DocumentModel.find({ patientEmail })
            .sort({ uploadDate: -1 }) // Most recent first
            .select('-extractedText -filePath'); // Exclude large fields for performance
        
        res.json(documents);
    } catch (error) {
        console.error("Error fetching patient documents:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get a specific document by ID
const getDocumentById = async (req, res) => {
    try {
        const documentId = req.params.id;
        const document = await DocumentModel.findById(documentId);
        
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        res.json(document);
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete a document
const deleteDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const document = await DocumentModel.findById(documentId);
        
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        // Delete the file from storage
        fs.unlink(document.filePath, async (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
            
            // Delete the document from the database
            await DocumentModel.findByIdAndDelete(documentId);
            
            res.json({ success: true, message: "Document deleted successfully" });
        });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
    blogExit,
    documentUpload,
    getPatientDocuments,
    getDocumentById,
    deleteDocument
}