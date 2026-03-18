import React from 'react';

const ActivityTable = () => {
  const activities = [
    { user: 'Sarah Miller', action: 'Created project', time: '2h ago', status: 'completed' },
    { user: 'James Wilson', action: 'Updated UI Kits', time: '5h ago', status: 'pending' },
    { user: 'Tech Team', action: 'Server migration', time: '1d ago', status: 'failed' },
    { user: 'Anna Brown', action: 'Added members', time: '2d ago', status: 'completed' },
  ];

  return (
    <div className="glass" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Activity</h3>
        <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>View All</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activities.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b' }}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user}`} alt="User" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.user}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.action}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.time}</p>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                color: item.status === 'completed' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#ef4444'
              }}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTable;
