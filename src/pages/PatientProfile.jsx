import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, User, Calendar, Target, Activity, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="empty-message">Carregando perfil...</div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="error-message">Paciente não encontrado.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <button onClick={() => navigate('/pacientes')} className="btn-icon-back">
                <ArrowLeft size={20} />
              </button>
              <h1>{patient.nome}</h1>
            </div>
            <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
              Perfil completo do paciente.
            </p>
          </div>
          <Link to={`/pacientes/${id}/editar`} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Edit2 size={18} />
            Editar Perfil
          </Link>
        </header>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon"><User size={24} /></div>
              <div className="card-title-group">
                <span className="card-title">Informações Pessoais</span>
              </div>
            </div>
            <div className="card-content">
              <p><strong>Email:</strong> {patient.email || 'Não informado'}</p>
              <p><strong>Telefone:</strong> {patient.telefone || 'Não informado'}</p>
              <p><strong>Sexo:</strong> {patient.sexo || 'Não informado'}</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon"><Target size={24} /></div>
              <div className="card-title-group">
                <span className="card-title">Objetivos</span>
              </div>
            </div>
            <div className="card-content">
              <div className="checkbox-group">
                {patient.objetivos?.map(obj => (
                  <span key={obj} className="objective-badge">{obj}</span>
                )) || 'Nenhum objetivo selecionado'}
              </div>
              {patient.objetivo_texto && <p style={{ marginTop: '12px' }}>{patient.objetivo_texto}</p>}
            </div>
          </div>

          <div className="dashboard-card" style={{ gridColumn: 'span 1' }}>
            <div className="card-header">
              <div className="card-icon"><Activity size={24} /></div>
              <div className="card-title-group">
                <span className="card-title">Status Clínico</span>
              </div>
            </div>
            <div className="card-content">
              <p><strong>Peso Inicial:</strong> {patient.peso_inicial ? `${patient.peso_inicial} kg` : 'N/A'}</p>
              <p><strong>Altura:</strong> {patient.altura ? `${patient.altura} cm` : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ marginTop: '24px' }}>
          <div className="empty-message">
            Histórico de consultas e planos alimentares em desenvolvimento.
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
