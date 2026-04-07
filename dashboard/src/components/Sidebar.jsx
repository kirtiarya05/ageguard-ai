import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Smartphone, ShieldCheck,
  Moon, BarChart2, LogOut, ChevronDown,
} from 'lucide-react';
import { useChild } from './ChildContext';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/app-manager', icon: Smartphone,       label: 'App Manager'   },
  { to: '/rules',       icon: ShieldCheck,      label: 'Rules'         },
  { to: '/sleep',       icon: Moon,             label: 'Sleep Mode'    },
  { to: '/report',      icon: BarChart2,        label: 'Weekly Report' },
];

const Sidebar = () => {
  const navigate   = useNavigate();
  const { childList, activeChild, selectChild } = useChild() || {};

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', flexShrink: 0,
      background: 'rgba(15,23,42,0.97)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0', position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#f8fafc' }}>AgeGuard AI</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Parent Dashboard</div>
          </div>
        </div>
      </div>

      {/* Child Selector */}
      {childList?.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Active Child
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={activeChild?._id || ''}
              onChange={e => {
                const child = childList.find(c => c._id === e.target.value);
                if (child) selectChild(child);
              }}
              style={{
                width: '100%', padding: '9px 32px 9px 12px',
                borderRadius: 10, background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#f8fafc', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', appearance: 'none', outline: 'none',
              }}
            >
              {childList.map(c => (
                <option key={c._id} value={c._id} style={{ background: '#0f172a' }}>
                  {c.userId || c.email || c._id}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)', color: '#6366f1', pointerEvents: 'none',
            }} />
          </div>
          {activeChild?.isLocked && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
              🔒 Device is currently locked
            </div>
          )}
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              textDecoration: 'none', fontWeight: 600, fontSize: 14,
              transition: 'all 0.18s',
              background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
              color: isActive ? '#818cf8' : '#94a3b8',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, border: 'none',
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
