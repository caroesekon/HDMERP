import posApi from './posApi';

const posAuthService = {
  login: async (email, password) => {
    const response = await posApi.post('/pos/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await posApi.post('/pos/auth/register', { name, email, password, role });
    return response.data;
  },

  getMe: async () => {
    const response = await posApi.get('/pos/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await posApi.put('/pos/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};

export default posAuthService;