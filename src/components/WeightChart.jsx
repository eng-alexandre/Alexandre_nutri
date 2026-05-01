import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const WeightChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-message" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Nenhuma consulta registrada ainda
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));

  const chartData = sortedData.map(c => ({
    date: new Date(c.data_consulta).toLocaleDateString('pt-BR'),
    weight: parseFloat(c.peso)
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            unit="kg"
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            name="Peso"
            stroke="#2e7d32"
            strokeWidth={3}
            dot={{ r: 6, fill: '#2e7d32', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
