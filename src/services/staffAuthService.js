import staffApi from './staffApi';

const staffAuthService = {
  login: async (email, password) => {
    const response = await staffApi.post('/staff/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await staffApi.post('/staff/auth/register', { name, email, password, role });
    return response.data;
  },

  getMe: async () => {
    const response = await staffApi.get('/staff/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await staffApi.put('/staff/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};

export default staffAuthService;