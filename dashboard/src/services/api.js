import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const loginParent = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getDashboardAnalytics = async () => {
    const res = await api.get('/parents/dashboard');
    return res.data;
};

export default api;
