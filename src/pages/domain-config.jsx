import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, PlayCircle, Settings, FileText, ChevronRight } from 'lucide-react';
import RichSelect from '../components/RichSelect';

const DomainConfig = () => {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/domains`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await res.json();
      const domainList = data.domains || [];
      setDomains(domainList);
      if (domainList.length > 0) {
        handleDomainChange(domainList[0]);
      } else {
        setDomains(['loans', 'insurance', 'real_estate']);
        handleDomainChange('loans');
      }
    } catch (err) {
      showNotify('Connecting to backend services...', 'error');
      setDomains(['loans', 'insurance', 'real_estate']);
      handleDomainChange('loans');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainChange = async (domain) => {
    setSelectedDomain(domain);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/domains/${domain}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await res.json();
      setPrompt(data.prompt || '');
    } catch (err) {
      showNotify('Failed to load domain script', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDomain) return showNotify('Please select a domain vertical', 'error');
    if (!prompt.trim()) return showNotify('Prompt cannot be empty. Sarah needs a script!', 'error');

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/domains/${selectedDomain}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ content: prompt })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showNotify(`${selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} script updated!`);
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      showNotify('Error saving prompt configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      {/* Global Notifications */}
      {notification && (
        <div 
          className="glass" 
          style={{ 
            position: 'fixed', 
            bottom: '30px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 10000, 
            padding: '16px 24px', 
            borderRadius: '12px', 
            borderLeft: `4px solid ${notification.type === 'error' ? '#ef4444' : '#10b981'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            minWidth: '300px'
          }}
        >
          {notification.type === 'error' ? <AlertCircle color="#ef4444" /> : <Save color="#10b981" />}
          <span style={{ fontWeight: 500 }}>{notification.text}</span>
        </div>
      )}

      <header style={{ marginBottom: '2rem' }}>
        <h1>Domain Configuration</h1>
        <p>Edit AI personas and scripts for different industry verticals.</p>
      </header>

      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <RichSelect 
            label="SELECT DOMAIN PERSONA"
            value={selectedDomain}
            onChange={(val) => handleDomainChange(val)}
            options={domains.map(d => ({
              id: d,
              name: d.charAt(0).toUpperCase() + d.slice(1).replace('_', ' '),
              description: d.includes('loan') ? 'Personal & Business Loans' : d.includes('insurance') ? 'Life & Asset Protection' : d.includes('real') ? 'Property & Rentals' : 'Custom Assistant',
              icon: d.includes('loan') ? '💰' : d.includes('insurance') ? '🛡️' : d.includes('real') ? '🏠' : '🤖'
            }))}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            System Prompt / Script
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            spellCheck="false"
            disabled={!selectedDomain || loading}
            placeholder={loading ? "Loading script..." : "Select a domain to edit script..."}
            style={{
              width: '100%',
              height: '400px',
              background: '#0a0f1d',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: '#10b981',
              padding: '1.5rem',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'vertical',
              opacity: !selectedDomain ? 0.5 : 1
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.5rem' }}>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleSave}
            disabled={saving || loading || !selectedDomain}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {!loading && domains.length === 0 && (
        <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '24px', marginTop: '2rem' }}>
          <Settings size={48} color="var(--accent)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.2rem', opacity: 0.6 }}>Prompts Vault is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No domain configurations detected in the system.</p>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DomainConfig;
