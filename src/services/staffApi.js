import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const staffApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

staffApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

staffApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffUser');
      window.location.href = '/staff/login';
    }
    return Promise.reject(error);
  }
);

export default staffApi;