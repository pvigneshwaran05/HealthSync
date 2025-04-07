import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../../styles/PatientDashboard.css";
import "../../styles/PatientDocuments.css";
import Sidebar from "../components/patientSidebar";

export default function DocumentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const email = sessionStorage.getItem("email");
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }

    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/patient/document/${id}`);
        setDocument(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching document details:", error);
        setError("Failed to fetch document details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id, email, navigate]);

  const handleToggleSidebar = (newState) => {
    setSidebarCollapsed(newState);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    navigate("/patient-login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileExtension = (fileName) => {
    return fileName.split('.').pop().toUpperCase();
  };

  const handleDownloadDocument = () => {
    // Implement document download functionality
    alert("Document download functionality will be implemented here");
  };

  const handleDeleteDocument = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(`http://localhost:8000/patient/document/${id}`);
        navigate("/medical-report");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document. Please try again later.");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading document details...</p>
      </div>
    );
  }

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
          <span className="welcome-text">Document Details</span>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <Sidebar 
          userInfo={{ email }}
          onToggleSidebar={handleToggleSidebar}
          initialCollapsed={sidebarCollapsed}
          activeTab="medical-report"
          setActiveTab={() => {}}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <button className="back-button" onClick={() => navigate("/medical-report")}>
            ← Back to Documents
          </button>

          {error && <div className="error-message">{error}</div>}

          {document && (
            <div className="document-details">
              <div className="content-card">
                <div className="document-header">
                  <h2>{document.reportName}</h2>
                  <div className="document-actions">
                    <button className="primary-btn" onClick={handleDownloadDocument}>
                      Download
                    </button>
                    <button className="danger-btn" onClick={handleDeleteDocument}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="document-info">
                  <div className="info-group">
                    <span className="info-label">File Name</span>
                    <span className="info-value">{document.fileName}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">File Type</span>
                    <span className="info-value">{getFileExtension(document.fileName)}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">File Size</span>
                    <span className="info-value">{formatFileSize(document.fileSize)}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Category</span>
                    <span className="info-value">{document.category}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Report Date</span>
                    <span className="info-value">{formatDate(document.reportDate)}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Upload Date</span>
                    <span className="info-value">{formatDate(document.uploadDate)}</span>
                  </div>
                </div>
              </div>

              {document.fileType.includes('image') && (
                <div className="content-card">
                  <h3>Document Preview</h3>
                  <div className="document-preview">
                    <img src={`http://localhost:8000/${document.filePath}`} alt={document.reportName} />
                  </div>
                </div>
              )}

              {document.extractedText && (
                <div className="content-card">
                  <h3>Extracted Text</h3>
                  <div className="extracted-text">
                    {document.extractedText}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}