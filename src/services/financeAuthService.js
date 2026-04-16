import financeApi from './financeApi';

const financeAuthService = {
  login: async (email, password) => {
    const response = await financeApi.post('/finance/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await financeApi.post('/finance/auth/register', { name, email, password, role });
    return response.data;
  },

  getMe: async () => {
    const response = await financeApi.get('/finance/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await financeApi.put('/finance/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};

export default financeAuthService;