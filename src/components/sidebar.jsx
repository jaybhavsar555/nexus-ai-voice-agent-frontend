import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Users, Settings, BookOpen, Layers, Activity, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home', path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'logs', path: '/logs', name: 'Call Logs', icon: <PhoneCall size={20} /> },
    { id: 'clients', path: '/clients', name: 'Clients', icon: <Users size={20} /> },
    { id: 'config', path: '/config', name: 'Domain Config', icon: <Settings size={20} /> },
    { id: 'knowledge', path: '/knowledge-base', name: 'Knowledge Base', icon: <BookOpen size={20} /> },
    { id: 'campaigns', path: '/campaigns', name: 'Campaigns', icon: <Layers size={20} /> },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="sidebar glass">
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
          <Activity color="white" size={24} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>NexusVoice Dashboard</span>
      </div>

      <nav>
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span style={{ fontWeight: 500 }}>{item.name}</span>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Logged in as</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.username || 'Admin'}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#10b981' }}>Live & Active</span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="nav-item" 
          style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444' }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: 500 }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
