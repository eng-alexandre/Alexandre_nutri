import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import NewPatient from './pages/NewPatient';
import EditPatient from './pages/EditPatient';
import PatientProfile from './pages/PatientProfile';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#2e7d32', fontWeight: '600' }}>Carregando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Redirect if logged in */}
        <Route 
          path="/login" 
          element={session ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={session ? <Navigate to="/dashboard" /> : <Register />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/pacientes" 
          element={session ? <Patients /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/pacientes/novo" 
          element={session ? <NewPatient /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/pacientes/:id" 
          element={session ? <PatientProfile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/pacientes/:id/editar" 
          element={session ? <EditPatient /> : <Navigate to="/login" />} 
        />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
