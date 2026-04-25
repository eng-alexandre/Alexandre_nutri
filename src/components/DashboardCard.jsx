import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, children }) => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-icon">
          {Icon && <Icon size={24} />}
        </div>
        <div className="card-title-group">
          <span className="card-title">{title}</span>
          {value !== undefined && <h3 className="card-value">{value}</h3>}
        </div>
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
