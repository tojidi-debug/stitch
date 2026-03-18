import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import ActivityTable from './components/ActivityTable';
import VisualChart from './components/VisualChart';
import { LayoutDashboard, TrendingUp, Users, DollarSign } from 'lucide-react';

const App = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at 50% 50%, #1a1c2e 0%, #0c0e14 100%)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Header />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="Total Users" value="12,543" icon={<Users />} trend="+12%" color="blue" />
          <StatCard title="Active Subscriptions" value="8,230" icon={<TrendingUp />} trend="+5.4%" color="purple" />
          <StatCard title="MRR" value="$124,500" icon={<DollarSign />} trend="+18.2%" color="blue" />
          <StatCard title="Renewal Rate" value="98.2%" icon={<LayoutDashboard />} trend="+2.1%" color="purple" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <VisualChart />
          <ActivityTable />
        </div>
      </main>
    </div>
  );
};

export default App;
