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
});

const Doctor = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    specialty: String,
    hospital: String,
    phone: String,
    experience: String,
    patients: [{type: Schema.Types.ObjectId, ref: 'Patient'}]
});


const PatientHealthDataSchema = new Schema({
    email: { type: String, required: true, unique: true, ref: "Patient" },
    healthData: {
        bmi: { value: Number, date: Date },
        blood_pressure: { value: String, date: Date },
        glucose_levels: { value: Number, date: Date },
        cholesterol_ldl: { value: Number, date: Date },
        cholesterol_hdl: { value: Number, date: Date },
        cholesterol_total: { value: Number, date: Date },
        hemoglobin: { value: Number, date: Date },
        smoking_status: { value: String, date: Date },
        alt: { value: Number, date: Date },
        ast: { value: Number, date: Date },
        bilirubin: { value: Number, date: Date },
        creatinine: { value: Number, date: Date },
        egfr: { value: Number, date: Date },
        bun: { value: Number, date: Date },
        hba1c: { value: Number, date: Date },
        wbc: { value: Number, date: Date },
    },
});


const patientModel = mongoose.model('patients', Patient);
const doctorModel = mongoose.model('doctors', Doctor);
const PatientHealthData = mongoose.model("PatientHealthData", PatientHealthDataSchema);

module.exports = {
    patientModel: patientModel,
    doctorModel: doctorModel,
    PatientHealthData: PatientHealthData
}