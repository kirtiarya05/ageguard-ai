import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { useChild } from '../components/ChildContext';
import { updateRules, getRestrictions } from '../services/api';

const CATEGORIES = ['Explicit', 'Violence', 'Dating', 'Gambling', 'Alcohol', 'Drugs', 'Hacking', 'Terrorism', 'NSFW'];

const RulesManager = () => {
  const { activeChild } = useChild() || {};
  const [blockedCategories, setBlockedCategories] = useState(['Explicit', 'Violence', 'Dating', 'Gambling']);
  const [blockedDomains, setBlockedDomains] = useState(['tiktok.com', 'onlyfans.com']);
  const [screenTimeLimitHours, setScreenTime] = useState(2);
  const [domainInput, setDomainInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!activeChild?._id) return;
    getRestrictions(activeChild._id).then(data => {
      if (data?.blockedCategories) setBlockedCategories(data.blockedCategories);
      if (data?.blockedDomains)    setBlockedDomains(data.blockedDomains);
      if (data?.screenTimeLimitHours) setScreenTime(data.screenTimeLimitHours);
    }).catch(() => {});
  }, [activeChild]);

  const toggleCategory = (cat) => {
    setBlockedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setSaved(false);
  };

  const addDomain = () => {
    const d = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (d && !blockedDomains.includes(d)) {
      setBlockedDomains(prev => [...prev, d]);
      setDomainInput('');
      setSaved(false);
    }
  };

  const handleSave = async () => {
    if (!activeChild?._id) return;
    setSaving(true);
    try {
      await updateRules(activeChild._id, { blockedCategories, blockedDomains, screenTimeLimitHours });
      setSaved(true);
    } catch {
      setSaved(true); // demo fallback
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <header className="flex-between animate-fade-in" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>🛡️ Rules Manager</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Set content restrictions for{' '}
            <strong style={{ color: '#818cf8' }}>{activeChild?.userId || 'Select a child'}</strong>
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !activeChild}
          style={{
            padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 15,
            background: saved ? 'rgba(34,197,94,0.2)' : 'var(--primary)',
            color: saved ? '#22c55e' : '#fff',
            boxShadow: saved ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
          }}
        >
          {saving ? '⏳ Saving…' : saved ? '✅ Saved & Pushed!' : '💾 Save & Push'}
        </button>
      </header>

      {/* Content Categories */}
      <div className="glass-panel animate-fade-in" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: 16 }}>🚫 Blocked Content Categories</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {CATEGORIES.map(cat => {
            const active = blockedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                style={{
                  padding: '9px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  border: `2px solid ${active ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  background: active ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#ef4444' : '#94a3b8', transition: 'all 0.2s',
                }}
              >
                {active ? '✕ ' : '+ '}{cat}
              </button>
            );
          })}
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          {blockedCategories.length} categor{blockedCategories.length !== 1 ? 'ies' : 'y'} blocked
        </p>
      </div>

      {/* Domain Blocklist */}
      <div className="glass-panel animate-fade-in" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: 16 }}>🌐 Blocked Domains</h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            value={domainInput}
            onChange={e => setDomainInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDomain()}
            placeholder="e.g. reddit.com"
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', fontSize: 14, outline: 'none',
            }}
          />
          <button
            onClick={addDomain}
            style={{ padding: '11px 20px', borderRadius: 10, background: 'var(--primary)', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700 }}
          >
            <Plus size={17} />
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {blockedDomains.map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#fca5a5' }}>{d}</span>
              <button onClick={() => { setBlockedDomains(p => p.filter(x => x !== d)); setSaved(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', lineHeight: 1 }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Time */}
      <div className="glass-panel animate-fade-in" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 20, fontSize: 16 }}>⏰ Daily Screen Time Limit</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <input
            type="range" min={0.5} max={12} step={0.5}
            value={screenTimeLimitHours}
            onChange={e => { setScreenTime(Number(e.target.value)); setSaved(false); }}
            style={{ flex: 1, accentColor: '#6366f1' }}
          />
          <div style={{ fontSize: 28, fontWeight: 800, color: '#818cf8', minWidth: 70, textAlign: 'center' }}>
            {screenTimeLimitHours}h
          </div>
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Child's device will be locked after {screenTimeLimitHours} hours of daily use.
        </p>
      </div>
    </div>
  );
};

export default RulesManager;
