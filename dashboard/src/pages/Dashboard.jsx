import React, { useState } from 'react';
import { Activity, ShieldAlert, Monitor, Users, Settings } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const logs = [
    { id: 1, action: 'URL_VISITED', content: 'tiktok.com', score: 65, time: '10 mins ago', blocked: false },
    { id: 2, action: 'APP_OPENED', content: 'Instagram', score: 85, time: '2 hours ago', blocked: true },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <header className="flex-between animate-fade-in" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Global Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitoring Active Child Devices</p>
        </div>
        <div className="flex-center" style={{ gap: '16px' }}>
          <div className="flex-center" style={{ gap: '8px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
            AI Service Online
          </div>
          <button className="btn-primary flex-center" style={{ gap: '8px', background: 'var(--danger)', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}>
            <ShieldAlert size={18} />
            Emergency Lockdown
          </button>
          <button className="btn-primary flex-center" style={{ padding: '10px', borderRadius: '12px' }}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="flex-between animate-fade-in" style={{ gap: '24px', marginBottom: '40px', animationDelay: '0.1s' }}>
        {[
          { label: 'Active Devices', val: '1', icon: Monitor, color: '#3b82f6' },
          { label: 'Blocked Attempts', val: '12', icon: ShieldAlert, color: '#ef4444' },
          { label: 'Total Logs', val: '143', icon: Activity, color: '#10b981' }
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, padding: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
              <s.icon size={24} color={s.color} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="animate-fade-in">
        
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>Recent Activity Logs</h3>
          <div className="flex-col" style={{ gap: '16px' }}>
            {logs.map(log => (
              <div key={log.id} className="flex-between" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '12px' }}>
                <div className="flex-center" style={{ gap: '16px' }}>
                  <div style={{ background: log.blocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px' }}>
                     {log.blocked ? <ShieldAlert size={20} color="var(--danger)"/> : <Activity size={20} color="var(--primary)"/>}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{log.content}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{log.action} • {log.time}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: log.score > 70 ? 'var(--danger)' : 'var(--text-main)', fontWeight: '700' }}>Risk: {log.score}</div>
                  {log.blocked && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>BLOCKED</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
           <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>Current Rules</h3>
           <div className="flex-col" style={{ gap: '20px' }}>
             <div>
               <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Blocked Categories</div>
               <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                 {['Explicit', 'Violence', 'Dating'].map(c => (
                   <span key={c} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '4px 12px', borderRadius: '12px', fontSize: '14px' }}>{c}</span>
                 ))}
               </div>
             </div>
             <div>
               <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Screen Time</div>
               <div style={{ fontSize: '18px', fontWeight: '600' }}>2h 30m / Limit: 3h</div>
               <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                 <div style={{ width: '80%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}/>
               </div>
             </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
