import React from 'react';

const StatCard = ({ title, value, icon, trend, color }) => {
  const accentColor = color === 'blue' ? '#3b82f6' : '#8b5cf6';
  
  return (
    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${accentColor}20`, color: accentColor }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', background: '#10b98120', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
          {trend}
        </span>
      </div>
      <div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{title}</p>
        <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
