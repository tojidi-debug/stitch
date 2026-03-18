import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard Overview</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Welcome back, check your project status.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search..." style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: '200px' }} />
        </div>
        
        <div className="glass" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Bell size={20} />
          <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '10px', right: '10px', border: '2px solid #0c0e14' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tojidi Debug</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pro Account</p>
          </div>
          <div className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=tojidi" alt="Avatar" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
