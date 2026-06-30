import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Home from './pages/home';
import CallLogs from './pages/call-logs';
import Clients from './pages/clients';
import DomainConfig from './pages/domain-config';
import KnowledgeBase from './pages/knowledge-base';
import Campaigns from './pages/campaigns';
import Login from './pages/login';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  if (isAuthLoading) return null;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar onLogout={handleLogout} user={user} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/logs" element={<CallLogs />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/config" element={<DomainConfig />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
