const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const PORT = 8000;

const app = express();
app.use(express.json()); 
app.use(cors());

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

const patientRoutes = require('./components/Patient/patient.route');
const doctorRoutes = require('./components/Doctor/doctor.route');

app.use('/patient', patientRoutes);
app.use('/doctor', doctorRoutes);



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})