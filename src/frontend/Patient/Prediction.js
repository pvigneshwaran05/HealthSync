import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Prediction.css";
import Sidebar from "../components/patientSidebar";

export default function Prediction() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("predictions");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }

    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/patient/patientAllDetails?email=${email}`);
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

  const renderProbabilityBar = (condition, probability) => {
    const width = Math.round(probability * 100);
    const colorMap = {
      'Diabetic': '#10b981',
      'Cancer': '#ef4444',
      'Pneumonia': '#f59e0b'
    };

    return (
      <div className="probability-bar-container">
        <div className="probability-label">{condition}</div>
        <div className="probability-bar-wrapper">
          <div 
            className="probability-bar" 
            style={{ 
              width: `${width}%`, 
              backgroundColor: colorMap[condition] || '#64748b' 
            }}
          ></div>
          <span className="probability-percentage">{(probability * 100).toFixed(2)}%</span>
        </div>
      </div>
    );
  };

  const renderHealthMetric = (metric, value, date) => {
    const getIconForMetric = (metricName) => {
      const icons = {
        'blood pressure': '🩸',
        'glucose': '🧪',
        'heart rate': '❤️',
        'weight': '⚖️',
        'bmi': '📊',
        'cholesterol': '📉',
        'blood cell count': '🔬',
        'oxygen saturation': '💨',
        'temperature': '🌡️'
      };
      
      const normalizedMetric = metricName.toLowerCase();
      for (const [key, icon] of Object.entries(icons)) {
        if (normalizedMetric.includes(key)) {
          return icon;
        }
      }
      return '📋';
    };
    
    const metricIcon = getIconForMetric(metric);
    
    return (
      <div className="health-detail-card">
        <div className="metric-icon">{metricIcon}</div>
        <div className="health-metric-content">
          <div className="health-metric-header">
            <span className="metric-name">{metric}</span>
            <span className="metric-date">{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="metric-value">{value}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading predictions...</p>
      </div>
    );
  }

  const { patient_details, health_data, model_prediction } = patient;

  return (
    <div className="patient-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo">
            <span className="logo-icon">🩺</span>
            <h2>MediCare AI</h2>
          </div>
        </div>
        <div className="user-info">
          <span className="welcome-text">Welcome, <strong>{patient_details.name}</strong></span>
        </div>
      </nav>

      <div className="dashboard-container">
        <Sidebar 
          userInfo={patient_details}
          onToggleSidebar={handleToggleSidebar}
          initialCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <div className="prediction-container">
            <div className="prediction-header">
              <h2>Health Risk Assessment</h2>
              <p>AI-powered analysis of your personal health data</p>
            </div>

            <div className="hub-layout">
              {/* Center Prediction Hub */}
              <div className="prediction-hub">
                <div className="prediction-hub-inner">
                  <div className="hub-title">Your Primary Risk</div>
                  <div className="hub-condition">
                    {model_prediction.predicted_condition}
                  </div>
                  <div className="hub-description">
                    Based on comprehensive analysis of your health metrics
                  </div>
                  <div className="risk-level">
                    {
                      (() => {
                        const highestProb = Math.max(...Object.values(model_prediction.probabilities));
                        if (highestProb > 0.7) return "High Risk";
                        if (highestProb > 0.4) return "Moderate Risk";
                        return "Low Risk";
                      })()
                    }
                  </div>
                </div>
              </div>
              
              {/* Health Metrics Grid */}
              <div className="metrics-circle">
                {Object.entries(health_data).map(([metric, {value, date}], index) => (
                  <div className="metric-position" key={metric}>
                    {renderHealthMetric(metric.replace(/_/g, ' '), value, date)}
                  </div>
                ))}
              </div>
            </div>

            <div className="prediction-details">
              <div className="prediction-probabilities">
                <h3>Risk Probability Breakdown</h3>
                {Object.entries(model_prediction.probabilities).map(([condition, probability]) => 
                  renderProbabilityBar(condition, probability)
                )}
              </div>

              <div className="prediction-insights">
                <h3>Health Insights & Recommendations</h3>
                <div className="insights-content">
                  <div className="insight-card">
                    <span className="insight-icon">💡</span>
                    <div className="insight-text">
                      <h4>Early Detection</h4>
                      <p>This AI model helps in early risk identification. Please consult your healthcare provider for a comprehensive evaluation.</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <span className="insight-icon">🩺</span>
                    <div className="insight-text">
                      <h4>Personalized Analysis</h4>
                      <p>The prediction is based on your current health metrics and historical data.</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <span className="insight-icon">📊</span>
                    <div className="insight-text">
                      <h4>Risk Management</h4>
                      <p>Regular monitoring and lifestyle adjustments can help manage and reduce your identified health risks.</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <span className="insight-icon">🔄</span>
                    <div className="insight-text">
                      <h4>Continuous Monitoring</h4>
                      <p>Keep updating your health metrics for more accurate predictions and trend analysis over time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}