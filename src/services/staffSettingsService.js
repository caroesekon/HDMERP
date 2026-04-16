import staffApi from './staffApi';

const staffSettingsService = {
  getSettings: async () => {
    try {
      const response = await staffApi.get('/staff/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching Staff settings:', error);
      const cached = localStorage.getItem('staffSettings');
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return {
        data: {
          general: { appName: 'Staff Manager', currency: 'KES', timezone: 'Africa/Nairobi' },
          contact: { email: '', phone: '', address: '' },
          payroll: { paymentDay: 25, overtimeRate: 1.5 },
          leave: { annualLeaveDays: 21, sickLeaveDays: 10, casualLeaveDays: 5 },
          attendance: { workStartTime: '08:00', workEndTime: '17:00', gracePeriod: 15 },
          payslip: { header: '', footer: 'This is a computer-generated payslip.', showLogo: true }
        }
      };
    }
  },

  updateSettings: async (data) => {
    const response = await staffApi.put('/staff/settings', data);
    localStorage.setItem('staffSettings', JSON.stringify(response.data.data));
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await staffApi.post('/staff/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default staffSettingsService;