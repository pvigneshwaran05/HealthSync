import React, { useEffect, useState } from "react";
import axios from "axios";

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch patient data (replace with actual API endpoint)
    axios.get("http://localhost:5000/api/patient")
      .then((res) => setPatient(res.data))
      .catch((err) => console.error("Error fetching patient data:", err));

    // Fetch visited doctors
    axios.get("http://localhost:5000/api/patient/doctors")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Error fetching doctors:", err));

    // Fetch appointments
    axios.get("http://localhost:5000/api/patient/appointments")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments:", err));
  }, []);

  if (!patient) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-blue-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Patient Dashboard</h2>
        <p className="text-lg">Welcome, {patient.name}!</p>
        <p className="mt-2">📍 {patient.address}</p>
        <p>📅 DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        {/* Visited Doctors */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Visited Doctors</h3>
          <ul>
            {doctors.length > 0 ? (
              doctors.map((doc) => (
                <li key={doc._id} className="py-2 border-b">
                  👨‍⚕️ {doc.name} - {doc.specialty} ({doc.hospital})
                </li>
              ))
            ) : (
              <p>No doctors visited yet.</p>
            )}
          </ul>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-6">
          <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
          <ul>
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <li key={appt._id} className="py-2 border-b">
                  📅 {new Date(appt.date).toLocaleString()} - {appt.doctorName}
                </li>
              ))
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
