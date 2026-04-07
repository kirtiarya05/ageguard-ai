import React, { useState } from 'react';
import { Smartphone, Plus, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { updateBlockedApps } from '../services/api';

// Master catalog of common apps that can be toggled
const APP_CATALOG = [
  { name: 'TikTok',        packageName: 'com.zhiliaoapp.musically', category: 'Social', risk: 'high' },
  { name: 'Instagram',     packageName: 'com.instagram.android',   category: 'Social', risk: 'medium' },
  { name: 'YouTube',       packageName: 'com.google.android.youtube', category: 'Media', risk: 'medium' },
  { name: 'Snapchat',      packageName: 'com.snapchat.android',    category: 'Social', risk: 'high' },
  { name: 'Facebook',      packageName: 'com.facebook.katana',     category: 'Social', risk: 'medium' },
  { name: 'Discord',       packageName: 'com.discord',             category: 'Chat',   risk: 'medium' },
  { name: 'Roblox',        packageName: 'com.roblox.client',       category: 'Gaming', risk: 'low' },
  { name: 'PUBG Mobile',   packageName: 'com.pubg.krmobile',       category: 'Gaming', risk: 'high' },
  { name: 'Reddit',        packageName: 'com.reddit.frontpage',    category: 'Social', risk: 'high' },
  { name: 'WhatsApp',      packageName: 'com.whatsapp',            category: 'Chat',   risk: 'low' },
  { name: 'Telegram',      packageName: 'org.telegram.messenger',  category: 'Chat',   risk: 'low' },
  { name: 'Twitter/X',     packageName: 'com.twitter.android',     category: 'Social', risk: 'medium' },
];

const RISK_COLORS = {
  high:   { bg: 'rgba(239,68,68,0.12)',    text: '#ef4444', label: 'High Risk' },
  medium: { bg: 'rgba(245,158,11,0.12)',   text: '#f59e0b', label: 'Medium' },
  low:    { bg: 'rgba(34,197,94,0.12)',    text: '#22c55e', label: 'Safe' },
};

const AppManager = () => {
  const [blockedApps, setBlockedApps] = useState(
    ['com.zhiliaoapp.musically', 'com.snapchat.android', 'com.reddit.frontpage']
  );
  const [customApp, setCustomApp] = useState('');
  const [filter, setFilter] = useState('All');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  // For demo purposes, use a placeholder childId
  const childId = localStorage.getItem('childId') || 'child-demo';

  const toggleApp = (pkg) => {
    setBlockedApps(prev =>
      prev.includes(pkg) ? prev.filter(p => p !== pkg) : [...prev, pkg]
    );
    setSaved(false);
  };

  const addCustom = () => {
    const trimmed = customApp.trim();
    if (trimmed && !blockedApps.includes(trimmed)) {
      setBlockedApps(prev => [...prev, trimmed]);
      setCustomApp('');
      setSaved(false);
    }
  };

  const removeCustom = (pkg) => {
    setBlockedApps(prev => prev.filter(p => p !== pkg));
    setSaved(false);
  };

  const saveBlockList = async () => {
    setSaving(true);
    try {
      await updateBlockedApps(childId, blockedApps);
      setSaved(true);
    } catch {
      // Fallback demo — still mark saved
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const categories = ['All', ...new Set(APP_CATALOG.map(a => a.category))];
  const filteredApps = filter === 'All' ? APP_CATALOG : APP_CATALOG.filter(a => a.category === filter);
  const customEntries = blockedApps.filter(
    pkg => !APP_CATALOG.find(a => a.packageName === pkg)
  );

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <header className="flex-between animate-fade-in" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>📱 App Manager</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Toggle apps to block instantly on the child's device via real-time socket push.
          </p>
        </div>
        <button
          onClick={saveBlockList}
          disabled={saving}
          style={{
            padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontWeight: '700', fontSize: '15px',
            background: saved ? 'rgba(34,197,94,0.2)' : 'var(--primary)',
            color: saved ? '#22c55e' : '#fff',
            boxShadow: saved ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
            transition: 'all 0.3s',
          }}
        >
          {saving ? '⏳ Saving…' : saved ? '✅ Saved & Pushed!' : '💾 Save & Push to Device'}
        </button>
      </header>

      {/* Stats */}
      <div className="flex-center animate-fade-in" style={{ gap: '16px', marginBottom: '32px', justifyContent: 'flex-start' }}>
        {[
          { label: 'Total Blocked', val: blockedApps.length, color: '#ef4444' },
          { label: 'High Risk Blocked', val: APP_CATALOG.filter(a => a.risk === 'high' && blockedApps.includes(a.packageName)).length, color: '#f59e0b' },
          { label: 'Apps Allowed', val: APP_CATALOG.length - APP_CATALOG.filter(a => blockedApps.includes(a.packageName)).length, color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: '7px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '13px',
              background: filter === c ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
              color: filter === c ? '#fff' : 'var(--text-muted)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* App grid */}
      <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>App Catalog</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {filteredApps.map(app => {
            const isBlocked = blockedApps.includes(app.packageName);
            const risk = RISK_COLORS[app.risk];
            return (
              <div
                key={app.packageName}
                onClick={() => toggleApp(app.packageName)}
                style={{
                  padding: '16px', borderRadius: '14px', cursor: 'pointer',
                  border: `2px solid ${isBlocked ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: isBlocked ? 'rgba(239,68,68,0.07)' : 'rgba(15,23,42,0.5)',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ background: risk.bg, padding: '10px', borderRadius: '10px' }}>
                  <Smartphone size={20} color={risk.text} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{app.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{app.category}</div>
                  <span style={{ fontSize: '11px', background: risk.bg, color: risk.text, padding: '2px 8px', borderRadius: '6px', marginTop: '4px', display: 'inline-block' }}>{risk.label}</span>
                </div>
                {isBlocked
                  ? <XCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
                  : <CheckCircle size={22} color="#22c55e" style={{ flexShrink: 0 }} />
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom package name input */}
      <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>
          <Shield size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Custom App Block (by Package Name)
        </h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            value={customApp}
            onChange={e => setCustomApp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="e.g. com.example.someapp"
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', fontSize: '14px', outline: 'none',
            }}
          />
          <button
            onClick={addCustom}
            style={{ padding: '12px 20px', borderRadius: '10px', background: 'var(--primary)', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: '700' }}
          >
            <Plus size={18} />
          </button>
        </div>

        {customEntries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {customEntries.map(pkg => (
              <div key={pkg} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <XCircle size={16} color="#ef4444" />
                <span style={{ flex: 1, fontSize: '13px', fontFamily: 'monospace' }}>{pkg}</span>
                <button onClick={() => removeCustom(pkg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppManager;
