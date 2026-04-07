import React, { useState, useEffect } from 'react';
import { BarChart2, ShieldAlert, Activity, Clock } from 'lucide-react';
import { useChild } from '../components/ChildContext';
import { getReport } from '../services/api';

// Simple SVG bar chart
const BarChart = ({ data }) => {
  if (!data?.length) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>No data</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.count}</div>
          <div style={{
            width: '100%', borderRadius: '6px 6px 0 0',
            height: `${(d.count / max) * 90}px`,
            background: 'linear-gradient(180deg, #6366f1, #818cf8)',
            minHeight: 4,
          }} />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', wordBreak: 'break-all', maxWidth: 70 }}>
            {d.content?.slice(0, 12)}
          </div>
        </div>
      ))}
    </div>
  );
};

const WeeklyReport = () => {
  const { activeChild } = useChild() || {};
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!activeChild?._id || activeChild._id === 'child-demo') {
      // Demo data
      setReport({
        childName: activeChild?.userId || 'Demo Child',
        totalEvents: 143, totalBlocked: 28, avgRisk: 41,
        screenTimeLimitHours: 3,
        topBlocked: [
          { content: 'tiktok.com', count: 9 },
          { content: 'violent games', count: 7 },
          { content: 'Instagram', count: 5 },
          { content: 'onlyfans.com', count: 3 },
          { content: 'reddit.com', count: 2 },
        ],
        recentLogs: [
          { action: 'URL_VISITED', content: 'tiktok.com', riskScore: 65, blocked: false, timestamp: new Date(Date.now() - 10 * 60 * 1000) },
          { action: 'APP_OPENED', content: 'Instagram', riskScore: 85, blocked: true, timestamp: new Date(Date.now() - 2 * 3600 * 1000) },
          { action: 'SEARCH_QUERY', content: 'violent games download', riskScore: 92, blocked: true, timestamp: new Date(Date.now() - 3 * 3600 * 1000) },
        ],
      });
      return;
    }
    setLoading(true);
    getReport(activeChild._id)
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeChild]);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Loading report…</div>;
  if (error)   return <div style={{ padding: 40, color: '#ef4444' }}>Error: {error}</div>;
  if (!report) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Select a child to view their report.</div>;

  const stats = [
    { label: 'Total Events',    val: report.totalEvents,    icon: Activity,    color: '#6366f1' },
    { label: 'Blocked',         val: report.totalBlocked,   icon: ShieldAlert, color: '#ef4444' },
    { label: 'Avg Risk Score',  val: report.avgRisk,        icon: BarChart2,   color: '#f59e0b' },
    { label: 'Screen Limit',    val: `${report.screenTimeLimitHours}h`, icon: Clock, color: '#22c55e' },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
      <header className="animate-fade-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>📊 Weekly Report</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Activity summary for <strong style={{ color: '#818cf8' }}>{report.childName}</strong>
        </p>
      </header>

      {/* Stats row */}
      <div className="flex-between animate-fade-in" style={{ gap: 20, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, padding: 24 }}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.label}</span>
              <s.icon size={20} color={s.color} />
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Top Blocked */}
        <div className="glass-panel animate-fade-in" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 24, borderBottom: '1px solid var(--border-glass)', paddingBottom: 14 }}>
            🚫 Top Blocked Content
          </h3>
          {report.topBlocked?.length ? (
            <BarChart data={report.topBlocked} />
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>No blocked events recorded.</div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="glass-panel animate-fade-in" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 20, borderBottom: '1px solid var(--border-glass)', paddingBottom: 14 }}>
            📋 Recent Activity Logs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto' }}>
            {(report.recentLogs || []).map((log, i) => (
              <div key={i} style={{ background: 'rgba(15,23,42,0.4)', padding: '12px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  padding: '6px 8px', borderRadius: 8,
                  background: log.blocked ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                }}>
                  {log.blocked ? <ShieldAlert size={14} color="#ef4444" /> : <Activity size={14} color="#6366f1" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.content}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {log.action} · Risk: {log.riskScore}
                  </div>
                </div>
                {log.blocked && (
                  <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>BLOCKED</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
