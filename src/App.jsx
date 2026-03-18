import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Search, 
  Bell, 
  LogOut, 
  Code,
  PieChart,
  Settings,
  MoreVertical
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

/**
 * [DEBUG] 애플리케이션 진입 로그
 */
console.log("Stitch Dashboard App Initializing...");

const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const App = () => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#0c0e14', 
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      overflow: 'hidden' 
    }}>
      {/* Sidebar */}
      <aside className="glass" style={{ width: '280px', margin: '1rem', display: 'flex', flexDirection: 'column', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code color="white" size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Stitch</h2>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
            { icon: <PieChart size={20} />, label: 'Analytics' },
            { icon: <Users size={20} />, label: 'Team' },
            { icon: <Settings size={20} />, label: 'Settings' },
          ].map((item, idx) => (
            <div key={idx} style={{ 
              marginBottom: '0.5rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              cursor: 'pointer',
              background: item.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: item.active ? '#3b82f6' : '#94a3b8'
            }}>
              {item.icon}
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard Overview</h1>
            <p style={{ color: '#94a3b8' }}>Welcome back to your workspace.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search..." style={{ background: 'none', border: 'none', color: 'white', outline: 'none' }} />
            </div>
          </div>
        </header>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { title: 'Total Revenue', value: '$124,500', icon: <DollarSign />, color: '#3b82f6' },
            { title: 'Active Users', value: '12,543', icon: <Users />, color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ color: stat.color, marginBottom: '1rem' }}>{stat.icon}</div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{stat.title}</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Growth Analytics</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default App;
