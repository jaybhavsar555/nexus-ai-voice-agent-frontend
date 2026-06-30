import React, { useState, useEffect } from 'react';
import { Play, Plus, Users, Download, Activity, CheckCircle, XCircle, Pause, Square, Eye, Archive, RotateCcw } from 'lucide-react';
import RichSelect from '../components/RichSelect';
import Modal from '../components/Modal';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { title: string, message: string, onConfirm: function, confirmText: string }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'
  const [newCampaign, setNewCampaign] = useState({ name: '', domain: 'loans', file: null, client: '' });
  const [creationMode, setCreationMode] = useState('upload'); // 'upload' or 'manual'
  const [manualLead, setManualLead] = useState({ name: '', phone: '' });

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchClients();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const hasActive = campaigns.some(c => c.status === 'Active');
    if (!hasActive) return;

    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 10000);

    return () => clearTimeout(timer);
  }, [campaigns]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/clients`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      const clientList = Array.isArray(data) ? data : [];
      setClients(clientList);
      
      // Auto-select first client if none selected
      if (clientList.length > 0 && !newCampaign.client) {
        setNewCampaign(prev => ({ ...prev, client: clientList[0].id || clientList[0].name }));
      }
    } catch (err) {
      console.error('Client Fetch Error:', err);
      showNotify('Failed to sync client list', 'error');
      setClients([]);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/campaigns`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      
      const campaignList = Array.isArray(data) ? data : (data.campaigns || []);
      setCampaigns(campaignList);
    } catch (err) {
      console.error('Campaign Fetch Error:', err);
      showNotify('Failed to load campaigns', 'error');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Global Validation
    if (!newCampaign.name) return showNotify('Campaign name is required', 'error');
    if (!newCampaign.client) return showNotify('Please select a client', 'error');
    if (!newCampaign.domain) return showNotify('Please select a domain', 'error');

    if (creationMode === 'upload') {
      if (!newCampaign.file) return showNotify('Please select a lead list CSV', 'error');
      
      const formData = new FormData();
      formData.append('name', newCampaign.name);
      formData.append('domain', newCampaign.domain);
      formData.append('file', newCampaign.file);
      formData.append('client_id', newCampaign.client);

      try {
        const res = await fetch(`${API_BASE}/campaigns/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: formData
        });
        if (res.ok) {
          showNotify(`Bulk Campaign '${newCampaign.name}' launched!`);
          setIsModalOpen(false);
          setNewCampaign({ name: '', domain: 'loans', file: null, client: clients[0]?.id || '' });
          fetchCampaigns();
        } else {
          showNotify('Failed to upload campaign', 'error');
        }
      } catch (err) {
        showNotify('Network error during upload', 'error');
      }
    } else {
      // Manual Mode Validation
      if (!manualLead.name) return showNotify('Lead name is required', 'error');
      if (!manualLead.phone) return showNotify('Phone number is required', 'error');
      
      try {
        const res = await fetch(`${API_BASE}/campaigns/create-manual`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}` 
          },
          body: JSON.stringify({
            name: newCampaign.name,
            domain: newCampaign.domain,
            client_id: newCampaign.client,
            contact_name: manualLead.name,
            contact_phone: manualLead.phone
          })
        });
        if (res.ok) {
          showNotify(`Test Campaign '${newCampaign.name}' created!`);
          setIsModalOpen(false);
          setManualLead({ name: '', phone: '' });
          fetchCampaigns();
        } else {
          showNotify('Failed to create manual campaign', 'error');
        }
      } catch (err) {
        showNotify('Network error during setup', 'error');
      }
    }
  };

  const startCampaign = async (id, name) => {
    setConfirmAction({
      title: "Launch Campaign?",
      message: `Start '${name}' now? Sarah will begin calling leads immediately.`,
      confirmText: "Launch Now",
      confirmColor: "var(--accent)",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/campaigns/${id}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
          });
          if (res.ok) {
            showNotify('Dialer started! Sarah is now calling leads.');
            fetchCampaigns();
          } else {
            showNotify('Failed to start dialer', 'error');
          }
        } catch (err) {
          showNotify('Connection failed', 'error');
        }
        setConfirmAction(null);
      }
    });
  };

  const pauseCampaign = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${id}/pause`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (res.ok) {
        showNotify('Campaign paused. Sarah will stop after current call.');
        fetchCampaigns();
      }
    } catch (err) {
      showNotify('Pause failed', 'error');
    }
  };

  const stopCampaign = async (id, name) => {
    setConfirmAction({
      title: "Halt Campaign?",
      message: `Are you sure you want to STOP '${name}'? This will cancel all remaining leads in this run.`,
      confirmText: "Stop Campaign",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/campaigns/${id}/stop`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
          });
          if (res.ok) {
            showNotify('Campaign halted.');
            fetchCampaigns();
          }
        } catch (err) {
          showNotify('Stop failed', 'error');
        }
        setConfirmAction(null);
      }
    });
  };

  const archiveCampaign = async (id, name) => {
    setConfirmAction({
      title: "Move to Vault?",
      message: `Send '${name}' to the archive vault? You can restore it later if needed.`,
      confirmText: "Archive Now",
      confirmColor: "#f59e0b",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/campaigns/${id}/archive`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
          });
          if (res.ok) {
            showNotify('Campaign moved to Archive.');
            fetchCampaigns();
          }
        } catch (err) {
          showNotify('Archive failed', 'error');
        }
        setConfirmAction(null);
      }
    });
  };

  const restoreCampaign = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${id}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (res.ok) {
        showNotify('Campaign restored to active list.');
        fetchCampaigns();
      }
    } catch (err) {
      showNotify('Restore failed', 'error');
    }
  };

  return (
    <div className="page-container">
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
          <h1>Campaign Manager</h1>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button 
              onClick={() => setViewMode('active')}
              style={{ background: 'none', border: 'none', color: viewMode === 'active' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', borderBottom: viewMode === 'active' ? '2px solid var(--accent)' : 'none', padding: '5px 0' }}
            >
              Campaign Hub
            </button>
            <button 
              onClick={() => setViewMode('archived')}
              style={{ background: 'none', border: 'none', color: viewMode === 'archived' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', borderBottom: viewMode === 'archived' ? '2px solid var(--accent)' : 'none', padding: '5px 0' }}
            >
              Vault Archive
            </button>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(!isModalOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} />
          {isModalOpen ? 'Hide Setup' : 'Create New Campaign'}
        </button>
      </header>

      {/* Inline Campaign Setup (Container) */}
      {isModalOpen && (
        <div className="glass" style={{ padding: '2.5rem', marginBottom: '2.5rem', border: '1px solid var(--accent)', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Initialize AI Campaign</h2>
            <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px' }}>
              <button 
                onClick={() => setCreationMode('upload')}
                style={{ padding: '8px 16px', borderRadius: '10px', background: creationMode === 'upload' ? 'var(--accent)' : 'transparent', border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Bulk Upload
              </button>
              <button 
                onClick={() => setCreationMode('manual')}
                style={{ padding: '8px 16px', borderRadius: '10px', background: creationMode === 'manual' ? 'var(--accent)' : 'transparent', border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Quick Add
              </button>
            </div>
            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.5 }}><XCircle size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: creationMode === 'upload' ? '1.5fr 1fr 1fr 1fr' : '1.5fr 1fr 1fr 1fr 1fr', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', fontWeight: 600 }}>CAMPAIGN NAME</label>
                <input 
                  type="text" 
                  value={newCampaign.name}
                  placeholder="e.g. Summer Outreach"
                  className="glass"
                  style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', minHeight: '54px' }}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                />
              </div>

              <RichSelect 
                label="CLIENT"
                value={newCampaign.client}
                onChange={(val) => setNewCampaign({...newCampaign, client: val})}
                options={clients.map(c => ({
                  id: c.id,
                  name: c.name,
                  icon: c.industry === 'loans' ? '💰' : c.industry === 'insurance' ? '🛡️' : '🏠'
                }))}
              />

              <RichSelect 
                label="DOMAIN"
                value={newCampaign.domain}
                onChange={(val) => setNewCampaign({...newCampaign, domain: val})}
                options={[
                  { id: 'loans', name: 'Loans', icon: '💰' },
                  { id: 'insurance', name: 'Insurance', icon: '🛡️' },
                  { id: 'real_estate', name: 'Real Estate', icon: '🏠' }
                ]}
              />

              {creationMode === 'upload' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', fontWeight: 600 }}>CONTACT LIST</label>
                  <label className="glass-btn" style={{ padding: '14px', cursor: 'pointer', display: 'flex', gap: '8px', minHeight: '54px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Download size={18} />
                    {newCampaign.file ? newCampaign.file.name.substring(0, 10) + '...' : 'Upload CSV'}
                    <input type="file" required={creationMode === 'upload'} accept=".csv" style={{ display: 'none' }} onChange={(e) => setNewCampaign({...newCampaign, file: e.target.files[0]})} />
                  </label>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', fontWeight: 600 }}>LEAD NAME</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={manualLead.name}
                      className="glass"
                      style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', minHeight: '54px' }}
                      onChange={(e) => setManualLead({...manualLead, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', fontWeight: 600 }}>PHONE NUMBER</label>
                    <input 
                      type="text" 
                      placeholder="+1 234..."
                      value={manualLead.phone}
                      className="glass"
                      style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', minHeight: '54px' }}
                      onChange={(e) => setManualLead({...manualLead, phone: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '200px', padding: '15px' }}>
              Launch Campaign
            </button>
          </form>
        </div>
      )}

      {/* Empty State */}
      {!loading && (campaigns || []).filter(c => {
        const status = (c.status || '').toLowerCase();
        return viewMode === 'archived' ? status === 'archived' : status !== 'archived';
      }).length === 0 && (
        <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '24px' }}>
          <Activity size={48} color="var(--accent)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.2rem', opacity: 0.6 }}>{viewMode === 'archived' ? 'Vault Archive is Empty' : 'Campaign Hub is Empty'}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{viewMode === 'archived' ? 'Archived missions will appear here.' : 'No active or paused campaigns detected.'}</p>
        </div>
      )}

      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {(campaigns || []).filter(c => {
          const status = (c.status || '').toLowerCase();
          return viewMode === 'archived' ? status === 'archived' : status !== 'archived';
        }).map(camp => (
          <div key={camp.id || camp._id} className="glass" style={{ padding: '1.5rem', border: camp.status === 'Active' ? '1px solid var(--accent)' : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', minWidth: 0 }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 700, marginBottom: '4px' }}>{(camp.client || 'GENERAL').toUpperCase()}</div>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }} title={camp.name || 'Untitled Campaign'}>
                  {camp.name || 'Untitled Campaign'}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {viewMode === 'active' ? (
                  <button 
                    onClick={() => archiveCampaign(camp.id || camp._id, camp.name)}
                    className="glass-btn"
                    style={{ width: '32px', height: '32px', padding: 0, opacity: 0.5 }}
                    title="Archive Campaign"
                  >
                    <Archive size={14} />
                  </button>
                ) : (
                  <button 
                    onClick={() => restoreCampaign(camp.id || camp._id)}
                    className="glass-btn"
                    style={{ width: '32px', height: '32px', padding: 0, color: 'var(--accent)' }}
                    title="Restore to Active"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                <span className={`badge ${camp.status === 'Active' ? 'badge-success' : camp.status === 'Completed' ? 'badge-success' : camp.status === 'Archived' ? '' : 'badge-error'}`}>
                  {camp.status || 'Draft'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <Users size={16} color="var(--accent)" style={{ marginBottom: '5px' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{camp.total_leads || 0}</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>LEADS</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <Activity size={16} color="var(--accent)" style={{ marginBottom: '5px' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{camp.progress || 0}%</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>PROGRESS</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="glass-btn" 
                style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                title="View Leads"
                onClick={() => setSelectedCampaign(camp)}
              >
                <Eye size={18} />
              </button>
              {camp.status === 'Active' ? (
                <>
                  <button 
                    className="glass-btn" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
                    onClick={() => pauseCampaign(camp.id || camp._id)}
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                  <button 
                    className="glass-btn" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    onClick={() => stopCampaign(camp.id || camp._id, camp.name)}
                  >
                    <Square size={16} />
                    Stop
                  </button>
                </>
              ) : viewMode === 'archived' ? (
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--accent)' }}
                  onClick={() => restoreCampaign(camp.id || camp._id)}
                >
                  <RotateCcw size={16} />
                  Restore Campaign
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                  onClick={() => startCampaign(camp.id || camp._id, camp.name)}
                >
                  <Play size={16} />
                  {camp.status === 'Paused' ? 'Resume Campaign' : 'Start Campaign'}
                </button>
              )}
              <button className="glass-btn" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Download Report">
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Lead Vault Modal */}
      <Modal 
        isOpen={!!selectedCampaign} 
        onClose={() => setSelectedCampaign(null)}
        title={`Lead Vault: ${selectedCampaign?.name}`}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', opacity: 0.5, fontSize: '0.75rem' }}>
                <th style={{ padding: '12px' }}>NAME</th>
                <th style={{ padding: '12px' }}>PHONE</th>
                <th style={{ padding: '12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {selectedCampaign?.contacts?.map((contact, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{contact.name}</td>
                  <td style={{ padding: '12px', opacity: 0.8 }}>{contact.phone}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${contact.status === 'calling' ? 'badge-success' : contact.status === 'failed' ? 'badge-error' : ''}`} style={{ fontSize: '0.65rem' }}>
                      {(contact.status || 'pending').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!selectedCampaign?.contacts || selectedCampaign.contacts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>No leads found in this campaign.</div>
          )}
        </div>
      </Modal>

      {/* Custom Confirmation Modal */}
      {confirmAction && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 11000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '2.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: `2px solid ${confirmAction.confirmColor || 'var(--accent)'}`
            }}>
              <Activity size={32} color={confirmAction.confirmColor || 'var(--accent)'} />
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{confirmAction.title}</h2>
            <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '2rem' }}>{confirmAction.message}</p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="glass-btn" 
                style={{ flex: 1, padding: '12px' }}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: '12px', background: confirmAction.confirmColor || 'var(--accent)' }}
                onClick={confirmAction.onConfirm}
              >
                {confirmAction.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
