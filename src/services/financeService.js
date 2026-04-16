import financeApi from './financeApi';

const financeService = {
  // ==================== TRANSACTIONS ====================
  getTransactions: async (params) => {
    try {
      const response = await financeApi.get('/finance/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { data: [] };
    }
  },

  getTransaction: async (id) => {
    const response = await financeApi.get(`/finance/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data) => {
    const response = await financeApi.post('/finance/transactions', data);
    return response.data;
  },

  updateTransaction: async (id, data) => {
    const response = await financeApi.put(`/finance/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await financeApi.delete(`/finance/transactions/${id}`);
    return response.data;
  },

  getTransactionSummary: async (params) => {
    try {
      const response = await financeApi.get('/finance/transactions/summary', { params });
      return response.data;
    } catch (error) {
      return { data: { totalIncome: 0, totalExpense: 0, netCashflow: 0 } };
    }
  },

  // ==================== EXPENSES ====================
  getExpenses: async (params) => {
    try {
      const response = await financeApi.get('/finance/expenses', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getExpense: async (id) => {
    const response = await financeApi.get(`/finance/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await financeApi.post('/finance/expenses', data, config);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await financeApi.put(`/finance/expenses/${id}`, data, config);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await financeApi.delete(`/finance/expenses/${id}`);
    return response.data;
  },

  approveExpense: async (id) => {
    const response = await financeApi.post(`/finance/expenses/${id}/approve`);
    return response.data;
  },

  // ==================== INCOME ====================
  getIncomes: async (params) => {
    try {
      const response = await financeApi.get('/finance/income', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getIncome: async (id) => {
    const response = await financeApi.get(`/finance/income/${id}`);
    return response.data;
  },

  createIncome: async (data) => {
    const response = await financeApi.post('/finance/income', data);
    return response.data;
  },

  updateIncome: async (id, data) => {
    const response = await financeApi.put(`/finance/income/${id}`, data);
    return response.data;
  },

  deleteIncome: async (id) => {
    const response = await financeApi.delete(`/finance/income/${id}`);
    return response.data;
  },

  // ==================== ACCOUNTS ====================
  getAccounts: async (params) => {
    try {
      const response = await financeApi.get('/finance/accounts', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getAccount: async (id) => {
    const response = await financeApi.get(`/finance/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data) => {
    const response = await financeApi.post('/finance/accounts', data);
    return response.data;
  },

  updateAccount: async (id, data) => {
    const response = await financeApi.put(`/finance/accounts/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id) => {
    const response = await financeApi.delete(`/finance/accounts/${id}`);
    return response.data;
  },

  // ==================== BUDGETS ====================
  getBudgets: async (params) => {
    try {
      const response = await financeApi.get('/finance/budgets', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getBudget: async (id) => {
    const response = await financeApi.get(`/finance/budgets/${id}`);
    return response.data;
  },

  createBudget: async (data) => {
    const response = await financeApi.post('/finance/budgets', data);
    return response.data;
  },

  updateBudget: async (id, data) => {
    const response = await financeApi.put(`/finance/budgets/${id}`, data);
    return response.data;
  },

  deleteBudget: async (id) => {
    const response = await financeApi.delete(`/finance/budgets/${id}`);
    return response.data;
  },

  // ==================== INVOICES ====================
  getInvoices: async (params) => {
    try {
      const response = await financeApi.get('/finance/invoices', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getInvoice: async (id) => {
    const response = await financeApi.get(`/finance/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data) => {
    const response = await financeApi.post('/finance/invoices', data);
    return response.data;
  },

  updateInvoice: async (id, data) => {
    const response = await financeApi.put(`/finance/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await financeApi.delete(`/finance/invoices/${id}`);
    return response.data;
  },

  markInvoiceAsPaid: async (id, data) => {
    const response = await financeApi.post(`/finance/invoices/${id}/pay`, data);
    return response.data;
  },

  sendInvoiceEmail: async (id, data) => {
    const response = await financeApi.post(`/finance/invoices/${id}/send-email`, data);
    return response.data;
  },

  sendInvoiceWhatsApp: async (id, data) => {
    const response = await financeApi.post(`/finance/invoices/${id}/send-whatsapp`, data);
    return response.data;
  },

  // ==================== WITHDRAWALS ====================
  getWithdrawals: async (params) => {
    try {
      const response = await financeApi.get('/finance/withdrawals', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getWithdrawal: async (id) => {
    const response = await financeApi.get(`/finance/withdrawals/${id}`);
    return response.data;
  },

  createWithdrawal: async (data) => {
    const response = await financeApi.post('/finance/withdrawals', data);
    return response.data;
  },

  deleteWithdrawal: async (id) => {
    const response = await financeApi.delete(`/finance/withdrawals/${id}`);
    return response.data;
  },

  // ==================== USER MANAGEMENT ====================
  getUsers: async () => {
    try {
      const response = await financeApi.get('/finance/auth/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [] };
    }
  },

  getUser: async (id) => {
    const response = await financeApi.get(`/finance/auth/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await financeApi.put(`/finance/auth/users/${id}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await financeApi.patch(`/finance/auth/users/${id}/toggle`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await financeApi.delete(`/finance/auth/users/${id}`);
    return response.data;
  },

  // ==================== REPORTS ====================
  getProfitLoss: async (params) => {
    try {
      const response = await financeApi.get('/finance/reports/profit-loss', { params });
      return response.data;
    } catch (error) {
      return { data: { revenue: 0, expenses: 0, payroll: 0, netProfit: 0 } };
    }
  },

  getBalanceSheet: async (params) => {
    try {
      const response = await financeApi.get('/finance/reports/balance-sheet', { params });
      return response.data;
    } catch (error) {
      return { data: { assets: 0, liabilities: 0, equity: 0 } };
    }
  },

  getCashFlow: async (params) => {
    try {
      const response = await financeApi.get('/finance/reports/cash-flow', { params });
      return response.data;
    } catch (error) {
      return { data: { operating: 0, investing: 0, financing: 0, netCashFlow: 0 } };
    }
  },

  getDashboardSummary: async () => {
    try {
      const response = await financeApi.get('/finance/reports/dashboard');
      return response.data;
    } catch (error) {
      return { data: { todaySales: 0, monthSales: 0, pendingPayroll: 0, lowStock: 0 } };
    }
  }
};

export default financeService;