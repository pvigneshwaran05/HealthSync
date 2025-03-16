const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Patient = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    phone: String,
    address: String,
    dateOfBirth: Date,
    gender: String,
    medicalHistory: String,
    bloodGroup: String,
    hospital: [String],
    visitedDoctors: {type: Schema.Types.ObjectId, ref: 'Doctor'}
})

const Doctor = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    specialty: String,
    hospital: String,
    phone: String,
    experience: String,
    patients: [{type: Schema.Types.ObjectId, ref: 'Patient'}]
})

const patientModel = mongoose.model('patients', Patient);
const doctorModel = mongoose.model('doctors', Doctor);

module.exports = {
    patientModel: patientModel,
    doctorModel: doctorModel
}