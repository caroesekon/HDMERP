import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const financeApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - add Finance token
financeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('financeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
financeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('financeToken');
      localStorage.removeItem('financeUser');
      // Redirect to FINANCE login, not POS
      if (window.location.pathname.startsWith('/finance')) {
        window.location.href = '/finance/login';
      }
    }
    return Promise.reject(error);
  }
);

export default financeApi;