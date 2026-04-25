import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.');
      console.error('Login error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Bem-vindo de volta" 
      subtitle="Acesse sua conta para gerenciar seus pacientes"
    >
      <form onSubmit={handleLogin}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Senha</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="auth-link">
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
