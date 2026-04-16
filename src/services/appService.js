import api from './api';

const appService = {
  // Get all available apps (public)
  getAvailableApps: async () => {
    try {
      const response = await api.get('/apps');
      return { data: response.data?.data || response.data || [] };
    } catch (error) {
      return { data: [] };
    }
  },

  // Get external apps only
  getExternalApps: async () => {
    try {
      const response = await api.get('/apps/external');
      return { data: response.data?.data || response.data || [] };
    } catch (error) {
      return { data: [] };
    }
  },

  // Get built-in apps only
  getBuiltInApps: async () => {
    try {
      const response = await api.get('/apps/builtin');
      return { data: response.data?.data || response.data || [] };
    } catch (error) {
      return { data: [] };
    }
  },

  // Get single app by ID
  getAppById: async (appId) => {
    try {
      const response = await api.get(`/apps/${appId}`);
      return response.data?.data || response.data;
    } catch (error) {
      return null;
    }
  },

  // Launch an app (requires auth for tracking)
  launchApp: async (appId) => {
    try {
      const response = await api.post(`/apps/${appId}/launch`);
      return response.data;
    } catch (error) {
      return { launchUrl: '/' };
    }
  },

  // Create new app (admin only)
  createApp: async (appData) => {
    try {
      const response = await api.post('/apps', appData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update app (admin only)
  updateApp: async (appId, appData) => {
    try {
      const response = await api.put(`/apps/${appId}`, appData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete app (admin only)
  deleteApp: async (appId) => {
    try {
      const response = await api.delete(`/apps/${appId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reorder apps (admin only)
  reorderApps: async (appOrders) => {
    try {
      const response = await api.post('/apps/reorder', { orders: appOrders });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default appService;