import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const ConsultationModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nova Consulta</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-full">
              <label className="form-label">Data da Consulta *</label>
              <input 
                type="date" 
                name="data_consulta" 
                value={formData.data_consulta} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Peso (kg) *</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  name="peso" 
                  value={formData.peso} 
                  onChange={handleChange} 
                  required 
                />
                <span className="unit">kg</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">% de Gordura</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  name="percentual_gordura" 
                  value={formData.percentual_gordura} 
                  onChange={handleChange} 
                />
                <span className="unit">%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cintura (cm)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  name="cintura" 
                  value={formData.cintura} 
                  onChange={handleChange} 
                />
                <span className="unit">cm</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quadril (cm)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  name="quadril" 
                  value={formData.quadril} 
                  onChange={handleChange} 
                />
                <span className="unit">cm</span>
              </div>
            </div>

            <div className="form-group col-full">
              <label className="form-label">Próximo Retorno</label>
              <input 
                type="date" 
                name="proximo_retorno" 
                value={formData.proximo_retorno} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group col-full">
              <label className="form-label">Observações</label>
              <textarea 
                name="observacoes" 
                value={formData.observacoes} 
                onChange={handleChange} 
                placeholder="Detalhes sobre a evolução, queixas, etc."
              />
            </div>
          </div>

          <div className="form-footer" style={{ marginTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', minWidth: '150px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              {loading ? 'Salvando...' : (
                <>
                  <Save size={18} />
                  Salvar Consulta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal;
