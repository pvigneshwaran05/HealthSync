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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState({});
  const [fileDates, setFileDates] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Suggestion state variables
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filesToProcess, setFilesToProcess] = useState([]);

  // Get today's date in YYYY-MM-DD format for date input default
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }

    const fetchPatientDetails = async () => {
      try {
        console.log(email);
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

  // Effect to process next file when a suggestion is selected
  useEffect(() => {
    if (filesToProcess.length > 0 && !showSuggestionDialog && currentFile === null) {
      processNextFile();
    }
  }, [filesToProcess, showSuggestionDialog, currentFile]);

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);

      const newFileNames = { ...fileNames };
      const newFileDates = { ...fileDates };
      filesArray.forEach(file => {
        newFileNames[file.name] = ""; // Default empty name
        newFileDates[file.name] = today; // Default to today's date
      });
      setFileNames(newFileNames);
      setFileDates(newFileDates);
    }
  };
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);

      const newFileNames = { ...fileNames };
      const newFileDates = { ...fileDates };
      filesArray.forEach(file => {
        newFileNames[file.name] = "";
        newFileDates[file.name] = today; // Default to today's date
      });
      setFileNames(newFileNames);
      setFileDates(newFileDates);
    }
  };
  
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const removedFile = newFiles[index];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    // Also clean up file names and dates
    const newFileNames = { ...fileNames };
    const newFileDates = { ...fileDates };
    delete newFileNames[removedFile.name];
    delete newFileDates[removedFile.name];
    setFileNames(newFileNames);
    setFileDates(newFileDates);
  };
  
  const processNextFile = async () => {
    if (filesToProcess.length === 0) {
      // All files processed, now upload them
      performFileUpload();
      return;
    }

    // Get the next file to process
    const fileIndex = filesToProcess[0];
    const file = selectedFiles[fileIndex];
    
    // Remove this file from the queue
    setFilesToProcess(filesToProcess.slice(1));
    
    // Get suggestions for this file
    try {
      setIsLoading(true);
      const response = await axios.post("http://127.0.0.1:5001/predict", {
        report_name: fileNames[file.name] || file.name
      });
      setSuggestions(response.data.predictions || []);
      setCurrentFile({ file: file, index: fileIndex });
      setShowSuggestionDialog(true);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      alert(`Failed to get suggestions for ${file.name}. Skipping to next file.`);
      // Process the next file
      processNextFile();
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    // Check if any file names are empty
    const emptyNames = Object.values(fileNames).some(name => !name.trim());
    if (emptyNames) {
      alert("Please provide names for all files before uploading.");
      return;
    }
    
    // Directly upload the files without showing suggestions
    performFileUpload();
  };
  
  const performFileUpload = async () => {
    // Create FormData for the actual upload
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append("files", file);
      formData.append("reportNames", fileNames[file.name] || "");
      formData.append("reportDates", fileDates[file.name] || today);
    });
    formData.append("documentType", uploadType);
    formData.append("patientEmail", patient.email);
    
    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:8000/patient/upload-documents?patientEmail=${encodeURIComponent(patient.email)}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      alert("Files uploaded successfully!");
      setSelectedFiles([]);
      setFileNames({});
      setFileDates({});
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (fileName, fileIndex) => {
    try {
      setIsLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        report_name: fileName
      });
      setSuggestions(response.data.predictions || []);
      setCurrentFile({ file: selectedFiles[fileIndex], index: fileIndex });
      setShowSuggestionDialog(true);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      alert("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (!currentFile || !currentFile.file) return;
    
    // Update the file name
    const newFileNames = { ...fileNames };
    if (suggestion !== "other") {
      newFileNames[currentFile.file.name] = suggestion;
    }
    
    setFileNames(newFileNames);
    setShowSuggestionDialog(false);
    setCurrentFile(null);
    
    // The next file will be processed automatically via the useEffect
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
            <h2>Upload Medical Documents</h2>
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
                          <div className="file-details-inputs">
                            <div className="file-input-group">
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
                              <button 
                                className="suggest-btn"
                                onClick={() => getSuggestions(fileNames[file.name], index)}
                                disabled={!fileNames[file.name]}
                              >
                                Find Report 
                              </button>
                            </div>
                            
                            <div className="file-input-group">
                              <label className="file-date-label">Report Date</label>
                              <input
                                type="date"
                                value={fileDates[file.name] || today}
                                onChange={(e) => {
                                  setFileDates({ ...fileDates, [file.name]: e.target.value });
                                }}
                                className="file-date-input"
                                required
                              />
                            </div>
                          </div>
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