import React, { useState } from "react";
import "../styles/PatientDashboard.css";

export default function PatientDashboard() {
  const [patient, setPatient] = useState({
    name: "",
    email: "",
    phone: "",
    age: 0,
    gender: "",
    bloodGroup: "",
  });

  const [medicalHistory, setMedicalHistory] = useState([
    { id: 1, diagnosis: "Hypertension", treatment: "BP medication", date: "2024-01-15" },
    { id: 2, diagnosis: "Diabetes", treatment: "Insulin therapy", date: "2023-09-20" },
  ]);

  const handleGrantAccess = (email) => {
  };

  return (
    <div className="patient-dashboard">
      <h2>Patient Details</h2>
      <p><strong>Name:</strong> {patient.name}</p>
      <p><strong>Email:</strong> {patient.email}</p>

      {/* Grant or Deny Access */}
      <div className="access-requests">
        <h2>Access Requests</h2>
        {(
          <ul>
            
          </ul>
        )}
      </div>

      {/* Medical History */}
      <div className="medical-history">
        <h2>Medical History</h2>
        <ul>
          {medicalHistory.map((record) => (
            <li key={record.id}>
              <strong>Diagnosis:</strong> {record.diagnosis} <br />
              <strong>Treatment:</strong> {record.treatment} <br />
              <strong>Date:</strong> {record.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
