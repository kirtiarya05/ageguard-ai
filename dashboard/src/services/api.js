import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

// Auth
export const loginParent = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

// Dashboard
export const getDashboardAnalytics = async () => {
  const res = await api.get('/parents/dashboard');
  return res.data;
};

// Rules & Restrictions
export const updateRules = async (childId, rules) => {
  const res = await api.post('/parents/rules', { childId, ...rules });
  return res.data;
};

export const getRestrictions = async (childId) => {
  const res = await api.get(`/parents/restrictions?childId=${childId}`);
  return res.data;
};

// App Blocking
export const updateBlockedApps = async (childId, blockedApps) => {
  const res = await api.post('/parents/blocked-apps', { childId, blockedApps });
  return res.data;
};

// Device Lockdown (also via socket but REST persists state)
export const lockDevice = async (childId, locked) => {
  const res = await api.post('/parents/lock-device', { childId, locked });
  return res.data;
};

// Child Locations (Geofencing)
export const getChildLocations = async () => {
  const res = await api.get('/parents/child-locations');
  return res.data;
};

export default api;

