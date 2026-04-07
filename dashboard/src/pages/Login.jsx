import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { loginParent, setAuthToken } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginParent(email, password);
      setAuthToken(data.token);
      localStorage.setItem('userId', data._id || data.userId || '');
      localStorage.setItem('userEmail', data.email || '');
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed — check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>

        <div className="flex-col flex-center" style={{ marginBottom: '32px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Shield size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>AgeGuard AI</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Parent Dashboard Login</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <AlertCircle size={15} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex-col" style={{ gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input
              type="email" placeholder="Parent Email" className="input-glass"
              style={{ paddingLeft: '48px' }} value={email}
              onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input
              type="password" placeholder="Password" className="input-glass"
              style={{ paddingLeft: '48px' }} value={password}
              onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-center"
            style={{ width: '100%', marginTop: '10px', gap: '8px',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '⏳ Logging in…' : 'Access Parent Dashboard'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Secure, Encrypted, and COPPA Compliant.
        </div>
      </div>
    </div>
  );
};

export default Login;
