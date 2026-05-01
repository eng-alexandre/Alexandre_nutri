import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Save, X, Edit2, AlertCircle } from 'lucide-react';

const MealPlanGenerator = ({ patient, onSaveComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gerar-plano', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = errData.details 
          ? `${errData.error} Detalhes: ${errData.details}`
          : (errData.error || 'Erro ao gerar o plano.');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.plano_semanal) {
        throw new Error('Formato de resposta inválido da IA.');
      }

      setPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMealChange = (diaIndex, refeicaoKey, opcaoIndex, value) => {
    const newPlan = { ...plan };
    newPlan.plano_semanal[diaIndex].refeicoes[refeicaoKey][opcaoIndex] = value;
    setPlan(newPlan);
  };

  const savePlan = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('planos_alimentares')
        .insert([{
          paciente_id: patient.id,
          conteudo: plan
        }]);

      if (dbError) throw dbError;
      
      onSaveComplete();
    } catch (err) {
      setError('Erro ao salvar no banco de dados: ' + err.message);
      setSaving(false);
    }
  };

  const formatRefeicaoName = (key) => {
    const map = {
      'cafe_da_manha': 'Café da Manhã',
      'lanche_manha': 'Lanche da Manhã',
      'almoco': 'Almoço',
      'lanche_tarde': 'Lanche da Tarde',
      'jantar': 'Jantar'
    };
    return map[key] || key;
  };

  if (!plan) {
    return (
      <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Sparkles size={48} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
        <h3>Gerador de Plano Alimentar IA</h3>
        <p className="text-gray" style={{ marginBottom: '24px' }}>
          Gere um plano alimentar personalizado baseado no perfil, objetivos e restrições do paciente.
        </p>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '20px', textAlign: 'left' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={onCancel} style={{ width: 'auto' }}>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={generatePlan} 
            disabled={loading}
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? 'Analisando perfil e gerando...' : (
              <>
                <Sparkles size={18} />
                Gerar com Inteligência Artificial
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit2 size={20} />
          Revisar e Editar Plano Gerado
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={onCancel} disabled={saving} style={{ width: 'auto' }}>
            Descartar
          </button>
          <button className="btn-primary" onClick={savePlan} disabled={saving} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar Plano Definitivo'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {plan.plano_semanal.map((dia, diaIndex) => (
          <div key={diaIndex} style={{ border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '20px', background: '#fafafa' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '16px', fontSize: '18px', borderBottom: '2px solid var(--gray-200)', paddingBottom: '8px' }}>
              {dia.dia}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {Object.entries(dia.refeicoes).map(([key, opcoes]) => (
                <div key={key} style={{ background: '#fff', padding: '16px', borderRadius: '6px', border: '1px solid var(--gray-100)' }}>
                  <strong style={{ display: 'block', marginBottom: '12px', color: 'var(--gray-800)' }}>
                    {formatRefeicaoName(key)}
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {opcoes.map((opcao, opcaoIndex) => (
                      <div key={opcaoIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--gray-400)', fontSize: '12px', width: '20px' }}>{opcaoIndex + 1}.</span>
                        <input
                          type="text"
                          value={opcao}
                          onChange={(e) => handleMealChange(diaIndex, key, opcaoIndex, e.target.value)}
                          style={{ padding: '8px', border: '1px solid var(--gray-200)', borderRadius: '4px', flex: 1, fontSize: '13px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanGenerator;
