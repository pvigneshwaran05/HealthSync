import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PatientDashboard.css";
import Sidebar from "./components/sidebar"; // Adjust the path as needed

export default function PatientDashboard() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("health");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }
  })


  const [uploadType, setUploadType] = useState("medical");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState({})
  const [isDragging, setIsDragging] = useState(false);


  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }

    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/patient/details?email=${email}`);
        setPatient(response.data);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        alert("Failed to fetch patient details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [email, navigate]);

  const handleToggleSidebar = (newState) => {
    setSidebarCollapsed(newState);
  }

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);

      const newFileNames = { ...fileNames };
      filesArray.forEach(file => {
        newFileNames[file.name] = ""; // Default empty name
      });
      setFileNames(newFileNames);
    }
  };
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);

      const newFileNames = { ...fileNames };
      filesArray.forEach(file => {
        newFileNames[file.name] = "";
      });
      setFileNames(newFileNames);
    }
  };
  
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };
  
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    // Create FormData
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });
    formData.append("documentType", uploadType);
    formData.append("patientEmail", patient.email);
    
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.post("http://localhost:8000/patient/upload-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      alert("Files uploaded successfully!");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your information...</p>
      </div>
    );
  }

  if (!patient) {
    return <div className="error-message">No patient details found. Please contact support.</div>;
  }

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    navigate("/patient-login");
  };

  const getStatusColor = (metric, value) => {
    // All the status color logic remains unchanged
    if (!value) return "gray";

    switch (metric) {
      case "blood_pressure":
        const systolic = parseInt(value.split('/')[0]);
        const diastolic = parseInt(value.split('/')[1]);
        if (systolic < 120 && diastolic < 80) return "green";
        if ((systolic >= 120 && systolic <= 129) && diastolic < 80) return "yellow";
        if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return "orange";
        return "red";

      case "glucose_levels":
        if (value < 100) return "green";
        if (value >= 100 && value <= 125) return "yellow";
        return "red";

      case "bmi":
        if (value >= 18.5 && value < 25) return "green";
        if ((value >= 25 && value < 30) || (value >= 17 && value < 18.5)) return "yellow";
        return "red";

      case "hba1c":
        if (value < 5.7) return "green";
        if (value >= 5.7 && value <= 6.4) return "yellow";
        return "red";

      case "cholesterol_ldl":
        if (value < 100) return "green";
        if (value >= 100 && value <= 129) return "yellow";
        if (value >= 130 && value <= 159) return "orange";
        return "red";

      default:
        return "gray";
    }
  };

  // Keep all other helper functions unchanged
  const getMetricLabel = (metric) => {
    switch (metric) {
      case "blood_pressure": return "Blood Pressure";
      case "glucose_levels": return "Glucose Levels";
      case "bmi": return "BMI";
      case "hba1c": return "HbA1c";
      case "cholesterol_ldl": return "LDL Cholesterol";
      default: return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getMetricUnit = (metric) => {
    switch (metric) {
      case "blood_pressure": return "mmHg";
      case "glucose_levels": return "mg/dL";
      case "bmi": return "kg/m²";
      case "hba1c": return "%";
      case "cholesterol_ldl": return "mg/dL";
      default: return "";
    }
  };

  const getMetricStatus = (metric, value) => {
    if (!value) return "No Data";

    switch (metric) {
      case "blood_pressure":
        const systolic = parseInt(value.split('/')[0]);
        const diastolic = parseInt(value.split('/')[1]);
        if (systolic < 120 && diastolic < 80) return "Normal";
        if ((systolic >= 120 && systolic <= 129) && diastolic < 80) return "Elevated";
        if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return "Stage 1 Hypertension";
        return "Stage 2 Hypertension";

      case "glucose_levels":
        if (value < 100) return "Normal";
        if (value >= 100 && value <= 125) return "Prediabetes";
        return "Diabetes";

      case "bmi":
        if (value < 17) return "Severe Underweight";
        if (value >= 17 && value < 18.5) return "Underweight";
        if (value >= 18.5 && value < 25) return "Normal";
        if (value >= 25 && value < 30) return "Overweight";
        if (value >= 30 && value < 35) return "Obese Class I";
        if (value >= 35 && value < 40) return "Obese Class II";
        return "Obese Class III";

      case "hba1c":
        if (value < 5.7) return "Normal";
        if (value >= 5.7 && value <= 6.4) return "Prediabetes";
        return "Diabetes";

      case "cholesterol_ldl":
        if (value < 100) return "Optimal";
        if (value >= 100 && value <= 129) return "Near Optimal";
        if (value >= 130 && value <= 159) return "Borderline High";
        if (value >= 160 && value <= 189) return "High";
        return "Very High";

      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your information...</p>
      </div>
    );
  }

  if (!patient) {
    return <div className="error-message">No patient details found. Please contact support.</div>;
  }

  // Key health metrics to display
  const keyHealthMetrics = [
    { name: "blood_pressure", icon: "🫀" },
    { name: "glucose_levels", icon: "🍬" },
    { name: "bmi", icon: "⚖️" },
    { name: "hba1c", icon: "🩸" },
    { name: "cholesterol_ldl", icon: "🫀" }
  ];

  return (
    <div className="patient-dashboard">
      <nav className="dashboard-nav">
        <div className="logo">
          <span className="logo-icon">👨‍⚕️</span>
          <h2>MediCare</h2>
        </div>
        <div className="user-info">
          <span className="welcome-text">Welcome, {patient.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="profile-summary">
            <div className="avatar">{patient.name.charAt(0)}</div>
            <h3>{patient.name}</h3>
            <p className="patient-id">Patient ID: {patient.email.substring(0, 8)}</p>
          </div>
          
          <ul className="nav-menu">
            <li
              className={activeTab === "details" ? "active" : ""}
              onClick={() => setActiveTab("details")}
            >
              <span className="menu-icon">👤</span> Profile
            </li>
            <li
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              <span className="menu-icon">📜</span> Medical History
            </li>
            <li
              className={activeTab === "appointments" ? "active" : ""}
              onClick={() => setActiveTab("appointments")}
            >
              <span className="menu-icon">📅</span> Appointments
            </li>
            <li
              className={activeTab === "prescriptions" ? "active" : ""}
              onClick={() => setActiveTab("prescriptions")}
            >
              <span className="menu-icon">💊</span> Prescriptions
            </li>
            <li
              className={activeTab === "documents" ? "active" : ""}
              onClick={() => setActiveTab("documents")}
            >
              <span className="menu-icon">📄</span> Upload Documents
            </li>
          </ul>
        </aside>

        <main className="content-area">
          <div className="content-header">
            <h2>
              {activeTab === "details" && "Patient Profile"}
              {activeTab === "history" && "Medical History"}
              {activeTab === "appointments" && "Upcoming Appointments"}
              {activeTab === "prescriptions" && "Current Prescriptions"}
            </h2>
            <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          {activeTab === "details" && (
            <div className="content-card profile-details">
              <div className="card-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{patient.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{patient.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{patient.phone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{patient.gender}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Home Address</span>
                  <span className="info-value">{patient.address}</span>
                </div>
              </div>
              <button className="edit-profile-btn">Edit Profile</button>
            </div>
          )}

          {activeTab === "history" && (
            <div className="content-card">
              <div className="card-header">
                <h3>Medical Records</h3>
                <div className="filter-controls">
                  <select className="filter-select">
                    <option value="all">All Time</option>
                    <option value="year">Last Year</option>
                    <option value="6months">Last 6 Months</option>
                  </select>
                </div>
              </div>
              
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="medical-history-list">
                  {patient.medicalHistory.map((record, index) => (
                    <div className="medical-record" key={index}>
                      <div className="record-date">
                        <div className="date-chip">{new Date(record.date).toLocaleDateString()}</div>
                      </div>
                      <div className="record-content">
                        <h4 className="record-diagnosis">{record.diagnosis}</h4>
                        <p className="record-treatment">{record.treatment}</p>
                        <div className="record-doctor">Dr. Johnson</div>
                      </div>
                      <div className="record-actions">
                        <button className="view-details-btn">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>No medical history available.</p>
                  <p className="empty-subtext">Your medical records will appear here once added by your healthcare provider.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="content-card empty-state">
              <div className="empty-icon">📅</div>
              <p>No upcoming appointments.</p>
              <button className="primary-btn">Schedule Appointment</button>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="content-card empty-state">
              <div className="empty-icon">💊</div>
              <p>No active prescriptions.</p>
              <p className="empty-subtext">Your current prescriptions will appear here.</p>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="content-card">
              <div className="card-header">
                <h3>Upload Medical Documents</h3>
              </div>
              
              <div className="document-upload-container">
                <div className="upload-types">
                  <div className="upload-type-tabs">
                    <button 
                      className={uploadType === "medical" ? "active" : ""} 
                      onClick={() => setUploadType("medical")}
                    >
                      Medical Records
                    </button>
                    <button 
                      className={uploadType === "insurance" ? "active" : ""} 
                      onClick={() => setUploadType("insurance")}
                    >
                      Insurance Documents
                    </button>
                    <button 
                      className={uploadType === "other" ? "active" : ""} 
                      onClick={() => setUploadType("other")}
                    >
                      Other Documents
                    </button>
                  </div>
                </div>
                
                <div className="upload-area">
                  <div 
                    className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }} 
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFileDrop(e);
                    }}
                  >
                    <div className="upload-icon">📁</div>
                    <p>Drag and drop files here or <span className="browse-text">browse</span></p>
                    <p className="upload-hint">Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="file-input" 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                      onChange={handleFileSelect} 
                      multiple 
                    />
                    <label htmlFor="file-upload" className="upload-btn">Select Files</label>
                  </div>
                </div>
                
                {selectedFiles.length > 0 ? (
                  <div className="selected-files">
                    <h4>
                      Selected Files
                      <span className="file-count">{selectedFiles.length}</span>
                    </h4>
                    <ul className="file-list">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="file-item">
                          <div className="file-info">
                            <div className="file-icon">
                              {file.type.includes('pdf') ? '📄' : 
                              file.type.includes('doc') ? '📝' : '🖼️'}
                            </div>
                            <div className="file-name-container">
                              <p className="file-name">{file.name}</p>
                              <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          </div>

                          <div>
                            <label className="file-name-label">Report Name</label>
                            <input
                              type="text"
                              placeholder="Enter report name (required)"
                              value={fileNames[file.name] || ""}
                              onChange={(e) => {
                                setFileNames({ ...fileNames, [file.name]: e.target.value });
                              }}
                              className="file-name-input"
                              required
                            />
                          </div>

                          <button 
                            className="remove-file-btn" 
                            onClick={() => removeFile(index)}
                            aria-label="Remove file"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className="upload-submit-btn" 
                      onClick={uploadFiles}
                      disabled={Object.values(fileNames).some(name => !name.trim())}
                    >
                      {loading ? "Uploading..." : "Upload Files"}
                    </button>
                  </div>
                ) : (
                  <div className="selected-files">
                    <h4>Selected Files</h4>
                    <div className="no-files">
                      <p>No files selected yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
