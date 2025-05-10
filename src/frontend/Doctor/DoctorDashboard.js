import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/DoctorDashboard.css";
import MedicalBlogs from "./MedicalBlogs";
import Sidebar from "../components/doctorSidebar";
import PatientManagement from "./PatientManagement"; // Import the new component

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Dummy data for recent patients and appointments
  const [recentPatients, setRecentPatients] = useState([
    { id: 1, name: "John Doe", condition: "Hypertension", lastVisit: "2024-03-15" },
    { id: 2, name: "Jane Smith", condition: "Diabetes", lastVisit: "2024-03-20" },
    { id: 3, name: "Mike Johnson", condition: "Respiratory Issue", lastVisit: "2024-03-22" }
  ]);

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    { id: 1, patientName: "Emily Brown", time: "10:00 AM", date: "2024-03-28", reason: "Follow-up Checkup" },
    { id: 2, patientName: "Robert Wilson", time: "11:30 AM", date: "2024-03-28", reason: "Annual Physical" },
    { id: 3, patientName: "Sarah Lee", time: "02:00 PM", date: "2024-03-28", reason: "Consultation" }
  ]);

  useEffect(() => {
    if (!email) {
      navigate("/doctor-login");
      return;
    }

    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/doctor/details?email=${email}`);
        setDoctor(response.data);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        alert("Failed to fetch doctor details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [email, navigate]);

  const handleToggleSidebar = (newState) => {
    setSidebarCollapsed(newState);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    navigate("/doctor-login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your information...</p>
      </div>
    );
  }

  if (!doctor) {
    return <div className="error-message">No doctor details found. Please contact support.</div>;
  }

  return (
    <div className="doctor-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo">
            <span className="logo-icon">👨‍⚕️</span>
            <h2>MediCare Pro</h2>
          </div>
        </div>
        <div className="user-info">
          <span className="welcome-text">Welcome, <strong>Dr. {doctor.name}</strong></span>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <Sidebar 
          userInfo={doctor}
          onToggleSidebar={handleToggleSidebar}
          initialCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <div className="content-header">
            <h2>
              {activeTab === "dashboard" && "Doctor Dashboard"}
              {activeTab === "profile" && "Professional Profile"}
              {activeTab === "blogs" && "Medical Blogs"}
              {activeTab === "patients" && "Patient Management"}
              {activeTab === "appointments" && "Appointment Schedule"}
            </h2>
            <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          {activeTab === "dashboard" && (
            <div className="doctor-dashboard-overview">
              <div className="dashboard-greeting">
                <h2 className="greeting-text">Hi <span className="greeting-name">Dr. {doctor.name}</span></h2>
                <p className="greeting-subtitle">Your medical insights and patient care dashboard</p>
              </div>

              <div className="dashboard-cards">
                <div className="dashboard-card patient-card">
                  <h3>Recent Patients</h3>
                  <div className="patient-list">
                    {recentPatients.map(patient => (
                      <div key={patient.id} className="patient-item">
                        <div className="patient-info">
                          <strong>{patient.name}</strong>
                          <span>{patient.condition}</span>
                        </div>
                        <span className="patient-date">Last Visit: {patient.lastVisit}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab("patients")}
                  >
                    View All Patients
                  </button>
                </div>

                <div className="dashboard-card appointment-card">
                  <h3>Upcoming Appointments</h3>
                  <div className="appointment-list">
                    {upcomingAppointments.map(appointment => (
                      <div key={appointment.id} className="appointment-item">
                        <div className="appointment-details">
                          <strong>{appointment.patientName}</strong>
                          <span>{appointment.reason}</span>
                        </div>
                        <div className="appointment-time">
                          {appointment.date} at {appointment.time}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="view-all-btn">View Schedule</button>
                </div>
              </div>

              <div className="quick-actions">
                <button 
                  className="quick-action-btn"
                  onClick={() => setActiveTab("blogs")}
                >
                  <span>📝</span> Write Blog
                </button>
                <button className="quick-action-btn">
                  <span>👥</span> New Patient
                </button>
                <button className="quick-action-btn">
                  <span>📅</span> Schedule Appointment
                </button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="doctor-profile content-card">
              <h3>Professional Details</h3>
              <div className="profile-grid">
                <div className="profile-section">
                  <h4>Personal Information</h4>
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">Dr. {doctor.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Specialization</span>
                      <span className="detail-value">{doctor.speciality}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Medical License</span>
                      <span className="detail-value">{doctor.licenseNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="profile-section">
                  <h4>Contact Information</h4>
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{doctor.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{doctor.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Hospital/Clinic</span>
                      <span className="detail-value">{doctor.hospital}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="edit-profile-btn">Edit Profile</button>
            </div>
          )}

          {activeTab === "patients" && (
            <PatientManagement doctor={doctor} />
          )}

          {activeTab === "blogs" && (
            <MedicalBlogs doctor={doctor} />
          )}

          {/* You can add more tab contents for appointments */}
        </main>
      </div>
    </div>
  );
}