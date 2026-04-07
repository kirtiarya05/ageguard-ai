import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('PARENT'); // PARENT or CHILD
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, this would call the API. For now, logic for success:
    if (role === 'CHILD' && !userId) return alert('User ID is mandatory');
    navigate('/dashboard');
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        
        <div className="flex-col flex-center" style={{ marginBottom: '32px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Shield size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>AgeGuard AI</h2>
          <div className="flex-center" style={{ marginTop: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            <button 
              onClick={() => setRole('PARENT')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: role === 'PARENT' ? 'var(--primary)' : 'transparent', color: role === 'PARENT' ? 'white' : 'var(--text-muted)' }}
            >Parent Login</button>
            <button 
              onClick={() => setRole('CHILD')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: role === 'CHILD' ? 'var(--primary)' : 'transparent', color: role === 'CHILD' ? 'white' : 'var(--text-muted)' }}
            >Child Access</button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex-col" style={{ gap: '20px' }}>
          {role === 'PARENT' ? (
             <div style={{ position: 'relative' }}>
               <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
               <input 
                 type="email" 
                 placeholder="Parent Email" 
                 className="input-glass" 
                 style={{ paddingLeft: '48px' }}
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
          ) : (
            <>
              <div style={{ position: 'relative' }}>
                <Shield size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
                <input 
                  type="text" 
                  placeholder="Mandatory User ID" 
                  className="input-glass" 
                  style={{ paddingLeft: '48px' }}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
                <input 
                  type="email" 
                  placeholder="Parent Email (Optional)" 
                  className="input-glass" 
                  style={{ paddingLeft: '48px' }}
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>
            </>
          )}

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
            {role === 'PARENT' ? 'Access Parent Dashboard' : 'Start Safeguarded Session'} <ArrowRight size={18} />
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
