import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Phone, Users, Activity, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL + '/admin';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'phone': return <Phone size={20} />;
      case 'users': return <Users size={20} />;
      case 'activity': return <Activity size={20} />;
      case 'clock': return <Clock size={20} />;
      default: return <Activity size={20} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} className="spin" color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <p style={{ opacity: 0.5 }}>Loading Sarah's Performance Data...</p>
        </div>
      </div>
    );
  }

  // Fallback to empty states if data is missing
  const stats = dashboardData?.stats || [
    { label: 'Total Calls', value: '0', icon: 'phone', trend: 'N/A' },
    { label: 'Active Clients', value: '0', icon: 'users', trend: 'N/A' },
    { label: 'Success Rate', value: '0%', icon: 'activity', trend: 'N/A' },
    { label: 'Avg Duration', value: '0s', icon: 'clock', trend: 'N/A' },
  ];

  const chartData = dashboardData?.chart_data || [];
  const topClients = dashboardData?.top_clients || [];
  const recentClients = dashboardData?.recent_clients || [];

  return (
    <div className="page-container">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1>Executive Overview</h1>
        <p>Real-time performance metrics across all clients.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
                {getIcon(stat.icon)}
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 500 }}>{stat.trend}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} color="var(--accent)" />
            Weekly Call Volume
          </h3>
          <div style={{ width: '100%', height: '400px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--accent)' }}
                  />
                  <Bar dataKey="calls" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <p>No activity detected this week.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Top Performers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {topClients.length > 0 ? topClients.map((client, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{client.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{client.volume} calls</div>
                  </div>
                  <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>{client.growth}</div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', opacity: 0.3, padding: '1rem 0' }}>
                  <p style={{ fontSize: '0.8rem' }}>Waiting for missions...</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Recent Partners</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recentClients.length > 0 ? recentClients.map((client, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{client.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{client.industry}</div>
                  </div>
                  <div style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(139, 92, 246, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                    {client.date}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', opacity: 0.3, padding: '1rem 0' }}>
                  <p style={{ fontSize: '0.8rem' }}>No clients yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Home;
