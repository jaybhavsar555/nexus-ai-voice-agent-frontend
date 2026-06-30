import React, { useState, useEffect } from 'react';
import { Phone, Clock, CheckCircle2, XCircle, Search, RefreshCw, MessageSquare, ExternalLink } from 'lucide-react';
import TranscriptModal from '../components/TranscriptModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/admin';

const CallLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedClient, selectedCampaign]);

  const fetchMetadata = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` };
      const [resClients, resCampaigns] = await Promise.all([
        fetch(`${API_BASE}/clients`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/campaigns`, { headers })
      ]);
      const clientsData = await resClients.json();
      const campaignsData = await resCampaigns.json();
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/calls?`;
      if (selectedClient) url += `client_id=${selectedClient}&`;
      if (selectedCampaign) url += `campaign_id=${selectedCampaign}&`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (callSid) => {
    try {
      const res = await fetch(`${API_BASE}/calls/${callSid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await res.json();
      setSelectedCall(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Call Command Center</h1>
          <p>Real-time visibility into Sarah's outreach and outcomes.</p>
        </div>
        <button 
          onClick={fetchLogs} 
          className="glass-btn" 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          {loading ? 'Syncing...' : 'Refresh Logs'}
        </button>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select 
          className="glass-btn" 
          style={{ padding: '12px 16px', minWidth: '220px', appearance: 'auto' }}
          value={selectedClient} 
          onChange={e => {
            setSelectedClient(e.target.value);
            setSelectedCampaign(''); // Reset campaign when client changes
          }}
        >
          <option value="">Filter by Client (All)</option>
          {clients.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
        </select>
        
        <select 
          className="glass-btn" 
          style={{ padding: '12px 16px', minWidth: '220px', appearance: 'auto' }}
          value={selectedCampaign} 
          onChange={e => setSelectedCampaign(e.target.value)}
        >
          <option value="">Filter by Campaign (All)</option>
          {campaigns
            .filter(c => !selectedClient || c.client_id === selectedClient)
            .map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
        </select>
      </div>

      {!loading && logs.length === 0 ? (
        <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '24px' }}>
          <Search size={48} color="var(--accent)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.2rem', opacity: 0.6 }}>No Call History Detected</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Once Sarah starts outreach missions, logs will appear here.</p>
        </div>
      ) : (
        <div className="glass" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '1.5rem', fontSize: '0.75rem', opacity: 0.5 }}>PHONE NUMBER</th>
                <th style={{ padding: '1.5rem', fontSize: '0.75rem', opacity: 0.5 }}>STATUS</th>
                <th style={{ padding: '1.5rem', fontSize: '0.75rem', opacity: 0.5 }}>OUTCOME</th>
                <th style={{ padding: '1.5rem', fontSize: '0.75rem', opacity: 0.5 }}>DURATION</th>
                <th style={{ padding: '1.5rem', fontSize: '0.75rem', opacity: 0.5 }}>DATE</th>
                <th style={{ padding: '1.5rem', fontSize: '0.75rem', opacity: 0.5 }}>TRANSCRIPT</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr 
                  key={log.id || log.call_sid} 
                  className="table-row-hover"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                >
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '8px' }}>
                        <Phone size={16} color="var(--accent)" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{log.phone_number || log.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <span className={`badge ${log.status === 'completed' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem' }}>
                      {log.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {log.outcome === 'interested' ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#ef4444" />
                      )}
                      <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{log.outcome || 'No Outcome'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                      <Clock size={14} />
                      {log.duration || 0}s
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', opacity: 0.6, fontSize: '0.9rem' }}>
                    {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <button 
                      onClick={() => handleRowClick(log.call_sid)}
                      className="glass-btn"
                      style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={14} />
                      View Text
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TranscriptModal call={selectedCall} onClose={() => setSelectedCall(null)} />

      <style>{`
        .table-row-hover:hover { background: rgba(255,255,255,0.03); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CallLogs;
