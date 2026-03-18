import React from 'react';
import { LayoutDashboard, PieChart, Users, Settings, LogOut, Code } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <PieChart size={20} />, label: 'Analytics', active: false },
    { icon: <Users size={20} />, label: 'Team', active: false },
    { icon: <Code size={20} />, label: 'Projects', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <aside className="glass" style={{ width: '280px', margin: '1rem', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Code color="white" size={24} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Stitch</h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item, idx) => (
            <li key={idx} style={{ 
              marginBottom: '0.5rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              cursor: 'pointer',
              background: item.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: item.active ? '#3b82f6' : '#94a3b8',
              transition: 'all 0.2s'
            }}>
              {item.icon}
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ marginTop: 'auto', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: '#94a3b8' }}>
        <LogOut size={20} />
        <span style={{ fontWeight: 500 }}>Logout</span>
      </div>
    </aside>
  );
};

export default Sidebar;
