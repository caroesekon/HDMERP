import api from './api';

export const chatApi = {
  createSession: async (sessionId) => {
    try {
      const response = await api.post('/chat/session', { sessionId });
      return response.data;
    } catch (error) {
      console.debug('Chat session error:', error?.message);
      return { success: true, session: { sessionId, messages: [] } };
    }
  },

  saveMessage: async (sessionId, message) => {
    try {
      const response = await api.post(`/chat/${sessionId}/message`, { message });
      return response.data;
    } catch (error) {
      console.debug('Save message error:', error?.message);
      return { success: false };
    }
  },

  getHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chat/${sessionId}/history`);
      return response.data;
    } catch (error) {
      console.debug('Get history error:', error?.message);
      return { success: false, messages: [] };
    }
  },

  getStatus: async (sessionId) => {
    try {
      const response = await api.get(`/chat/${sessionId}/status`);
      return response.data;
    } catch (error) {
      console.debug('Get status error:', error?.message);
      return { success: false, status: { exists: false } };
    }
  },

  notifyAdmin: async (sessionId, messages, userInfo) => {
    try {
      const response = await api.post('/chat/notify', { sessionId, messages, userInfo });
      return response.data;
    } catch (error) {
      console.debug('Notify admin error:', error?.message);
      return { success: true, fallback: true };
    }
  }
};

export default chatApi;