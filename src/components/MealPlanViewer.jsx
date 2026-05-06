import React from 'react';

const MealPlanViewer = ({ plan }) => {
  if (!plan || !plan.plano_semanal) {
    return <div className="empty-message">Formato de plano inválido.</div>;
  }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '20px' }}>
      {plan.plano_semanal.map((dia, diaIndex) => (
        <div key={diaIndex} style={{ border: '1px solid var(--gray-200)', borderRadius: '8px', padding: 'min(20px, 4vw)', background: '#fafafa' }}>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '16px', fontSize: 'min(1.1rem, 5vw)', borderBottom: '2px solid var(--gray-200)', paddingBottom: '8px' }}>
            {dia.dia}
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
            {Object.entries(dia.refeicoes).map(([key, opcoes]) => (
              <div key={key} style={{ background: '#fff', padding: '16px', borderRadius: '6px', border: '1px solid var(--gray-100)' }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: 'var(--gray-800)', fontSize: '0.9rem' }}>
                  {formatRefeicaoName(key)}
                </strong>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0, color: 'var(--gray-600)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {opcoes.map((opcao, opcaoIndex) => (
                    opcao ? <li key={opcaoIndex}>{opcao}</li> : null
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealPlanViewer;
