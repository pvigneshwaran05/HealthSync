import React, { useState } from "react";
import "../styles/DoctorDashboard.css";
import PatientDashboard from "./PatientDashboard";

export default function DoctorDashboard() {
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState([]);
  const [grantedPatients, setGrantedPatients] = useState([]);

  const handleRequestAccess = () => {
    if (!email) {
      alert("Enter a valid patient email.");
      return;
    }
    setRequests([...requests, { email, status: "Pending" }]);
    setEmail("");
  };

  return (
    <div className="doctor-dashboard">
      <h1>Doctor Dashboard</h1>

      {/* Request Access */}
      <div className="request-access">
        <h2>Request Patient Access</h2>
        <input
          type="email"
          placeholder="Enter Patient Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button onClick={handleRequestAccess}>Request Access</button>
      </div>

      {/* Display Accessed Patients */}
      <div className="patient-section">
        <h2>Patients with Granted Access</h2>
        {grantedPatients.length === 0 ? (
          <p>No patient records accessible.</p>
        ) : (
          grantedPatients.map((email, index) => (
            <div key={index} className="patient-card">
              <h3>Patient: {email}</h3>
              <PatientDashboard />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
