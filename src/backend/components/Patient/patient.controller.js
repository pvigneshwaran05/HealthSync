const {patientModel} = require('../../db')


// Signup for Patients
const patientSignup = async (req, res) => {
    const { name, email, password, phone, address, dateOfBirth, gender } = req.body;
    
    try {
        const existingUser = await patientModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const newPatient = new patientModel({ name, email, password, phone, address, dateOfBirth, gender });
        await newPatient.save();
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

    } catch (error) {
        res.status(500).json({ message: "Error signing in", error });
    }
};

module.exports = {
    patientSignup,
    patientSignin
}