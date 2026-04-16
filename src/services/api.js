import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// List of public endpoints that don't require authentication
const publicEndpoints = [
  '/public/',
  '/apps',
  '/chat/session',
  '/chat/notify',
  '/analytics/track'
];

const isPublicEndpoint = (url) => {
  if (!url) return false;
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};

// Request interceptor - add token only for non-public endpoints
api.interceptors.request.use(
  (config) => {
    if (!isPublicEndpoint(config.url)) {
      const token = localStorage.getItem('hubToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isPublicEndpoint(error.config?.url)) {
      return Promise.resolve({ data: { success: false, data: [] } });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('hubToken');
      localStorage.removeItem('hubUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;