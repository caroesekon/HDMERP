import posApi from './posApi';

const posSettingsService = {
  getSettings: async () => {
    try {
      const response = await posApi.get('/pos/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching POS settings:', error);
      // Return cached if available
      const cached = localStorage.getItem('posSettings');
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      // Return defaults
      return {
        data: {
          general: { appName: 'POS System', currency: 'KES', taxRate: 16 },
          contact: { email: '', phone: '', address: '' },
          receipt: { header: '', footer: 'Thank you for your business!', showLogo: true, showTax: true },
          invoice: { prefix: 'INV', nextNumber: 1001, terms: '' }
        }
      };
    }
  },

  updateSettings: async (data) => {
    const response = await posApi.put('/pos/settings', data);
    // Update cache
    localStorage.setItem('posSettings', JSON.stringify(response.data.data));
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await posApi.post('/pos/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default posSettingsService;