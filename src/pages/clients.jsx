import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Download, ChevronRight, Activity, Phone,
  Trash2, Pause, Play, Edit2, X, Shield, Globe, Clock, Volume2, Upload, Users, CheckCircle, XCircle, RotateCcw
} from 'lucide-react';
import RichSelect from '../components/RichSelect';
import Modal from '../components/Modal';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [isExporting, setIsExporting] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'

  const [formData, setFormData] = useState({
    name: '',
    industry: 'Loans',
    voice: 'aura-asteria-en',
    quota: 500,
    timezone: 'EST',
    contact_name: '',
    contact_phone: ''
  });

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
    setViewingDetails(null); // Close sidebar to prevent overlap with the edit form
    setFormData({
      name: client.name || '',
      industry: client.industry?.charAt(0).toUpperCase() + client.industry?.slice(1) || 'Loans',
      voice: client.metadata?.voice || 'aura-asteria-en',
      quota: client.metadata?.quota || 500,
      timezone: client.metadata?.timezone || 'EST',
      contact_name: client.contact_name || '',
      contact_phone: client.contact_phone || ''
    });
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [confirmAction, setConfirmAction] = useState(null); // { title: string, message: string, onConfirm: function }
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', text: string }

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/clients`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('API Error:', err);
      showNotify('Failed to connect to database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (client) => {
    setIsExporting(client.id);
    try {
      // In a real system, this might be an actual download or a background task
      showNotify(`Preparing data package for ${client.name}...`);
      
      // Simulate API call
      setTimeout(() => {
        showNotify(`Export complete! Sent to administrator email.`);
        setIsExporting(null);
      }, 2000);
    } catch (err) {
      showNotify('Export failed', 'error');
      setIsExporting(null);
    }
  };

  const saveClient = async () => {
    if (!formData.name) return showNotify('Company name is required', 'error');
    if (!formData.contact_name) return showNotify('Primary contact name is required', 'error');
    if (!formData.contact_phone) return showNotify('Office phone is required', 'error');
    if (!formData.industry) return showNotify('Please select an industry', 'error');

    try {
      const method = editingClient ? 'PATCH' : 'POST';
      const url = editingClient ? `${API_BASE}/admin/clients/${editingClient.id}` : `${API_BASE}/admin/clients`;

      const payload = {
        name: formData.name,
        company_display_name: formData.name,
        industry: formData.industry.toLowerCase().replace(' ', '_'),
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        metadata: {
          voice: formData.voice,
          quota: formData.quota,
          timezone: formData.timezone
        }
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotify(`Successfully ${editingClient ? 'updated' : 'registered'} ${formData.name}!`);
        fetchClients();
        closeModal();
      } else {
        showNotify('Failed to save client profile', 'error');
      }
    } catch (err) {
      showNotify('Network error. Check connection', 'error');
    }
  };

  const toggleStatus = (client) => {
    const isPausing = client.status === 'Active';
    setConfirmAction({
      title: isPausing ? "Pause AI Agents?" : "Resume AI Agents?",
      message: isPausing
        ? `Are you sure you want to stop all active campaigns for ${client.name}? Sarah will stop calling leads immediately.`
        : `Ready to start calling leads again for ${client.name}?`,
      confirmText: isPausing ? "Yes, Pause Agents" : "Resume Now",
      confirmColor: isPausing ? "#ef4444" : "var(--accent)",
      onConfirm: async () => {
        const newStatus = isPausing ? 'Paused' : 'Active';
        try {
          const res = await fetch(`${API_BASE}/admin/clients/${client.id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            },
            body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
            showNotify(`${client.name} is now ${newStatus}`);
            fetchClients();
          }
        } catch (err) {
          showNotify('Status update failed', 'error');
        }
        setConfirmAction(null);
      }
    });
  };

  const archiveClient = (id, name) => {
    setConfirmAction({
      title: "Archive Client Account?",
      message: `Are you sure you want to archive ${name}? This will hide the client from the main dashboard but keep all their data safe.`,
      confirmText: "Yes, Archive Account",
      confirmColor: "#f59e0b",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/admin/clients/${id}/archive`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
          });
          if (res.ok) {
            showNotify(`${name} moved to archives`);
            setViewingDetails(null);
            fetchClients();
          }
        } catch (err) {
          showNotify('Archive failed', 'error');
        }
        setConfirmAction(null);
      }
    });
  };

  const restoreClient = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE}/admin/clients/${id}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (res.ok) {
        showNotify(`${name} restored to active list`);
        fetchClients();
      }
    } catch (err) {
      showNotify('Restore failed', 'error');
    }
  };

  const deleteClient = (id, name) => {
    setConfirmAction({
      title: "PERMANENT DELETION",
      message: `⚠️ WARNING: You are about to permanently delete ${name || 'this client'}. This will remove all Knowledge Base PDFs, Campaigns, and Logs.`,
      confirmText: "Yes, Delete Everything",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/admin/clients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
          });
          if (res.ok) {
            showNotify('Client data permanently removed');
            fetchClients();
            if (viewingDetails?.id === id) setViewingDetails(null);
          }
        } catch (err) {
          showNotify('Deletion failed', 'error');
        }
        setConfirmAction(null);
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      name: '',
      industry: 'Loans',
      voice: 'aura-asteria-en',
      quota: 500,
      timezone: 'EST',
      contact_name: '',
      contact_phone: ''
    });
  };

  return (
    <div style={{ position: 'relative' }}>
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
          {notification.type === 'error' ? <XCircle color="#ef4444" /> : <CheckCircle color="#10b981" />}
          <span style={{ fontWeight: 500 }}>{notification.text}</span>
        </div>
      )}
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Client Management</h1>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button 
              onClick={() => setViewMode('active')}
              style={{ background: 'none', border: 'none', color: viewMode === 'active' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', borderBottom: viewMode === 'active' ? '2px solid var(--accent)' : 'none', padding: '5px 0' }}
            >
              Active Clients
            </button>
            <button 
              onClick={() => setViewMode('archived')}
              style={{ background: 'none', border: 'none', color: viewMode === 'archived' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', borderBottom: viewMode === 'archived' ? '2px solid var(--accent)' : 'none', padding: '5px 0' }}
            >
              Archive Vault
            </button>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(!isModalOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} />
          {isModalOpen ? 'Hide Registration' : 'Register New Client'}
        </button>
      </header>

      {/* Inline Registration Form (Container) */}
      {isModalOpen && (
        <div className="glass" style={{ padding: '2.5rem', marginBottom: '2.5rem', border: '1px solid var(--accent)', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingClient ? 'Update Client Profile' : 'Register New Client'}</h2>
            <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.5 }}><X size={20} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Company Name</label>
              <input
                type="text"
                value={formData.name}
                placeholder="e.g. JayPvtLtd"
                className="glass"
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', minHeight: '54px' }}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <RichSelect
              label="INDUSTRY"
              value={formData.industry}
              onChange={(val) => setFormData({ ...formData, industry: val })}
              options={[
                { id: 'Loans', name: 'Loans', icon: '💰' },
                { id: 'Insurance', name: 'Insurance', icon: '🛡️' },
                { id: 'Real Estate', name: 'Real Estate', icon: '🏠' }
              ]}
            />

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Primary Contact</label>
              <input
                type="text"
                value={formData.contact_name}
                placeholder="e.g. John Doe"
                className="glass"
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', minHeight: '54px' }}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Office Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                placeholder="e.g. +1 234 567 890"
                className="glass"
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', minHeight: '54px' }}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>

            <RichSelect
              label="VOICE MODEL"
              value={formData.voice}
              onChange={(val) => setFormData({ ...formData, voice: val })}
              options={[
                { id: 'aura-asteria-en', name: 'Female (Asteria)', icon: '👩' },
                { id: 'aura-luna-en', name: 'Female (Luna)', icon: '👩' },
                { id: 'aura-stella-en', name: 'Female (Stella)', icon: '👩' },
                { id: 'aura-orion-en', name: 'Male (Orion)', icon: '👨' },
                { id: 'aura-perseus-en', name: 'Male (Perseus)', icon: '👨' }
              ]}
            />

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <button className="btn-primary" style={{ flex: 1, padding: '15px' }} onClick={saveClient}>
                {editingClient ? 'Save Changes' : 'Create Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Empty State */}
       {!loading && (clients || []).filter(c => {
         const status = (c.status || '').toLowerCase();
         return viewMode === 'archived' ? status === 'archived' : status !== 'archived';
       }).length === 0 && (
         <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '24px' }}>
           <Building2 size={48} color="var(--accent)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
           <h3 style={{ fontSize: '1.2rem', opacity: 0.6 }}>{viewMode === 'archived' ? 'Archive Vault is Empty' : 'No Active Clients Found'}</h3>
           <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{viewMode === 'archived' ? 'Archived accounts will appear here.' : 'Register a new client above to get started.'}</p>
         </div>
       )}

      {/* Main Grid */}
      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' }}>
        {(clients || [])
          .filter(c => {
            const status = (c.status || '').toLowerCase();
            return viewMode === 'archived' ? status === 'archived' : status !== 'archived';
          })
          .map(client => (
          <div key={client.id} className="glass" style={{ padding: '1.8rem', position: 'relative', overflow: 'hidden', border: client.status === 'Paused' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--accent), #a78bfa)', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)' }}>
                  <Building2 color="white" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{client.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{client.industry}</span>
                    <span style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 600 }}>{client.timezone}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span className={`status-pill ${client.status?.toLowerCase() === 'active' ? 'active' : 'paused'}`}>
                  {client.status || 'Active'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {viewMode === 'archived' ? (
                    <button
                      onClick={() => restoreClient(client.id, client.name)}
                      className="glass-btn"
                      style={{ width: '38px', height: '38px', borderRadius: '10px', color: 'var(--accent)' }}
                      title="Restore Client"
                    >
                      <RotateCcw size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleStatus(client)}
                      className="glass-btn"
                      style={{ width: '38px', height: '38px', borderRadius: '10px' }}
                      title={client.status === 'Active' ? 'Pause' : 'Resume'}
                    >
                      {client.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  )}
                  <button
                    onClick={() => deleteClient(client.id, client.name)}
                    className="glass-btn"
                    style={{ width: '38px', height: '38px', borderRadius: '10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.8rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.4 }}>
                  <Phone size={14} color="var(--accent)" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em' }}>TOTAL CALLS</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(client.totalCalls || 0).toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.4 }}>
                  <Activity size={14} color="var(--accent)" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em' }}>CAMPAIGNS</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{client.campaigns || 0}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', borderRadius: '14px', fontSize: '0.9rem' }}
                onClick={() => navigate(`/knowledge-base?client=${client.id}`)}
              >
                <Upload size={18} />
                <span>Dump Data</span>
              </button>
              <button
                className="glass-btn"
                style={{ width: '58px', height: '58px', borderRadius: '14px' }}
                onClick={() => setViewingDetails(client)}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Client Detail View (Chevron Flow) */}
      {viewingDetails && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '500px', background: '#0f172a', zIndex: 2000, boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', borderLeft: '1px solid var(--border-color)', animation: 'slideInRight 0.3s ease-out', padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield color="var(--accent)" />
              <h2 style={{ fontSize: '1.5rem' }}>{viewingDetails?.name || 'Client Details'}</h2>
            </div>
            <button onClick={() => setViewingDetails(null)} className="glass-btn" style={{ padding: '8px' }}><X size={20} /></button>
          </div>

          <section style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ opacity: 0.4, fontSize: '0.8rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Configuration Dashboard</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Volume2 size={20} color="var(--accent)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{viewingDetails?.metadata?.voice || 'aura-asteria-en'}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Active Voice Model</div>
                  </div>
                </div>
                <button onClick={() => handleEdit(viewingDetails)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Edit2 size={16} opacity={0.5} />
                </button>
              </div>

              <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={20} color="var(--accent)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{viewingDetails?.contact_name || 'Not Set'}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Primary Contact</div>
                  </div>
                </div>
                <button onClick={() => handleEdit(viewingDetails)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Edit2 size={16} opacity={0.5} />
                </button>
              </div>

              <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={20} color="var(--accent)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{viewingDetails?.contact_phone || 'Not Set'}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Office Phone</div>
                  </div>
                </div>
                <button onClick={() => handleEdit(viewingDetails)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Edit2 size={16} opacity={0.5} />
                </button>
              </div>
            </div>
          </section>

          <section>
            <h4 style={{ opacity: 0.4, fontSize: '0.8rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Recent Activity Logs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { time: '10 mins ago', action: 'Campaign Started', status: 'Success' },
                { time: '1 hour ago', action: 'Data Exported', status: 'Completed' },
                { time: '4 hours ago', action: 'Script Updated', status: 'Insurance V2' }
              ].map((log, i) => (
                <div key={i} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{log.action}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{log.time}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{log.status}</span>
                </div>
              ))}
            </div>
          </section>

          {viewingDetails.status?.toLowerCase() === 'archived' ? (
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '3rem', background: 'var(--accent)', boxShadow: '0 8px 20px var(--accent)33' }} 
              onClick={() => {
                restoreClient(viewingDetails.id, viewingDetails.name);
                setViewingDetails(null);
              }}
            >
              <RotateCcw size={18} style={{ marginRight: '8px' }} />
              Restore Client Account
            </button>
          ) : (
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '3rem', background: '#f59e0b', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.2)' }} 
              onClick={() => archiveClient(viewingDetails.id, viewingDetails.name)}
            >
              Archive Client Account
            </button>
          )}
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmAction && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.98)',
            width: '90%',
            maxWidth: '420px',
            padding: '2.5rem',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.8rem', color: 'white' }}>{confirmAction.title}</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.2rem', fontSize: '0.95rem' }}>{confirmAction.message}</p>

            <div style={{ display: 'flex', gap: '12px' }}>
              {!confirmAction.isSuccess && (
                <button
                  className="glass-btn"
                  style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.02)' }}
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              )}
              <button
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '14px',
                  background: confirmAction.confirmColor || 'var(--accent)',
                  boxShadow: `0 8px 20px ${confirmAction.confirmColor || 'var(--accent)'}33`
                }}
                onClick={confirmAction.isSuccess ? () => setConfirmAction(null) : confirmAction.onConfirm}
              >
                {confirmAction.isSuccess ? "Got it" : confirmAction.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Clients;
