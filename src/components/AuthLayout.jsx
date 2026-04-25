import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">NutriSystem</span>
        </div>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
