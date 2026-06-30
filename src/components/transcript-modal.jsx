import React, { useState } from 'react';
import { X, User, Bot, Clock } from 'lucide-react';

const TranscriptModal = ({ call, onClose }) => {
  const [activeTab, setActiveTab] = useState('transcript');
  if (!call) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'flex-end', zIndex: 1000
    }}>
      <div className="modal-content glass" style={{
        width: '500px', height: '100vh', background: '#0f172a',
        padding: '2rem', borderLeft: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Call Details</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
            <div>
              <p style={{ fontSize: '0.75rem' }}>Phone Number</p>
              <p style={{ fontWeight: 600 }}>{call.phone_number || call.customer_number}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem' }}>Status</p>
              <span className={`badge ${call.status === 'completed' ? 'badge-success' : 'badge-error'}`}>
                {call.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setActiveTab('transcript')}
            style={{ 
              padding: '10px 20px', background: 'transparent', border: 'none', 
              borderBottom: activeTab === 'transcript' ? '2px solid var(--accent)' : 'none',
              color: activeTab === 'transcript' ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 600
            }}
          >
            Transcript
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{ 
              padding: '10px 20px', background: 'transparent', border: 'none', 
              borderBottom: activeTab === 'logs' ? '2px solid var(--accent)' : 'none',
              color: activeTab === 'logs' ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 600
            }}
          >
            Internal Logs
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
          {activeTab === 'transcript' ? (
            <>
              {call.transcript && call.transcript.length > 0 ? call.transcript.map((entry, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '1.5rem', 
                  display: 'flex', 
                  gap: '12px'
                }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: entry.role === 'user' || entry.role === 'human' ? 'rgba(255,255,255,0.1)' : 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {entry.role === 'user' || entry.role === 'human' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', marginBottom: '4px', opacity: 0.6 }}>
                      {entry.role === 'user' || entry.role === 'human' ? 'Customer' : 'NexusVoice'}
                    </p>
                    <div style={{ 
                      padding: '12px', borderRadius: '12px', 
                      background: entry.role === 'user' || entry.role === 'human' ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.1)',
                      fontSize: '0.9rem', lineHeight: '1.5'
                    }}>
                      {entry.content || entry.text}
                    </div>
                  </div>
                </div>
              )) : (
                <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>No transcript available.</p>
              )}
            </>
          ) : (
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {call.internal_logs && call.internal_logs.length > 0 ? call.internal_logs.map((log, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '10px', 
                  padding: '8px', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderLeft: '2px solid var(--accent)',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  {log}
                </div>
              )) : (
                <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>No system logs for this call.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptModal;
