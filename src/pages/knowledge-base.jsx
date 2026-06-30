import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, Plus, Search, Brain, CheckCircle } from 'lucide-react';
import RichSelect from '../components/RichSelect';

const KnowledgeBase = () => {
  const [searchParams] = useSearchParams();
  const [domain, setDomain] = useState('loans');
  const [client, setClient] = useState(searchParams.get('client') || '');
  const [clients, setClients] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!client) return showNotify('Please select a target client first', 'error');
    if (!file) return showNotify('Please select a PDF document', 'error');
    
    setUploadingFile(true);

    const formData = new FormData();
    formData.append('domain', domain);
    formData.append('client_id', client);
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/admin/knowledge/upload-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
        body: formData
      });
      if (res.ok) {
        showNotify(`Training complete! Sarah has absorbed ${file.name}`);
        setFile(null);
      } else {
        showNotify('Failed to process PDF', 'error');
      }
    } catch (err) {
      showNotify('Upload failed due to network error', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/clients`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await res.json();
      const clientList = Array.isArray(data) ? data : [];
      setClients(clientList);
      if (clientList.length > 0 && !client) {
        setClient(clientList[0].name);
      }
    } catch (err) {
      showNotify('Failed to sync client list', 'error');
    }
  };

  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    if (!client) return showNotify('Select a client for this fact', 'error');
    if (!question.trim()) return showNotify('Question field cannot be empty', 'error');
    if (!answer.trim()) return showNotify('Sarah needs an answer to learn', 'error');

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/knowledge/upload?domain=${domain}&question=${encodeURIComponent(question)}&answer=${encodeURIComponent(answer)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (res.ok) {
        setQuestion('');
        setAnswer('');
        showNotify('Fact synced to Sarah\'s brain!');
      } else {
        showNotify('Failed to sync fact', 'error');
      }
    } catch (err) {
      showNotify('Connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
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
          {notification.type === 'error' ? <CheckCircle color="#ef4444" style={{ transform: 'rotate(45deg)' }} /> : <CheckCircle color="#10b981" />}
          <span style={{ fontWeight: 500 }}>{notification.text}</span>
        </div>
      )}

      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Brain color="var(--accent)" size={32} />
          Knowledge Base
        </h1>
        <p>Teach Sarah specific facts about each client or industry sector.</p>
      </header>
      
      {clients.length === 0 && (
        <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '24px', marginBottom: '2rem' }}>
          <Brain size={48} color="var(--accent)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.2rem', opacity: 0.6 }}>Knowledge Bank is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Register your first client to start building Sarah's intelligence.</p>
        </div>
      )}

      <div className="glass" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Add New Business Fact</h2>
        <form onSubmit={handleAddKnowledge}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '1.5rem' }}>
            <RichSelect 
              label="Target Client"
              value={client}
              onChange={(val) => setClient(val)}
              options={clients.map(c => ({
                id: c.name,
                name: c.name,
                description: c.industry.charAt(0).toUpperCase() + c.industry.slice(1),
                icon: c.industry === 'loans' ? '💰' : c.industry === 'insurance' ? '🛡️' : '🏠'
              }))}
            />
            <RichSelect 
              label="Industry / Domain"
              value={domain}
              onChange={(val) => setDomain(val)}
              options={[
                { id: 'loans', name: 'Loans', description: 'Personal & Business', icon: '💰' },
                { id: 'insurance', name: 'Insurance', description: 'Life & Health', icon: '🛡️' },
                { id: 'real_estate', name: 'Real Estate', description: 'Property Sales', icon: '🏠' }
              ]}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px' }}>Customer Question (RAG Trigger)</label>
            <input 
              type="text" 
              value={question}
              required
              placeholder="e.g. What is the interest rate for JayPvtLtd?"
              className="glass"
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px' }}>Sarah's Response (The Fact)</label>
            <textarea 
              value={answer}
              required
              placeholder="e.g. For JayPvtLtd, our home loan rates start at 7.9% for eligible customers."
              className="glass"
              style={{ width: '100%', height: '120px', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', resize: 'none' }}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px' }}
          >
            <Plus size={20} />
            {saving ? 'Teaching Sarah...' : 'Sync Individual Fact'}
          </button>
        </form>

        <div style={{ margin: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={18} color="var(--accent)" />
            Bulk Ingest via PDF
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label className="glass-btn" style={{ flex: 1, padding: '15px', cursor: 'pointer', borderStyle: 'dashed' }}>
              {file ? file.name : 'Select Company PDF/Docs'}
              <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <button 
              className="btn-primary" 
              disabled={!file || uploadingFile}
              onClick={handleFileUpload}
              style={{ width: '180px' }}
            >
              {uploadingFile ? 'Parsing...' : 'Upload & Train'}
            </button>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          <Database color="var(--accent)" size={24} />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 600 }}>RAG-Powered Intelligence</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '5px' }}>
              Sarah uses Retrieval-Augmented Generation. Every fact you add here is instantly searchable during live calls, ensuring she always provides accurate, client-specific information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
