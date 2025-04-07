import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/PatientManagement.css"; // You'll need to create this CSS file

function PatientManagement({ doctor }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientReport, setPatientReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/doctor/patients', {
        params: { doctorId: doctor.id }
      });
      setPatients(response.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientReport = async (patientId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/doctor/patient/${patientId}/report`);
      setPatientReport(response.data);
    } catch (err) {
      console.error("Error fetching patient report:", err);
      setError("Failed to load patient report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPatientReport = (patient) => {
    setSelectedPatient(patient);
    fetchPatientReport(patient.id);
  };

  useEffect(() => {
    fetchAllPatients();
  }, [doctor.id]);

  return (
    <div className="patients-management">
      <div className="content-card">
        <div className="patients-header">
          <h3>Patient Directory</h3>
          <div className="patients-search">
            <input type="text" placeholder="Search patients..." />
            <button className="search-btn">Search</button>
          </div>
        </div>
        
        {isLoading && !selectedPatient && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading patients...</p>
          </div>
        )}
        
        {error && !selectedPatient && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchAllPatients}>Try Again</button>
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  {/* <th>Age</th> */}
                  <th>Email</th>
                  <th>Phone No</th>
                  <th>Gender</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map(patient => (
                    <tr key={patient.id}>
                      <td>{patient._id}</td>
                      <td>{patient.name}</td>
                      <td>{patient.email}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.address}</td>
                      <td>
                        <button 
                          className="view-report-btn"
                          onClick={() => handleViewPatientReport(patient)}
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data-message">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Report Modal */}
      {selectedPatient && (
        <div className="patient-report-modal">
          <div className="report-content">
            <div className="report-header">
              <h3>Patient Report: {selectedPatient.name}</h3>
              <button 
                className="close-report-btn" 
                onClick={() => {
                  setSelectedPatient(null);
                  setPatientReport(null);
                }}
              >
                ×
              </button>
            </div>
            
            {isLoading && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <p>Loading patient report...</p>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => fetchPatientReport(selectedPatient.id)}>
                  Try Again
                </button>
              </div>
            )}
            
            {patientReport && !isLoading && !error && (
              <div className="report-details">
                <div className="report-section">
                  <h4>Patient Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Patient ID</span>
                      <span className="detail-value">{patientReport.personalInfo.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{patientReport.personalInfo.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Age</span>
                      <span className="detail-value">{patientReport.personalInfo.age}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gender</span>
                      <span className="detail-value">{patientReport.personalInfo.gender}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Contact</span>
                      <span className="detail-value">{patientReport.personalInfo.contact}</span>
                    </div>
                  </div>
                </div>
                
                <div className="report-section">
                  <h4>Medical History</h4>
                  <div className="medical-history">
                    <p>{patientReport.medicalHistory.summary}</p>
                    <ul className="history-list">
                      {patientReport.medicalHistory.details.map((item, index) => (
                        <li key={index}>
                          <strong>{item.category}:</strong> {item.info}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="report-section">
                  <h4>Recent Visits</h4>
                  <table className="visits-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Purpose</th>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientReport.visits.map((visit, index) => (
                        <tr key={index}>
                          <td>{visit.date}</td>
                          <td>{visit.purpose}</td>
                          <td>{visit.diagnosis}</td>
                          <td>{visit.treatment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="report-section">
                  <h4>Current Medication</h4>
                  <ul className="medication-list">
                    {patientReport.medications.map((med, index) => (
                      <li key={index}>
                        <span className="med-name">{med.name}</span>
                        <span className="med-dosage">{med.dosage}</span>
                        <span className="med-frequency">{med.frequency}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="report-actions">
                  <button className="report-action-btn">Update Record</button>
                  <button className="report-action-btn">Print Report</button>
                  <button className="report-action-btn">Schedule Follow-up</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientManagement;