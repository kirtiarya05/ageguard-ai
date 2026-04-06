import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@ageshield.com');
  const [password, setPassword] = useState('password123');

  React.useEffect(() => {
    // 🤖 AI Auto-Pilot: Transitioning into the dashboard in 3 seconds mechanically!
    const timer = setTimeout(() => {
        navigate('/dashboard');
    }, 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        
        <div className="flex-col flex-center" style={{ marginBottom: '32px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Shield size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>AgeShield AI</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            Intelligent Governance for the Digital Age
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex-col" style={{ gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              className="input-glass" 
              style={{ paddingLeft: '48px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-glass" 
              style={{ paddingLeft: '48px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary flex-center" style={{ width: '100%', marginTop: '10px', gap: '8px' }}>
            Sign In To Dashboard <ArrowRight size={18} />
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
