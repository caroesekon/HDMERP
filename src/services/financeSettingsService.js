import financeApi from './financeApi';

const financeSettingsService = {
  getSettings: async () => {
    try {
      const response = await financeApi.get('/finance/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching Finance settings:', error);
      const cached = localStorage.getItem('financeSettings');
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return {
        data: {
          general: { appName: 'Finance Manager', currency: 'KES', timezone: 'Africa/Nairobi' },
          contact: { email: '', phone: '', address: '' },
          accounting: { taxRate: 16 },
          invoice: { prefix: 'INV', nextNumber: 1001, dueDays: 30 },
          expense: { requireReceipt: true, approvalRequired: true },
          budget: { alertThreshold: 80 },
          report: { header: '', footer: '', showLogo: true }
        }
      };
    }
  },

  updateSettings: async (data) => {
    const response = await financeApi.put('/finance/settings', data);
    localStorage.setItem('financeSettings', JSON.stringify(response.data.data));
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await financeApi.post('/finance/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default financeSettingsService;