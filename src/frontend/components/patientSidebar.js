import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/PatientSidebar.css';

const Sidebar = ({ userInfo, onToggleSidebar, initialCollapsed = true, activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle sidebar expansion on hover
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse on smaller screens
      if (window.innerWidth < 1024 && !isCollapsed) {
        setIsCollapsed(true);
        if (onToggleSidebar) onToggleSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    
    if (isHovering && isCollapsed && window.innerWidth >= 1024) {
      setIsCollapsed(false);
    } else if (!isHovering && !isCollapsed && initialCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 300); // Delay collapse for better UX
      return () => clearTimeout(timer);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isHovering, isCollapsed, initialCollapsed, onToggleSidebar]);

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

  // Replace emoji icons with better icon representation (you could use a library like react-icons in a real project)
  const getMenuIcon = (tab) => {
    switch(tab) {
      case 'details': return '👤';
      case 'health': return '📊';
      case 'history': return '📜';
      case 'health-data': return '⚕️';
      case 'appointments': return '📅';
      case 'upload-documents': return '📄';
      case 'blogs': return '📝';
      default: return '•';
    }
  };

  return (
    <aside 
      className={`sidebar ${isCollapsed && !isHovering ? "collapsed" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="toggle-button-container">
        <button className="toggle-sidebar-btn" onClick={handleToggleSidebar} aria-label="Toggle sidebar">
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
                ? `ID: ${userInfo.email.substring(0, 8)}` 
                : 'Welcome'}
            </p>
          </>
        )}
      </div>
      
      <ul className="nav-menu">
        {[
          { id: 'details', label: 'Profile' },
          { id: 'health', label: 'Health Dashboard' },
          { id: 'history', label: 'Medical Reports' },
          { id: 'health-data', label: 'Health Data & Predictions' },
          { id: 'appointments', label: 'Appointments' },
          { id: 'upload-documents', label: 'Upload Documents' },
          { id: 'blogs', label: 'Blogs' }
        ].map(item => (
          <li
            key={item.id}
            className={isActive(item.id) ? "active" : ""}
            onClick={() => handleMenuClick(item.id)}
          >
            <span className="menu-icon">{getMenuIcon(item.id)}</span>
            {(!isCollapsed || isHovering) && <span>{item.label}</span>}
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        {(!isCollapsed || isHovering) && (
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              © 2025 Health Dashboard
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;