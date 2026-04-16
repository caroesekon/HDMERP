import posApi from './posApi';

const posAccountService = {
  // ==================== ACCOUNTS ====================
  getAccounts: async (params) => {
    try {
      const response = await posApi.get('/pos/accounts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching POS accounts:', error);
      return { data: [] };
    }
  },

  getAccount: async (id) => {
    const response = await posApi.get(`/pos/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data) => {
    const response = await posApi.post('/pos/accounts', data);
    return response.data;
  },

  updateAccount: async (id, data) => {
    const response = await posApi.put(`/pos/accounts/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id) => {
    const response = await posApi.delete(`/pos/accounts/${id}`);
    return response.data;
  },

  // ==================== INVOICES ====================
  getInvoices: async (params) => {
    try {
      const response = await posApi.get('/pos/invoices', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getInvoice: async (id) => {
    const response = await posApi.get(`/pos/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data) => {
    const response = await posApi.post('/pos/invoices', data);
    return response.data;
  },

  updateInvoice: async (id, data) => {
    const response = await posApi.put(`/pos/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await posApi.delete(`/pos/invoices/${id}`);
    return response.data;
  },

  markInvoiceAsPaid: async (id, data) => {
    const response = await posApi.post(`/pos/invoices/${id}/pay`, data);
    return response.data;
  },

  sendInvoiceEmail: async (id, data) => {
    const response = await posApi.post(`/pos/invoices/${id}/send-email`, data);
    return response.data;
  },

  sendInvoiceWhatsApp: async (id, data) => {
    const response = await posApi.post(`/pos/invoices/${id}/send-whatsapp`, data);
    return response.data;
  },

  // ==================== WITHDRAWALS ====================
  getWithdrawals: async (params) => {
    try {
      const response = await posApi.get('/pos/withdrawals', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getWithdrawal: async (id) => {
    const response = await posApi.get(`/pos/withdrawals/${id}`);
    return response.data;
  },

  createWithdrawal: async (data) => {
    const response = await posApi.post('/pos/withdrawals', data);
    return response.data;
  },

  deleteWithdrawal: async (id) => {
    const response = await posApi.delete(`/pos/withdrawals/${id}`);
    return response.data;
  },

  // ==================== USER MANAGEMENT ====================
  getUsers: async () => {
    try {
      const response = await posApi.get('/pos/auth/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [] };
    }
  },

  getUser: async (id) => {
    const response = await posApi.get(`/pos/auth/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await posApi.put(`/pos/auth/users/${id}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await posApi.patch(`/pos/auth/users/${id}/toggle`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await posApi.delete(`/pos/auth/users/${id}`);
    return response.data;
  }
};

export default posAccountService;