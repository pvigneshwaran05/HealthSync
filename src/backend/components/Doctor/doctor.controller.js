// Signup for Doctors
app.post('/signup', async (req, res) => {
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

// Signin for Doctors
app.post('/signin', async (req, res) => {
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