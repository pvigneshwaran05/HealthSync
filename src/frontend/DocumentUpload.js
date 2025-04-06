import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/DocumentUpload.css";
import Sidebar from "./components/sidebar";

export default function DocumentUpload() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [uploadType, setUploadType] = useState("medical");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileDate, setFileDate] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Suggestion state variables
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Get today's date in YYYY-MM-DD format for date input default
  const today = new Date().toISOString().split('T')[0];

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

  useEffect(() => {
    // Reset fields when upload succeeds
    if (uploadSuccess) {
      setSelectedFile(null);
      setFileName("");
      setFileDate(today);
      // Reset success message after 3 seconds
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess, today]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileDate(today);
      // Clear any previous errors
      setUploadError("");
    }
  };
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileDate(today);
      // Clear any previous errors
      setUploadError("");
    }
    setIsDragging(false);
  };
  
  const removeFile = () => {
    setSelectedFile(null);
    setFileName("");
    setFileDate(today);
    setUploadError("");
  };
  
  const getSuggestions = async () => {
    if (!fileName.trim()) {
      alert("Please enter a report name first to get suggestions");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:5000/predict", {
        report_name: fileName
      });
      setSuggestions(response.data.predictions || []);
      setShowSuggestionDialog(true);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      alert("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion !== "other") {
      setFileName(suggestion);
    }
    setShowSuggestionDialog(false);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }
    
    if (!fileName.trim()) {
      setUploadError("Please provide a name for the file");
      return;
    }
    
    // Create FormData for the file upload
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("reportName", fileName);
    formData.append("reportDate", fileDate || today);
    formData.append("documentType", uploadType);
    
    try {
      setLoading(true);
      setUploadError("");
      
      const response = await axios.post(
        `http://localhost:8000/patient/upload-document?patientEmail=${encodeURIComponent(patient.email)}`, 
        formData, 
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      
      setUploadSuccess(true);
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError(
        error.response?.data?.error || 
        "Failed to upload file. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    navigate("/patient-login");
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

  return (
    <div className="patient-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <button className="toggle-sidebar-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? "☰" : "✕"}
          </button>
          <div className="logo">
            <span className="logo-icon">👨‍⚕️</span>
            <h2>MediCare</h2>
          </div>
        </div>
        <div className="user-info">
          <span className="welcome-text">Welcome, {patient.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <Sidebar 
          userInfo={patient}
          onToggleSidebar={(state) => setSidebarCollapsed(state)}
          initialCollapsed={sidebarCollapsed}
          activeTab="upload-documents"
          setActiveTab={(tab) => {
            switch(tab) {
              case 'health':
              case 'details':
                navigate('/patient-dashboard');
                break;
              case 'history':
                navigate('/medical-report');
                break;
              case 'appointments':
                navigate('/appointments');
                break;
              default:
                break;
            }
          }}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <div className="content-header">
            <h2>Upload Medical Document</h2>
            <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div className="content-card">
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
              
              {uploadSuccess && (
                <div className="success-message">
                  Document uploaded successfully!
                </div>
              )}
              
              {uploadError && (
                <div className="error-message">
                  {uploadError}
                </div>
              )}
              
              <div className="upload-area">
                <div 
                  className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }} 
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => handleFileDrop(e)}
                >
                  <div className="upload-icon">📁</div>
                  <p>Drag and drop a file here or <span className="browse-text">browse</span></p>
                  <p className="upload-hint">Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
                  <p className="upload-hint">Maximum file size: 10MB</p>
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="file-input" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                    onChange={handleFileSelect} 
                  />
                  <label htmlFor="file-upload" className="upload-btn">Select File</label>
                </div>
              </div>
              
              {selectedFile ? (
                <div className="selected-files">
                  <h4>Selected File</h4>
                  <div className="file-item">
                    <div className="file-info">
                      <div className="file-icon">
                        {selectedFile.type.includes('pdf') ? '📄' : 
                        selectedFile.type.includes('doc') ? '📝' : '🖼️'}
                      </div>
                      <div className="file-name-container">
                        <p className="file-name">{selectedFile.name}</p>
                        <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    </div>

                    <div>
                      <div className="file-details-inputs">
                        <div className="file-input-group">
                          <label className="file-name-label">Report Name</label>
                          <input
                            type="text"
                            placeholder="Enter report name (required)"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="file-name-input"
                            required
                          />
                          <button 
                            className="suggest-btn"
                            onClick={getSuggestions}
                            disabled={!fileName.trim()}
                          >
                            Find Report 
                          </button>
                        </div>
                        
                        <div className="file-input-group">
                          <label className="file-date-label">Report Date</label>
                          <input
                            type="date"
                            value={fileDate || today}
                            onChange={(e) => setFileDate(e.target.value)}
                            className="file-date-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      className="remove-file-btn" 
                      onClick={removeFile}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                  <button 
                    className="upload-submit-btn" 
                    onClick={uploadFile}
                    disabled={!selectedFile || !fileName.trim() || loading}
                  >
                    {loading ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              ) : (
                <div className="selected-files">
                  <h4>Selected File</h4>
                  <div className="no-files">
                    <p>No file selected yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Suggestion dialog */}
      {showSuggestionDialog && (
        <div className="suggestion-dialog-overlay">
          <div className="suggestion-dialog">
            <h3>Suggested Report Names</h3>
            {isLoading ? (
              <div className="dialog-loading">Loading suggestions...</div>
            ) : (
              <>
                <div className="suggestions-list">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, idx) => (
                      <div key={idx} className="suggestion-item" onClick={() => handleSelectSuggestion(suggestion.report)}>
                        <div className="suggestion-details">
                          <span className="suggestion-name">{suggestion.report}</span>
                          <span className="suggestion-category">{suggestion.category}</span>
                        </div>
                        <span className="suggestion-confidence">{(suggestion.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-suggestions">No suggestions found</div>
                  )}
                  <div className="suggestion-item other-option" onClick={() => handleSelectSuggestion("other")}>
                    <span className="suggestion-name">Use my own name</span>
                  </div>
                </div>
                <div className="dialog-actions">
                  <button className="dialog-cancel" onClick={() => setShowSuggestionDialog(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}