import api from './api';

const systemService = {
  // Get system settings (public)
  getSettings: async () => {
    try {
      const response = await api.get('/public/settings');
      let settingsData = response.data;
      if (response.data?.data) {
        settingsData = response.data.data;
      }
      return { data: settingsData };
    } catch (error) {
      return { 
        data: {
          general: {
            appName: 'HDM ERP',
            companyName: 'HDM Enterprises',
            companyEmail: 'info@hdm.com',
            companyPhone: '+254768784909',
            currency: 'KES',
            currencySymbol: 'Ksh'
          },
          branding: {
            heroHeadline: 'Business, Office and General Management Systems',
            tagline: 'Streamline your entire operation with integrated POS, Staff, Finance, and custom business tools.',
            primaryColor: '#3b82f6',
            secondaryColor: '#10b981'
          },
          features: {
            enablePOS: true,
            enableStaff: true,
            enableFinance: true,
            enableExternalApps: true,
            enableChat: true,
            enableAnalytics: true
          }
        }
      };
    }
  },

  // Update system settings (admin only)
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system health (admin only)
  getSystemHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      return {
        status: 'unknown',
        uptime: 0,
        environment: 'development',
        mongodb: { connected: false, state: 'unknown' },
        memory: { heapUsed: 0, heapTotal: 0, rss: 0 }
      };
    }
  },

  // Backup database (admin only)
  backupDatabase: async () => {
    try {
      const response = await api.post('/admin/backup');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Restore database (admin only)
  restoreDatabase: async (backupFile) => {
    try {
      const formData = new FormData();
      formData.append('backup', backupFile);
      const response = await api.post('/admin/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system logs (admin only)
  getSystemLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    } catch (error) {
      return { logs: [], total: 0 };
    }
  },

  // Clear system cache (admin only)
  clearCache: async () => {
    try {
      const response = await api.post('/admin/cache/clear');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system statistics (admin only)
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      return {
        users: { total: 0, active: 0 },
        apps: { total: 0, active: 0 },
        storage: { used: 0, total: 0 },
        requests: { total: 0, today: 0 }
      };
    }
  }
};

export default systemService;