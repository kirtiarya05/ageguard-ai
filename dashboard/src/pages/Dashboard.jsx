import React, { useState, useEffect, useCallback } from 'react';
import { Activity, ShieldAlert, Monitor, MapPin, Bell, Settings, Wifi, WifiOff } from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Socket connection for the parent dashboard
let parentSocket = null;

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [childLocations, setChildLocations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lockedDevices, setLockedDevices] = useState({});
  const [connectedDevices, setConnectedDevices] = useState({});

  const parentId = localStorage.getItem('userId') || 'parent-demo';

  const logs = [
    { id: 1, action: 'URL_VISITED', content: 'tiktok.com', score: 65, time: '10 mins ago', blocked: false },
    { id: 2, action: 'APP_OPENED', content: 'Instagram', score: 85, time: '2 hours ago', blocked: true },
    { id: 3, action: 'SEARCH_QUERY', content: 'violent games download', score: 92, time: '3 hours ago', blocked: true },
  ];

  const addNotification = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 8));
  }, []);

  useEffect(() => {
    // Connect parent dashboard to socket
    parentSocket = io(BACKEND_URL, { transports: ['websocket'] });

    parentSocket.on('connect', () => {
      setIsConnected(true);
      parentSocket.emit('register-parent', { parentId });
      addNotification('Real-time connection established ✅', 'success');
    });

    parentSocket.on('disconnect', () => {
      setIsConnected(false);
      addNotification('Connection lost — reconnecting…', 'warning');
    });

    parentSocket.on('child-location', ({ userId, latitude, longitude, timestamp }) => {
      setChildLocations(prev => {
        const existing = prev.filter(l => l.userId !== userId);
        return [...existing, { userId, latitude, longitude, timestamp }];
      });
      addNotification(`📍 Location update from device ${userId}`, 'info');
    });

    parentSocket.on('device-list-updated', ({ connectedDevices: devices }) => {
      setConnectedDevices(devices);
      addNotification(`📱 Device list updated (${Object.keys(devices).length} online)`, 'info');
    });

    return () => { parentSocket?.disconnect(); };
  }, [addNotification, parentId]);

  const handleLockdown = async (childId, lock = true) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/parents/lock-device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, locked: lock }),
      });
      if (res.ok) {
        setLockedDevices(prev => ({ ...prev, [childId]: lock }));
        addNotification(
          lock ? `🔒 Device ${childId} LOCKED` : `🔓 Device ${childId} unlocked`,
          lock ? 'danger' : 'success'
        );
      }
    } catch (err) {
      addNotification('⚠️ Failed to send lockdown signal', 'warning');
    }
  };

  const handleEmergencyLockdown = () => {
    // Lock all connected child devices
    const ids = Object.keys(connectedDevices);
    if (ids.length === 0) {
      addNotification('⚠️ No devices currently connected', 'warning');
      return;
    }
    ids.forEach(id => handleLockdown(id, true));
  };

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', border: 'none',
    fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
  });

  const notifColor = { success: 'var(--success)', danger: 'var(--danger)', warning: '#f59e0b', info: 'var(--primary)' };

  return (
    <div style={{ padding: '40px', maxWidth: '1300px', margin: '0 auto' }}>

      {/* Header */}
      <header className="flex-between animate-fade-in" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>AgeGuard AI Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Real-Time Child Device Monitoring</p>
        </div>
        <div className="flex-center" style={{ gap: '12px' }}>
          {/* Connection status badge */}
          <div className="flex-center" style={{ gap: '8px', background: isConnected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isConnected ? 'var(--success)' : 'var(--danger)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isConnected ? 'Live' : 'Disconnected'}
          </div>
          <button
            className="btn-primary flex-center"
            style={{ gap: '8px', background: 'var(--danger)', padding: '10px 18px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(239,68,68,0.4)', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: '700' }}
            onClick={handleEmergencyLockdown}
          >
            <ShieldAlert size={18} />
            Emergency Lockdown
          </button>
          <button className="btn-primary flex-center" style={{ padding: '10px', borderRadius: '12px' }}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="flex-between animate-fade-in" style={{ gap: '20px', marginBottom: '32px', animationDelay: '0.1s' }}>
        {[
          { label: 'Online Devices', val: Object.keys(connectedDevices).length.toString(), icon: Monitor, color: '#3b82f6' },
          { label: 'Blocked Attempts', val: '12', icon: ShieldAlert, color: '#ef4444' },
          { label: 'Total Logs', val: '143', icon: Activity, color: '#10b981' },
          { label: 'Locations Tracked', val: childLocations.length.toString(), icon: MapPin, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, padding: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{s.label}</span>
              <s.icon size={22} color={s.color} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex-center" style={{ gap: '8px', marginBottom: '28px', justifyContent: 'flex-start' }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'locations', label: '📍 Locations' },
          { key: 'devices', label: '📱 Devices' },
          { key: 'notifications', label: `🔔 Alerts (${notifications.length})` },
        ].map(t => (
          <button key={t.key} style={tabStyle(t.key)} onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>Recent Activity Logs</h3>
            <div className="flex-col" style={{ gap: '14px' }}>
              {logs.map(log => (
                <div key={log.id} className="flex-between" style={{ background: 'rgba(15,23,42,0.4)', padding: '14px', borderRadius: '12px' }}>
                  <div className="flex-center" style={{ gap: '14px' }}>
                    <div style={{ background: log.blocked ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '10px' }}>
                      {log.blocked ? <ShieldAlert size={18} color="var(--danger)" /> : <Activity size={18} color="var(--primary)" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{log.content}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{log.action} • {log.time}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: log.score > 70 ? 'var(--danger)' : 'var(--text-main)', fontWeight: '700' }}>Risk: {log.score}</div>
                    {log.blocked && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>BLOCKED</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>Current Rules</h3>
            <div className="flex-col" style={{ gap: '20px' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Blocked Categories</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Explicit', 'Violence', 'Dating', 'Gambling'].map(c => (
                    <span key={c} style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--danger)', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Screen Time</div>
                <div style={{ fontSize: '17px', fontWeight: '600' }}>2h 30m / Limit: 3h</div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>📍 Child Locations (Live)</h3>
          {childLocations.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '15px' }}>
              <MapPin size={40} style={{ marginBottom: '16px', opacity: 0.4 }} />
              <p>No location data yet. Locations are sent from the child's device in real-time via WebSockets.</p>
            </div>
          ) : (
            <div className="flex-col" style={{ gap: '16px' }}>
              {childLocations.map(loc => (
                <div key={loc.userId} style={{ background: 'rgba(15,23,42,0.5)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <MapPin size={22} color="#f59e0b" />
                  <div>
                    <div style={{ fontWeight: '600' }}>Device: {loc.userId}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Lat: {loc.latitude?.toFixed(5)}, Lng: {loc.longitude?.toFixed(5)} — {new Date(loc.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`}
                    target="_blank" rel="noreferrer"
                    style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Open in Maps
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>📱 Connected Devices</h3>
          {Object.keys(connectedDevices).length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              <Monitor size={40} style={{ marginBottom: '16px', opacity: 0.4 }} />
              <p>No devices connected. Child devices appear here once they log into the mobile app.</p>
            </div>
          ) : (
            <div className="flex-col" style={{ gap: '14px' }}>
              {Object.entries(connectedDevices).map(([userId, socketId]) => (
                <div key={userId} style={{ background: 'rgba(15,23,42,0.5)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>User: {userId}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Socket: {socketId}</div>
                  </div>
                  <button
                    onClick={() => handleLockdown(userId, !lockedDevices[userId])}
                    style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', background: lockedDevices[userId] ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: lockedDevices[userId] ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {lockedDevices[userId] ? '🔓 Unlock' : '🔒 Lock'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>🔔 Real-Time Alerts</h3>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              <Bell size={40} style={{ marginBottom: '16px', opacity: 0.4 }} />
              <p>No alerts yet. Events will appear here in real-time.</p>
            </div>
          ) : (
            <div className="flex-col" style={{ gap: '10px' }}>
              {notifications.map(n => (
                <div key={n.id} style={{ background: 'rgba(15,23,42,0.5)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `3px solid ${notifColor[n.type] || 'var(--primary)'}` }}>
                  <div style={{ flex: 1, fontSize: '14px' }}>{n.msg}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
