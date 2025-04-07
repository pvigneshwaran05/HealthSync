import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/PatientDashboard.css";
import "../../styles/PatientDocuments.css";
import Sidebar from "../components/patientSidebar";

export default function PatientDocuments() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("uploadDate");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }

    const fetchPatientDocuments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/patient/documents?patientEmail=${email}`);
        setDocuments(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Failed to fetch documents. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDocuments();
  }, [email, navigate]);

  const handleToggleSidebar = (newState) => {
    setSidebarCollapsed(newState);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    navigate("/patient-login");
  };

  // Get unique categories from documents
  const categories = ["All", ...new Set(documents.map(doc => doc.category))];

  // Filter and sort documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.reportName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "reportName") {
      return sortOrder === "asc" 
        ? a.reportName.localeCompare(b.reportName) 
        : b.reportName.localeCompare(a.reportName);
    } else if (sortBy === "category") {
      return sortOrder === "asc" 
        ? a.category.localeCompare(b.category) 
        : b.category.localeCompare(a.category);
    } else {
      // Default sort by date
      return sortOrder === "asc" 
        ? new Date(a[sortBy]) - new Date(b[sortBy]) 
        : new Date(b[sortBy]) - new Date(a[sortBy]);
    }
  });

  const handleViewDocument = (documentId) => {
    // Navigate to document details page
    navigate(`/patient/document/${documentId}`);
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

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return "📄";
    if (fileType.includes('doc')) return "📝";
    if (fileType.includes('image')) return "🖼️";
    return "📑";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your documents...</p>
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
          <span className="welcome-text">Welcome to your documents</span>
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
          activeTab="documents"
          setActiveTab={() => {}}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <div className="content-header">
            <h2>My Medical Documents</h2>
            <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div className="content-card document-controls">
            <div className="documents-actions">
              <div className="search-documents">
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="documents-filters">
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="uploadDate">Upload Date</option>
                  <option value="reportDate">Report Date</option>
                  <option value="reportName">Report Name</option>
                  <option value="category">Category</option>
                </select>

                <button 
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} 
                  className="sort-order-btn"
                >
                  {sortOrder === "asc" ? "🔼" : "🔽"}
                </button>
              </div>

              <button className="primary-btn">
                <span>➕</span> Upload New Document
              </button>
            </div>
          </div>

          <div className="content-card">
            {error && <div className="error-message">{error}</div>}
            
            {!error && filteredDocuments.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <p>No documents found</p>
                <p className="empty-subtext">
                  {searchTerm || categoryFilter !== "All" 
                    ? "Try adjusting your search or filters" 
                    : "Upload your first medical document to get started"}
                </p>
                <button className="primary-btn">Upload Document</button>
              </div>
            )}

            {filteredDocuments.length > 0 && (
              <div className="document-list">
                <div className="document-list-header">
                  <span className="col-type">Type</span>
                  <span className="col-name">Report Name</span>
                  <span className="col-category">Category</span>
                  <span className="col-date">Report Date</span>
                  <span className="col-date">Upload Date</span>
                  <span className="col-actions">Actions</span>
                </div>

                {filteredDocuments.map((doc) => (
                  <div className="document-item" key={doc._id}>
                    <div className="col-type">
                      <span className="file-icon">{getFileIcon(doc.fileType)}</span>
                    </div>
                    <div className="col-name">
                      <span className="document-name">{doc.reportName}</span>
                      <span className="document-filename">{doc.fileName}</span>
                      <span className="document-size">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="col-category">
                      <span className="category-badge">{doc.category}</span>
                    </div>
                    <div className="col-date">{formatDate(doc.reportDate)}</div>
                    <div className="col-date">{formatDate(doc.uploadDate)}</div>
                    <div className="col-actions">
                      <button 
                        className="view-btn" 
                        onClick={() => handleViewDocument(doc._id)}
                      >
                        View
                      </button>
                      <button className="download-btn">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}