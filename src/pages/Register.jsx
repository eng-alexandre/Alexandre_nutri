import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up user in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Save user data to 'nutricionistas' table
        const { error: dbError } = await supabase
          .from('nutricionistas')
          .insert([
            { 
              id: data.user.id, 
              nome: formData.fullName, 
              email: formData.email 
            }
          ]);

        if (dbError) throw dbError;
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Erro ao criar conta. Verifique os dados ou tente outro email.');
      console.error('Registration error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Criar sua conta" 
      subtitle="Junte-se à maior plataforma para nutricionistas"
    >
      <form onSubmit={handleRegister}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label className="form-label">Nome Completo</label>
          <input 
            type="text" 
            name="fullName"
            placeholder="Seu nome aqui" 
            value={formData.fullName}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            name="email"
            placeholder="seu@email.com" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Senha</label>
          <input 
            type="password" 
            name="password"
            placeholder="Mínimo 6 caracteres" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirmar Senha</label>
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="Repita sua senha" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required 
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>

        <div className="auth-link">
          Já tem conta? <Link to="/login">Faça login</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
