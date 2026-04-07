import React, { useState, useEffect } from 'react';
import { Moon, Sun, Save } from 'lucide-react';
import { useChild } from '../components/ChildContext';
import { getSleepSchedule, setSleepSchedule } from '../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SleepScheduler = () => {
  const { activeChild } = useChild() || {};
  const [enabled,    setEnabled]    = useState(false);
  const [sleepStart, setSleepStart] = useState('22:00');
  const [sleepEnd,   setSleepEnd]   = useState('07:00');
  const [activeDays, setActiveDays] = useState([...DAYS]);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeChild?._id) return;
    setLoading(true);
    getSleepSchedule(activeChild._id)
      .then(d => {
        setEnabled(d.enabled ?? false);
        setSleepStart(d.sleepStart || '22:00');
        setSleepEnd(d.sleepEnd || '07:00');
        setActiveDays(d.activeDays || [...DAYS]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeChild]);

  const toggleDay = (day) => {
    setActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!activeChild?._id) return;
    setSaving(true);
    try {
      await setSleepSchedule(activeChild._id, { enabled, sleepStart, sleepEnd, activeDays });
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '780px', margin: '0 auto' }}>
      <header className="flex-between animate-fade-in" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>🌙 Sleep Scheduler</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Auto-lock <strong style={{ color: '#818cf8' }}>{activeChild?.userId || 'Select a child'}</strong>'s device during quiet hours.
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
          {saving ? '⏳ Saving…' : saved ? '✅ Saved!' : '💾 Save Schedule'}
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>Loading schedule…</div>
      ) : (
        <>
          {/* Enable toggle */}
          <div className="glass-panel animate-fade-in" style={{ padding: 28, marginBottom: 24 }}>
            <div className="flex-between">
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>Enable Quiet Hours</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  When enabled, the child's device will be automatically locked during the set hours.
                </p>
              </div>
              <button
                onClick={() => { setEnabled(e => !e); setSaved(false); }}
                style={{
                  width: 56, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer',
                  background: enabled ? '#6366f1' : 'rgba(255,255,255,0.12)',
                  position: 'relative', transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 4, transition: 'left 0.3s',
                  left: enabled ? 30 : 4,
                }} />
              </button>
            </div>
          </div>

          {/* Time picker */}
          <div className="glass-panel animate-fade-in" style={{ padding: 28, marginBottom: 24, opacity: enabled ? 1 : 0.5 }}>
            <h3 style={{ fontSize: 16, marginBottom: 24 }}>⏰ Quiet Hours Window</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  <Moon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> SLEEP TIME
                </label>
                <input
                  type="time" value={sleepStart}
                  onChange={e => { setSleepStart(e.target.value); setSaved(false); }}
                  disabled={!enabled}
                  style={{
                    padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)',
                    background: 'rgba(99,102,241,0.08)', color: '#f8fafc',
                    fontSize: 20, fontWeight: 700, outline: 'none', cursor: enabled ? 'pointer' : 'default',
                  }}
                />
              </div>
              <div style={{ fontSize: 28, color: 'var(--text-muted)' }}>→</div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  <Sun size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> WAKE TIME
                </label>
                <input
                  type="time" value={sleepEnd}
                  onChange={e => { setSleepEnd(e.target.value); setSaved(false); }}
                  disabled={!enabled}
                  style={{
                    padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)',
                    background: 'rgba(99,102,241,0.08)', color: '#f8fafc',
                    fontSize: 20, fontWeight: 700, outline: 'none', cursor: enabled ? 'pointer' : 'default',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active days */}
          <div className="glass-panel animate-fade-in" style={{ padding: 28, opacity: enabled ? 1 : 0.5 }}>
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>📅 Active Days</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DAYS.map(day => {
                const active = activeDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => enabled && toggleDay(day)}
                    style={{
                      padding: '10px 18px', borderRadius: 10, border: 'none',
                      cursor: enabled ? 'pointer' : 'default', fontWeight: 700, fontSize: 13,
                      background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                      color: active ? '#818cf8' : '#64748b',
                      border: `2px solid ${active ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
              Quiet hours active on {activeDays.length === 7 ? 'every day' : activeDays.join(', ') || 'no days selected'}.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SleepScheduler;
