import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import DashboardCard from '../components/DashboardCard';
import { Users, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    weekConsultations: 0,
    noReturnPatients: []
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      try {
        // Check if nutritionist profile exists, if not, create it (self-healing)
        const { data: profile, error: profileError } = await supabase
          .from('nutricionistas')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError && (profileError.code === 'PGRST116' || !profile)) { // Record not found
          await supabase
            .from('nutricionistas')
            .insert([{
              id: user.id,
              nome: user.user_metadata.full_name || 'Nutricionista',
              email: user.email
            }]);
        }

        // 1. Total active patients
        const { count: totalPatients } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('nutricionista_id', user.id);

        // 2. Consultations of the week
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        endOfWeek.setHours(23, 59, 59, 999);

        const { count: weekConsultations } = await supabase
          .from('consultas')
          .select('*, pacientes!inner(nutricionista_id)', { count: 'exact', head: true })
          .eq('pacientes.nutricionista_id', user.id)
          .gte('data_consulta', startOfWeek.toISOString().split('T')[0])
          .lte('data_consulta', endOfWeek.toISOString().split('T')[0]);

        // 3. Patients without return
        const { data: patientsData } = await supabase
          .from('pacientes')
          .select(`
            id,
            nome,
            consultas (
              data_consulta,
              proximo_retorno
            )
          `)
          .eq('nutricionista_id', user.id);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const todayStr = new Date().toISOString().split('T')[0];

        const noReturn = patientsData?.filter(patient => {
          if (!patient.consultas || patient.consultas.length === 0) return false;
          
          const sortedConsultas = [...patient.consultas].sort((a, b) => 
            new Date(b.data_consulta) - new Date(a.data_consulta)
          );
          
          const latest = sortedConsultas[0];
          const lastDate = new Date(latest.data_consulta);
          const isOld = lastDate < thirtyDaysAgo;
          const hasFutureReturn = patient.consultas.some(c => 
            c.proximo_retorno && c.proximo_retorno >= todayStr
          );

          return isOld && !hasFutureReturn;
        }) || [];

        setStats({
          totalPatients: totalPatients || 0,
          weekConsultations: weekConsultations || 0,
          noReturnPatients: noReturn
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="empty-message">Carregando dados...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <header className="dashboard-header">
        <h1>Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Nutricionista'}!</h1>
        <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
          Aqui está o resumo dos seus atendimentos.
        </p>
      </header>

      <div className="dashboard-grid">
        <DashboardCard 
          title="Total de Pacientes" 
          value={stats.totalPatients} 
          icon={Users}
        />
        
        <DashboardCard 
          title="Consultas da Semana" 
          value={stats.weekConsultations} 
          icon={Calendar}
        />

        <DashboardCard 
          title="Pacientes sem Retorno" 
          icon={AlertCircle}
        >
          {stats.noReturnPatients.length > 0 ? (
            <ul className="patient-list">
              {stats.noReturnPatients.map(patient => (
                <li key={patient.id}>
                  <Link to={`/pacientes/${patient.id}`} className="patient-item">
                    {patient.nome}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-message">
              Nenhum paciente sem retorno no momento
            </div>
          )}
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
