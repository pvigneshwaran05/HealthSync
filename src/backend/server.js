const express = require('express');
const mongoose = require('mongoose');
const {patientModel, doctorModel} = require('./db')

const app = express();
app.use(express.json()); 

main()
    .then(() => {
        console.log('connected to db');
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    mongoose.connect("mongodb+srv://admin:dkLF3xJGnS6C0DAp@cluster0.e3xkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
}



// Signup for Patients
app.post('/signup/patient', async (req, res) => {
    const { name, email, password, phone, address, dateOfBirth, gender } = req.body;
    
    try {
        const existingUser = await patientModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Patient already exists" });

        const newPatient = new patientModel({ name, email, password, phone, address, dateOfBirth, gender });
        await newPatient.save();
        res.status(201).json({ message: "Patient signup successful" });

    } catch (error) {
        res.status(500).json({ message: "Error signing up", error });
    }
});

// Signup for Doctors
app.post('/signup/doctor', async (req, res) => {
    const { name, email, password, specialty, hospital } = req.body;
    
    try {
        const existingUser = await doctorModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Doctor already exists" });

        const newDoctor = new doctorModel({ name, email, password, specialty, hospital });
        await newDoctor.save();
        res.status(201).json({ message: "Doctor signup successful" });

    } catch (error) {
        res.status(500).json({ message: "Error signing up", error });
    }
});

// Signin for Patients
app.post('/signin/patient', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await patientModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Patient not found" });

        if (user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({ message: "Patient signin successful", user });

    } catch (error) {
        res.status(500).json({ message: "Error signing in", error });
    }
});

// Signin for Doctors
app.post('/signin/doctor', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await doctorModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Doctor not found" });

        if (user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({ message: "Doctor signin successful", user });

    } catch (error) {
        res.status(500).json({ message: "Error signing in", error });
    }
});

app.get("/api/patient", async (req, res) => {
    const patient = await PatientModel.findOne({ _id: req.userId });
    res.json(patient);
});

app.get("/api/patient/doctors", async (req, res) => {
    const patient = await PatientModel.findOne({ _id: req.userId }).populate("doctorId");
    res.json(patient.doctorId);
});

app.get("/api/patient/appointments", async (req, res) => {
    const appointments = await AppointmentModel.find({ patientId: req.userId });
    res.json(appointments);
});


app.listen(8000, () => {
    console.log("Server listening on port 3000");
})