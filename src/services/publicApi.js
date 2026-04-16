import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Public API instance - NO interceptors that redirect
const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// No request interceptor for auth token
// No response interceptor that redirects

// Just log errors without redirecting
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('Public API error:', error.config?.url, error.message);
    // Return a resolved promise with empty data to prevent app crash
    return Promise.resolve({ data: { success: false } });
  }
);

export default publicApi;