import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <h1 className="logo-text" style={{ fontSize: '1.25rem' }}>NutriSystem</h1>
        </Link>
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar with mobile state */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={closeSidebar} />
      </div>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
