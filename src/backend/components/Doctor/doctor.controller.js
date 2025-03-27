const {doctorModel} = require('../../db')

// Signup for Doctors
const doctorSignup =  async (req, res) => {
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
};

// Signin for Doctors
const doctorSignin =  async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await doctorModel.findOne({ email });
        console.log(user);
        if (!user) return res.status(400).json({ message: "Doctor not found" });

        
        if (user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({ message: "Doctor signin successful", user });

    } catch (error) {
        res.status(500).json({ message: "Error signing in", error });
    }
};

const doctorDetails = async (req, res) => {
    try {
        const email = req.query.email;

        // Fetch patient basic details
        const doctor = await doctorModel.findOne({ email }, { password: 0, __v: 0 }); // Excluding sensitive fields
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Construct the response in the required format
        const responseData = {
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            speciality: doctor.specialty,
            hospital: doctor.hospital,
            experience: doctor.experience,
        };

        // console.log(responseData);

        res.json(responseData);
    } catch (error) {
        console.error("Error fetching doctor details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    doctorSignup,
    doctorSignin,
    doctorDetails,
}