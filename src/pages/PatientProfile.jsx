import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import WeightChart from '../components/WeightChart';
import ConsultationModal from '../components/ConsultationModal';
import { 
  ArrowLeft, User, ClipboardList, Coffee, 
  Plus, Calendar, Activity, Utensils, 
  Save, CheckCircle, TrendingUp, History 
} from 'lucide-react';
import MealPlanGenerator from '../components/MealPlanGenerator';
import MealPlanViewer from '../components/MealPlanViewer';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pessoal');
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [generatingMealPlan, setGeneratingMealPlan] = useState(false);
  const [viewingPlan, setViewingPlan] = useState(null);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch Patient
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      if (patientError) throw patientError;
      setPatient(patientData);
      setFormData(patientData);

      // Fetch Consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });
      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData);

      // Fetch Meal Plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });
      if (mealPlansError) throw mealPlansError;
      setMealPlans(mealPlansData);

    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    if (name === 'telefone' || name === 'whatsapp') {
      finalValue = applyPhoneMask(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleMultiSelect = (name, value) => {
    const current = formData[name] || [];
    const updated = current.includes(value) 
      ? current.filter(i => i !== value) 
      : [...current, value];
    setFormData(prev => ({ ...prev, [name]: updated }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('pacientes')
        .update({
          ...formData,
          peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
          altura: formData.altura ? parseFloat(formData.altura) : null,
          refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
          litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
        })
        .eq('id', id);

      if (error) throw error;
      
      setSuccess(true);
      setPatient(formData);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Erro ao salvar alterações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConsultation = async (consultationData) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('consultas')
        .insert([{
          ...consultationData,
          paciente_id: id,
          peso: parseFloat(consultationData.peso),
          cintura: consultationData.cintura ? parseFloat(consultationData.cintura) : null,
          quadril: consultationData.quadril ? parseFloat(consultationData.quadril) : null,
          percentual_gordura: consultationData.percentual_gordura ? parseFloat(consultationData.percentual_gordura) : null,
        }]);

      if (error) throw error;
      
      setModalOpen(false);
      fetchPatientData(); // Refresh list and chart
    } catch (error) {
      alert('Erro ao salvar consulta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper functions (same as NewPatient)
  const applyPhoneMask = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 10) return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (value.length > 6) return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (value.length > 2) return value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    else return value.replace(/(\d{0,2})/, "$1");
  };

  const calculateIMC = () => {
    if (formData.peso_inicial && formData.altura) {
      const h = formData.altura / 100;
      return (formData.peso_inicial / (h * h)).toFixed(1);
    }
    return null;
  };

  const getImcClassification = (val) => {
    if (!val) return null;
    const n = parseFloat(val);
    if (n < 18.5) return { label: 'Abaixo do peso', color: '#0ea5e9' };
    if (n < 25) return { label: 'Peso normal', color: '#22c55e' };
    if (n < 30) return { label: 'Sobrepeso', color: '#f59e0b' };
    if (n < 35) return { label: 'Obesidade grau I', color: '#ef4444' };
    if (n < 40) return { label: 'Obesidade grau II', color: '#b91c1c' };
    return { label: 'Obesidade grau III', color: '#7f1d1d' };
  };

  const imc = calculateIMC();
  const imcClass = getImcClassification(imc);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="empty-message">Carregando perfil do paciente...</div>
        </main>
      </div>
    );
  }

  const objetivosOptions = ['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'];
  const nivelAtividadeOptions = ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'];
  const patologiasOptions = ['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'];
  const restricoesOptions = ['Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'];
  const alergiasOptions = ['Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'];

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
              Gerencie os dados, consultas e planos alimentares.
            </p>
          </div>
          <button 
            onClick={handleSaveChanges} 
            className="btn-primary" 
            disabled={saving}
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {saving ? 'Salvando...' : (
              <>
                <Save size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </header>

        {success && (
          <div className="success-message" style={{ marginBottom: '24px' }}>
            <CheckCircle size={18} />
            Alterações salvas com sucesso!
          </div>
        )}

        {/* Section 1: Dados do Paciente */}
        <section className="profile-section">
          <h2 className="profile-section-title">
            <User size={24} />
            Dados do Paciente
          </h2>
          <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="tabs-header">
              <button className={`tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`} onClick={() => setActiveTab('pessoal')}>
                <User size={18} /> Pessoal
              </button>
              <button className={`tab-btn ${activeTab === 'clinico' ? 'active' : ''}`} onClick={() => setActiveTab('clinico')}>
                <ClipboardList size={18} /> Clínico
              </button>
              <button className={`tab-btn ${activeTab === 'habitos' ? 'active' : ''}`} onClick={() => setActiveTab('habitos')}>
                <Coffee size={18} /> Hábitos
              </button>
            </div>

            <div className="tabs-content">
              {activeTab === 'pessoal' && (
                <div className="form-grid">
                  <div className="form-group col-full">
                    <label className="form-label">Nome Completo</label>
                    <input name="nome" value={formData.nome || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data de Nascimento</label>
                    <input type="date" name="data_nascimento" value={formData.data_nascimento || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sexo</label>
                    <select name="sexo" value={formData.sexo || ''} onChange={handleChange} className="custom-select">
                      <option value="">Selecionar...</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input name="telefone" value={formData.telefone || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group col-full">
                    <label className="form-label">Email</label>
                    <input name="email" value={formData.email || ''} onChange={handleChange} />
                  </div>
                </div>
              )}

              {activeTab === 'clinico' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Peso Inicial (kg)</label>
                    <input type="number" step="0.1" name="peso_inicial" value={formData.peso_inicial || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Altura (cm)</label>
                    <input type="number" name="altura" value={formData.altura || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IMC</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input value={imc || ''} readOnly style={{ background: '#f8fafc', width: '80px' }} />
                      {imcClass && <span className="imc-badge" style={{ backgroundColor: imcClass.color }}>{imcClass.label}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nível de Atividade</label>
                    <select name="nivel_atividade" value={formData.nivel_atividade || ''} onChange={handleChange} className="custom-select">
                      <option value="">Selecionar...</option>
                      {nivelAtividadeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="form-group col-full">
                    <label className="form-label">Objetivos</label>
                    <div className="checkbox-group">
                      {objetivosOptions.map(opt => (
                        <label key={opt} className="checkbox-item">
                          <input type="checkbox" checked={formData.objetivos?.includes(opt)} onChange={() => handleMultiSelect('objetivos', opt)} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group col-full">
                    <label className="form-label">Patologias</label>
                    <div className="checkbox-group">
                      {patologiasOptions.map(opt => (
                        <label key={opt} className="checkbox-item">
                          <input type="checkbox" checked={formData.patologias?.includes(opt)} onChange={() => handleMultiSelect('patologias', opt)} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'habitos' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Refeições por dia</label>
                    <input type="number" name="refeicoes_por_dia" value={formData.refeicoes_por_dia || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Água (L/dia)</label>
                    <input type="number" step="0.1" name="litros_agua" value={formData.litros_agua || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group col-full">
                    <label className="form-label">Observações</label>
                    <textarea name="observacoes" value={formData.observacoes || ''} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Consultas */}
        <section className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="profile-section-title" style={{ marginBottom: 0 }}>
              <TrendingUp size={24} />
              Consultas e Evolução
            </h2>
            <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setModalOpen(true)}>
              <Plus size={18} /> Nova Consulta
            </button>
          </div>

          <div className="profile-grid">
            <div className="dashboard-card">
              <span className="card-title">Evolução de Peso</span>
              <WeightChart data={consultations} />
            </div>

            <div className="consultations-list">
              {consultations.length > 0 ? (
                consultations.map(c => (
                  <div key={c.id} className="consultation-card">
                    <div className="consultation-header">
                      <div>
                        <span className="consultation-date">
                          {new Date(c.data_consulta).toLocaleDateString('pt-BR')}
                        </span>
                        {c.proximo_retorno && (
                          <div className="next-return-badge" style={{ marginLeft: '12px' }}>
                            <Calendar size={14} />
                            Retorno: {new Date(c.proximo_retorno).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="consultation-stats">
                      <div className="stat-item">
                        <span className="stat-label">Peso</span>
                        <span className="stat-value">{c.peso} kg</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Gordura</span>
                        <span className="stat-value">{c.percentual_gordura ? `${c.percentual_gordura}%` : '--'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Cintura</span>
                        <span className="stat-value">{c.cintura ? `${c.cintura} cm` : '--'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Quadril</span>
                        <span className="stat-value">{c.quadril ? `${c.quadril} cm` : '--'}</span>
                      </div>
                    </div>
                    {c.observacoes && (
                      <div className="consultation-obs">
                        <strong>Observações:</strong> {c.observacoes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-message">Nenhuma consulta registrada ainda</div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Planos Alimentares */}
        <section className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="profile-section-title" style={{ marginBottom: 0 }}>
              <Utensils size={24} />
              Planos Alimentares
            </h2>
            {!generatingMealPlan && !viewingPlan && (
              <button 
                className="btn-primary" 
                style={{ width: 'auto' }}
                onClick={() => setGeneratingMealPlan(true)}
              >
                Gerar Plano Alimentar
              </button>
            )}
          </div>

          {generatingMealPlan ? (
            <MealPlanGenerator 
              patient={patient} 
              onSaveComplete={() => {
                setGeneratingMealPlan(false);
                fetchPatientData(); // Refresh history
              }} 
              onCancel={() => setGeneratingMealPlan(false)} 
            />
          ) : viewingPlan ? (
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Visualizando Plano Alimentar</h3>
                <button className="btn-secondary" onClick={() => setViewingPlan(null)} style={{ width: 'auto' }}>
                  Voltar ao Histórico
                </button>
              </div>
              <MealPlanViewer plan={viewingPlan.conteudo} />
            </div>
          ) : (
            <div className="meal-plans-list">
              {mealPlans.length > 0 ? (
                mealPlans.map(plan => (
                  <div key={plan.id} className="meal-plan-card" style={{ cursor: 'pointer' }} onClick={() => setViewingPlan(plan)}>
                    <span className="meal-plan-date">
                      Gerado em: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="meal-plan-title">Plano Alimentar #{plan.id.substring(0, 5)}</span>
                  </div>
                ))
              ) : (
                <div className="empty-message" style={{ gridColumn: 'span 3' }}>
                  Nenhum plano alimentar gerado ainda
                </div>
              )}
            </div>
          )}
        </section>

        <ConsultationModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onSave={handleSaveConsultation} 
          loading={saving}
        />
      </main>
    </div>
  );
};

export default PatientProfile;
