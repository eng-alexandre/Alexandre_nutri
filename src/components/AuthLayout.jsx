import React from 'react';

import healthyFood from '../assets/healthy-food.png';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-card-wrapper" style={{ 
        display: 'flex', 
        background: 'white', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '1000px',
        minHeight: '600px'
      }}>
        {/* Lado Esquerdo - Imagem */}
        <div style={{ 
          flex: '1.2', 
          position: 'relative',
          display: 'none',
          '@media (min-width: 900px)': { display: 'block' } // Note: Inline styles don't support media queries easily, but I'll use a class or just keep it simple
        }} className="auth-image-panel">
          <img 
            src={healthyFood} 
            alt="Healthy Food" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(rgba(46, 125, 50, 0.2), rgba(46, 125, 50, 0.6))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '40px',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>Saúde em primeiro lugar.</h2>
            <p style={{ fontSize: '1.1rem', opacity: '0.9', maxWidth: '400px' }}>
              Gestão inteligente para nutricionistas que buscam excelência e resultados para seus pacientes.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div style={{ 
          flex: '1', 
          padding: '40px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          background: 'white'
        }}>
          <div className="logo-container" style={{ textAlign: 'left', marginBottom: '40px' }}>
            <span className="logo-text">NutriSystem</span>
          </div>
          <h1 className="auth-title" style={{ textAlign: 'left', fontSize: '1.875rem' }}>{title}</h1>
          {subtitle && <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: '32px' }}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
