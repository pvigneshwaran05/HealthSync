import React, { useState } from 'react';
import { 
  HomeIcon, 
  UserIcon, 
  ClipboardListIcon, 
  CalendarIcon, 
  FileTextIcon, 
  MessageSquareIcon, 
  SettingsIcon 
} from 'lucide-react';
import '../../styles/DoctorSidebar.css';

export default function Sidebar({ 
  userInfo, 
  onToggleSidebar, 
  initialCollapsed = true, 
  activeTab, 
  setActiveTab 
}) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggleSidebar(newState);
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return '👨‍⚕️';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const sidebarNavItems = [
    { 
      icon: <HomeIcon size={20} />, 
      label: 'Dashboard', 
      tab: 'dashboard' 
    },
    { 
      icon: <UserIcon size={20} />, 
      label: 'Profile', 
      tab: 'profile' 
    },
    { 
      icon: <ClipboardListIcon size={20} />, 
      label: 'Patients', 
      tab: 'patients' 
    },
    { 
      icon: <CalendarIcon size={20} />, 
      label: 'Appointments', 
      tab: 'appointments' 
    },
    { 
      icon: <FileTextIcon size={20} />, 
      label: 'Medical Blogs', 
      tab: 'blogs' 
    },
    { 
      icon: <MessageSquareIcon size={20} />, 
      label: 'Consultations', 
      tab: 'consultations' 
    },
    { 
      icon: <SettingsIcon size={20} />, 
      label: 'Settings', 
      tab: 'settings' 
    }
  ];

  return (
    <div className={`doctor-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? '▶' : '◀'}
      </div>

      <div className="profile-summary">
        <div className="avatar">
          {getInitials(userInfo.name)}
        </div>
        {!isCollapsed && (
          <div className="profile-details">
            <h3 className="truncate">{userInfo.name}</h3>
            <p className="specialty truncate">{userInfo.specialization}</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul>
          {sidebarNavItems.map((item) => (
            <li 
              key={item.tab}
              className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
              onClick={() => setActiveTab(item.tab)}
            >
              {item.icon}
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <p className="truncate">MediCare Pro</p>
          <small className="truncate">© 2024 Healthcare Solutions</small>
        </div>
      )}
    </div>
  );
}