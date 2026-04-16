import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const posApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - add POS token
posApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('posToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
posApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('posToken');
      localStorage.removeItem('posUser');
      window.location.href = '/pos/login';
    }
    return Promise.reject(error);
  }
);

export default posApi;