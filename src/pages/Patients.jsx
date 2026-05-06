import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { Search, UserPlus, Calendar, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select(`
            id,
            nome,
            objetivos,
            objetivo_texto,
            consultas (
              data_consulta
            )
          `)
          .eq('nutricionista_id', user.id)
          .order('nome');

        if (error) throw error;

        // Process data to get the latest consultation date
        const processedPatients = data.map(p => {
          const latestConsultation = p.consultas?.length > 0 
            ? [...p.consultas].sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta))[0].data_consulta
            : null;
          
          return {
            ...p,
            lastConsultation: latestConsultation
          };
        });

        setPatients(processedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sem consulta';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout>
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Pacientes</h1>
          <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
            Gerencie seus pacientes e acompanhe o progresso.
          </p>
        </div>
        <Link to="/pacientes/novo" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', width: 'auto' }}>
          <UserPlus size={20} />
          <span className="hide-mobile">Novo Paciente</span>
          <span className="show-mobile">Novo</span>
        </Link>
      </header>

      <div className="dashboard-card" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-100)' }}>
          <div className="search-box">
            <Search size={20} color="var(--gray-600)" />
            <input 
              type="text" 
              placeholder="Buscar paciente pelo nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', padding: '0 12px', background: 'transparent', boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="patient-table-container">
          {loading ? (
            <div className="empty-message">Carregando pacientes...</div>
          ) : filteredPatients.length > 0 ? (
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="hide-mobile">Objetivo Principal</th>
                  <th className="hide-mobile">Última Consulta</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr 
                    key={patient.id} 
                    className="table-row-clickable"
                    onClick={() => navigate(`/pacientes/${patient.id}`)}
                  >
                    <td>
                      <Link to={`/pacientes/${patient.id}`} className="patient-name-link" onClick={(e) => e.stopPropagation()}>
                        {patient.nome}
                      </Link>
                    </td>
                    <td className="hide-mobile">
                      <span className="objective-badge">
                        {patient.objetivos?.[0] || patient.objetivo_texto || 'Não informado'}
                      </span>
                    </td>
                    <td className="text-gray hide-mobile">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {formatDate(patient.lastConsultation)}
                      </div>
                    </td>
                    <td>
                      <ChevronRight size={20} className="chevron-icon" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-message">
              {searchTerm ? 'Nenhum paciente encontrado com esse nome' : 'Nenhum paciente cadastrado ainda'}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
