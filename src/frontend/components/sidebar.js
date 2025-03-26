import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Sidebar.css';

const Sidebar = ({ userInfo, onToggleSidebar, initialCollapsed = true, activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle sidebar expansion on hover
  useEffect(() => {
    if (isHovering && isCollapsed) {
      setIsCollapsed(false);
    } else if (!isHovering && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isHovering, isCollapsed]);

  const handleToggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggleSidebar) {
      onToggleSidebar(newCollapsedState);
    }
  };

  // Determine if the path matches the menu item
  const isActive = (tab) => {
    if (activeTab) {
      return activeTab === tab;
    }
    // Update the path mappings to match your App.js routes
    if (tab === 'details' && location.pathname === '/patient-dashboard' && activeTab === 'details') return true;
    if (tab === 'health' && location.pathname === '/patient-dashboard') return true;
    if (tab === 'history' && location.pathname === '/medical-report') return true;
    if (tab === 'health-data' && location.pathname === '/prediction') return true;
    if (tab === 'appointments' && location.pathname === '/appointments') return true;
    if (tab === 'upload-documents' && location.pathname === '/upload-documents') return true;
    if (tab === 'blogs' && location.pathname === '/Pblogs') return true;

    return false;
  };
  
  const handleMenuClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    
    // Update navigation paths to match your App.js routes
    switch(tab) {
      case 'details': navigate('/patient-dashboard'); break;
      case 'health': navigate('/patient-dashboard'); break;
      case 'history': navigate('/medical-report'); break;
      case 'health-data': navigate('/prediction'); break;
      case 'appointments': navigate('/appointments'); break;
      case 'upload-documents': navigate('/upload-documents'); break;
      case 'blogs': navigate('/Pblogs'); break;
      default: break;
    }
  };

  return (
    <aside 
      className={`sidebar ${isCollapsed && !isHovering ? "collapsed" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="toggle-button-container">
        <button className="toggle-sidebar-btn" onClick={handleToggleSidebar}>
          {isCollapsed && !isHovering ? "☰" : "✕"}
        </button>
      </div>

      <div className="profile-summary">
        <div className="avatar">{userInfo?.name?.charAt(0) || 'U'}</div>
        {(!isCollapsed || isHovering) && (
          <>
            <h3>{userInfo?.name || 'User'}</h3>
            <p className="patient-id">
              {userInfo?.email 
                ? `Patient ID: ${userInfo.email.substring(0, 8)}` 
                : 'Welcome'}
            </p>
          </>
        )}
      </div>
      
      <ul className="nav-menu">
        <li
          className={isActive('details') ? "active" : ""}
          onClick={() => handleMenuClick('details')}
        >
          <span className="menu-icon">👤</span>
          {(!isCollapsed || isHovering) && <span>Profile</span>}
        </li>
        <li
          className={isActive('health') ? "active" : ""}
          onClick={() => handleMenuClick('health')}
        >
          <span className="menu-icon">📊</span>
          {(!isCollapsed || isHovering) && <span>Health Dashboard</span>}
        </li>
        <li
          className={isActive('history') ? "active" : ""}
          onClick={() => handleMenuClick('history')}
        >
          <span className="menu-icon">📜</span>
          {(!isCollapsed || isHovering) && <span>Medical Reports</span>}
        </li>
        <li
          className={isActive('health-data') ? "active" : ""}
          onClick={() => handleMenuClick('health-data')}
        >
          <span className="menu-icon">⚕️</span>
          {(!isCollapsed || isHovering) && <span>Health Data & Predictions</span>}
        </li>
        <li
          className={isActive('appointments') ? "active" : ""}
          onClick={() => handleMenuClick('appointments')}
        >
          <span className="menu-icon">📅</span>
          {(!isCollapsed || isHovering) && <span>Appointments</span>}
        </li>
        {/* <li
          onClick={() => navigate("/upload-documents")}
        >
          <span className="menu-icon">📄</span>
          {(!isCollapsed || isHovering) && <span>Upload Documents</span>}
        </li> */}
        <li
            className={isActive('upload-documents') ? "active" : ""}
            onClick={() => handleMenuClick('upload-documents')}
        >
            <span className="menu-icon">📄</span>
            {(!isCollapsed || isHovering) && <span>Upload Documents</span>}
        </li>

        <li
          className={isActive('blogs') ? "active" : ""}
          onClick={() => handleMenuClick('blogs')}
        >
          <span className="menu-icon">📝</span>
          {(!isCollapsed || isHovering) && <span>Blogs</span>}
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;