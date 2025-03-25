import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
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
  };

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
        <div className="nav-left">
          <div className="logo">
            <span className="logo-icon">👨‍⚕️</span>
            <h2>MediCare</h2>
          </div>
        </div>
        <div className="user-info">
          <span className="welcome-text">Welcome, <strong>{patient.name}</strong></span>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Using the new Sidebar component */}
        <Sidebar 
          userInfo={patient}
          onToggleSidebar={handleToggleSidebar}
          initialCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <div className="content-header">
            <h2>
              {activeTab === "details" && "Patient Profile"}
              {activeTab === "health" && "Health Dashboard"}
              {activeTab === "history" && "Medical History"}
              {activeTab === "appointments" && "Upcoming Appointments"}
              {activeTab === "prescriptions" && "Current Prescriptions"}
            </h2>
            <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          {/* All content sections remain unchanged */}
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

          {activeTab === "health" && (
            <div className="health-dashboard">
              <div className="health-greeting">
                <h2 className="greeting-text">Hi <span className="greeting-name">{patient.name}</span></h2>
                <p className="greeting-subtitle">Here's your health overview for today</p>
              </div>

              <div className="health-summary-card">
                <h3>Key Health Indicators</h3>
                <p className="health-subtitle">Review your most important health metrics below</p>
                
                <div className="health-metrics-grid">
                  {keyHealthMetrics.map((metric) => {
                    const metricData = patient[metric.name] || {};
                    const metricValue = metricData.value;
                    const statusColor = getStatusColor(metric.name, metricValue);
                    const statusText = getMetricStatus(metric.name, metricValue);
                    
                    return (
                      <div className={`health-metric-card status-${statusColor}`} key={metric.name}>
                        <div className="metric-header">
                          <span className="metric-icon">{metric.icon}</span>
                          <span className="metric-name">{getMetricLabel(metric.name)}</span>
                        </div>
                        
                        {metricValue ? (
                          <>
                            <div className="metric-value">
                              {metric.name === "blood_pressure" ? metricValue : metricValue}
                              <span className="metric-unit">{getMetricUnit(metric.name)}</span>
                            </div>
                            <div className="metric-details">
                              <span className={`status-badge ${statusColor}`}>{statusText}</span>
                              <span className="metric-date">Last updated: {formatDate(metricData.date)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="metric-empty-state">
                            <p>No data available</p>
                            <button className="record-data-btn">Record Data</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="health-actions">
                  <button className="primary-btn">View All Health Data</button>
                  <button className="outline-btn">Download Health Report</button>
                </div>
              </div>
              
              <div className="health-tips-card">
                <h3>Health Insights</h3>
                <div className="health-tips-content">
                  <div className="tip-item">
                    <span className="tip-icon">💡</span>
                    <div className="tip-content">
                      <h4>Regular Monitoring</h4>
                      <p>Tracking your vital signs regularly helps you stay ahead of potential health issues.</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🥗</span>
                    <div className="tip-content">
                      <h4>Healthy Diet</h4>
                      <p>A balanced diet rich in fruits, vegetables, and whole grains can improve your overall health metrics.</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🏃‍♂️</span>
                    <div className="tip-content">
                      <h4>Regular Exercise</h4>
                      <p>Aim for at least 150 minutes of moderate activity per week to maintain good heart health.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};