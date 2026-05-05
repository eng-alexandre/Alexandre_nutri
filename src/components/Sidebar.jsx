import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

import healthyFood from '../assets/healthy-food.png';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Pacientes', path: '/pacientes', icon: Users },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo-text">NutriSystem</h1>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px', marginTop: 'auto' }}>
        <div style={{ 
          borderRadius: '12px', 
          overflow: 'hidden', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid var(--gray-200)',
          position: 'relative',
          aspectRatio: '16/9'
        }}>
          <img 
            src={healthyFood} 
            alt="Alimentos Saudáveis" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Vida Saudável
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
