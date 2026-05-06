import DashboardLayout from '../components/DashboardLayout';

const EditPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('pessoal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivos: [],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [],
    restricoes_alimentares: [],
    alergias: [],
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  const [imc, setImc] = useState(null);
  const [idade, setIdade] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Process times: "06:30" -> "0630"
        const processedData = {
          ...data,
          horario_acorda: data.horario_acorda ? data.horario_acorda.replace(/\D/g, '') : '',
          horario_dorme: data.horario_dorme ? data.horario_dorme.replace(/\D/g, '') : '',
          // Ensure arrays are arrays
          objetivos: data.objetivos || [],
          patologias: data.patologias || [],
          restricoes_alimentares: data.restricoes_alimentares || [],
          alergias: data.alergias || []
        };

        setFormData(processedData);
      } catch (err) {
        setError('Erro ao carregar paciente: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  // Calculate IMC
  useEffect(() => {
    if (formData.peso_inicial && formData.altura) {
      const h = formData.altura / 100;
      const result = formData.peso_inicial / (h * h);
      setImc(result.toFixed(1));
    } else {
      setImc(null);
    }
  }, [formData.peso_inicial, formData.altura]);

  // Calculate Idade
  useEffect(() => {
    if (formData.data_nascimento) {
      const birth = new Date(formData.data_nascimento);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setIdade(age);
    } else {
      setIdade(null);
    }
  }, [formData.data_nascimento]);

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

  const applyPhoneMask = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 10) {
      return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (value.length > 6) {
      return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      return value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    } else {
      return value.replace(/(\d{0,2})/, "$1");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    if (name === 'telefone' || name === 'whatsapp') {
      finalValue = applyPhoneMask(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const current = prev[name] || [];
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [name]: [...current, value] };
      }
    });
  };

  const formatTime = (val) => {
    if (!val) return '';
    let s = val.toString().padStart(4, '0');
    if (s.length > 4) s = s.substring(s.length - 4);
    return `${s.substring(0, 2)}:${s.substring(2, 4)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) {
      setError('O nome completo é obrigatório');
      setActiveTab('pessoal');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('pacientes')
        .update({
          ...formData,
          peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
          altura: formData.altura ? parseFloat(formData.altura) : null,
          refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
          litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
          horario_acorda: formatTime(formData.horario_acorda),
          horario_dorme: formatTime(formData.horario_dorme),
          data_nascimento: formData.data_nascimento || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/pacientes/${id}`);
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="empty-message">Carregando dados do paciente...</div>
      </DashboardLayout>
    );
  }

  const objetivosOptions = ['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'];
  const nivelAtividadeOptions = ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'];
  const patologiasOptions = ['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'];
  const restricoesOptions = ['Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'];
  const alergiasOptions = ['Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'];

  return (
    <DashboardLayout>
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button onClick={() => navigate(`/pacientes/${id}`)} className="btn-icon-back">
            <ArrowLeft size={20} />
          </button>
          <h1>Editar Paciente</h1>
        </div>
        <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
          Atualize as informações de <strong>{formData.nome}</strong>.
        </p>
      </header>

      {success && (
        <div className="success-message" style={{ marginBottom: '24px' }}>
          Alterações salvas com sucesso! Redirecionando...
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`} onClick={() => setActiveTab('pessoal')}>
            <User size={18} /> <span className="hide-mobile">Pessoal</span>
          </button>
          <button className={`tab-btn ${activeTab === 'clinico' ? 'active' : ''}`} onClick={() => setActiveTab('clinico')}>
            <ClipboardList size={18} /> <span className="hide-mobile">Clínico</span>
          </button>
          <button className={`tab-btn ${activeTab === 'habitos' ? 'active' : ''}`} onClick={() => setActiveTab('habitos')}>
            <Coffee size={18} /> <span className="hide-mobile">Hábitos</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tabs-content">
          {activeTab === 'pessoal' && (
            <div className="tab-pane">
              <div className="form-grid">
                <div className="form-group col-full">
                  <label className="form-label">Nome Completo *</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Nascimento</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
                    {idade !== null && <span className="age-tag hide-mobile">{idade} anos</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange} className="custom-select">
                    <option value="">Selecionar...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" />
                </div>
                <div className="form-group col-full">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinico' && (
            <div className="tab-pane">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Peso Atual (kg)</label>
                  <div className="input-with-unit">
                    <input type="number" step="0.1" name="peso_inicial" value={formData.peso_inicial} onChange={handleChange} />
                    <span className="unit">kg</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Altura (cm)</label>
                  <div className="input-with-unit">
                    <input type="number" name="altura" value={formData.altura} onChange={handleChange} />
                    <span className="unit">cm</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">IMC</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input value={imc || ''} readOnly style={{ background: '#f1f5f9', cursor: 'not-allowed', width: '80px' }} />
                    {imc && (
                      <span className="imc-badge" style={{ backgroundColor: getImcClassification(imc).color, fontSize: '0.7rem' }}>
                        {getImcClassification(imc).label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nível de Atividade</label>
                  <select name="nivel_atividade" value={formData.nivel_atividade} onChange={handleChange} className="custom-select">
                    <option value="">Selecionar...</option>
                    {nivelAtividadeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="form-group col-full">
                  <label className="form-label">Objetivos</label>
                  <div className="checkbox-group">
                    {objetivosOptions.map(opt => (
                      <label key={opt} className="checkbox-item">
                        <input type="checkbox" checked={formData.objetivos.includes(opt)} onChange={() => handleMultiSelect('objetivos', opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <textarea name="objetivo_texto" value={formData.objetivo_texto} onChange={handleChange} placeholder="Outros objetivos ou detalhes..." style={{ marginTop: '12px' }} />
                </div>

                <div className="form-group col-full">
                  <label className="form-label">Patologias</label>
                  <div className="checkbox-group">
                    {patologiasOptions.map(opt => (
                      <label key={opt} className="checkbox-item">
                        <input type="checkbox" checked={formData.patologias.includes(opt)} onChange={() => handleMultiSelect('patologias', opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group col-full">
                  <label className="form-label">Restrições Alimentares</label>
                  <div className="checkbox-group">
                    {restricoesOptions.map(opt => (
                      <label key={opt} className="checkbox-item">
                        <input type="checkbox" checked={formData.restricoes_alimentares.includes(opt)} onChange={() => handleMultiSelect('restricoes_alimentares', opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group col-full">
                  <label className="form-label">Alergias</label>
                  <div className="checkbox-group">
                    {alergiasOptions.map(opt => (
                      <label key={opt} className="checkbox-item">
                        <input type="checkbox" checked={formData.alergias.includes(opt)} onChange={() => handleMultiSelect('alergias', opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Medicamentos Contínuos</label>
                  <textarea name="medicamentos" value={formData.medicamentos} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Suplementos</label>
                  <textarea name="suplementos" value={formData.suplementos} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'habitos' && (
            <div className="tab-pane">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Refeições por dia</label>
                  <input type="number" name="refeicoes_por_dia" value={formData.refeicoes_por_dia} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantidade de Água (L/dia)</label>
                  <div className="input-with-unit">
                    <input type="number" step="0.1" name="litros_agua" value={formData.litros_agua} onChange={handleChange} />
                    <span className="unit">litros</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Horário que acorda</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="number" name="horario_acorda" value={formData.horario_acorda} onChange={handleChange} placeholder="Ex: 630" />
                    <span className="time-preview hide-mobile">{formatTime(formData.horario_acorda)}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Horário que dorme</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="number" name="horario_dorme" value={formData.horario_dorme} onChange={handleChange} placeholder="Ex: 2230" />
                    <span className="time-preview hide-mobile">{formatTime(formData.horario_dorme)}</span>
                  </div>
                </div>
                <div className="form-group col-full">
                  <div className="checkbox-item" style={{ marginBottom: '12px' }}>
                    <input type="checkbox" name="atividade_fisica" checked={formData.atividade_fisica} onChange={handleChange} id="check-atividade" />
                    <label htmlFor="check-atividade" style={{ fontWeight: 600 }}>Pratica atividade física?</label>
                  </div>
                  {formData.atividade_fisica && (
                    <textarea name="atividade_fisica_descricao" value={formData.atividade_fisica_descricao} onChange={handleChange} placeholder="Qual atividade e frequência semanal?" />
                  )}
                </div>
                <div className="form-group col-full">
                  <label className="form-label">Observações Gerais</label>
                  <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          <div className="form-footer">
            {activeTab === 'pessoal' ? (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate(`/pacientes/${id}`)}
                disabled={saving}
              >
                Cancelar
              </button>
            ) : (
              <button 
                key="back-btn"
                type="button" 
                className="btn-secondary" 
                onClick={(e) => {
                  e.preventDefault();
                  if (activeTab === 'habitos') setActiveTab('clinico');
                  else if (activeTab === 'clinico') setActiveTab('pessoal');
                }}
                disabled={saving}
              >
                Voltar
              </button>
            )}

            {activeTab !== 'habitos' ? (
              <button 
                key="next-btn"
                type="button" 
                className="btn-primary" 
                onClick={(e) => {
                  e.preventDefault();
                  if (activeTab === 'pessoal') {
                    if (!formData.nome) {
                      setError('O nome completo é obrigatório');
                      return;
                    }
                    setActiveTab('clinico');
                  }
                  else if (activeTab === 'clinico') setActiveTab('habitos');
                  setError(null);
                  window.scrollTo(0, 0);
                }}
                style={{ width: 'auto', minWidth: '120px' }}
              >
                Próximo
              </button>
            ) : (
              <button 
                key="save-btn"
                type="submit" 
                className="btn-primary" 
                disabled={saving}
                style={{ width: 'auto', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
              >
                {saving ? 'Salvando...' : (
                  <>
                    <Save size={18} />
                    Salvar
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditPatient;
