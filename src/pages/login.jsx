import React, { useState } from 'react';
import { Lock, User, Activity } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.token);
        onLogin(data.user);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass">
        <div className="login-header">
          <div className="logo-icon">
            <Activity color="white" size={32} />
          </div>
          <h1>Admin Portal</h1>
          <p>Sarah AI Internal Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style>{`
        .login-wrapper {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
        }

        .login-card {
          width: 400px;
          padding: 3rem;
          text-align: center;
        }

        .login-header {
          margin-bottom: 2.5rem;
        }

        .logo-icon {
          background: var(--accent);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .input-group {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 12px;
          color: var(--text-secondary);
        }

        .input-group input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: white;
          outline: none;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Login;
