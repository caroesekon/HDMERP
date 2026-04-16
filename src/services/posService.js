import posApi from './posApi';

const posService = {
  // ==================== PRODUCTS ====================
  getProducts: async (params) => {
    try {
      const response = await posApi.get('/pos/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], count: 0 };
    }
  },

  getProduct: async (id) => {
    const response = await posApi.get(`/pos/products/${id}`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await posApi.post('/pos/products', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await posApi.put(`/pos/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await posApi.delete(`/pos/products/${id}`);
    return response.data;
  },

  adjustInventory: async (id, data) => {
    const response = await posApi.post(`/pos/products/${id}/inventory`, data);
    return response.data;
  },

  // ==================== CATEGORIES ====================
  getCategories: async () => {
    try {
      const response = await posApi.get('/pos/categories');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  createCategory: async (data) => {
    const response = await posApi.post('/pos/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await posApi.put(`/pos/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await posApi.delete(`/pos/categories/${id}`);
    return response.data;
  },

  // ==================== SALES ====================
  getSales: async (params) => {
    try {
      const response = await posApi.get('/pos/sales', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getSale: async (id) => {
    const response = await posApi.get(`/pos/sales/${id}`);
    return response.data;
  },

  createSale: async (data) => {
    const response = await posApi.post('/pos/sales', data);
    return response.data;
  },

  refundSale: async (id, data) => {
    const response = await posApi.post(`/pos/sales/${id}/refund`, data);
    return response.data;
  },

  // ==================== CUSTOMERS ====================
  getCustomers: async (params) => {
    try {
      const response = await posApi.get('/pos/customers', { params });
      return response.data;
    } catch (error) {
      return { data: [], count: 0 };
    }
  },

  getCustomer: async (id) => {
    const response = await posApi.get(`/pos/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data) => {
    const response = await posApi.post('/pos/customers', data);
    return response.data;
  },

  updateCustomer: async (id, data) => {
    const response = await posApi.put(`/pos/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await posApi.delete(`/pos/customers/${id}`);
    return response.data;
  },

  // ==================== INVENTORY ====================
  getInventoryMovements: async (params) => {
    try {
      const response = await posApi.get('/pos/inventory', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getLowStock: async () => {
    try {
      const response = await posApi.get('/pos/inventory/low-stock');
      return response.data;
    } catch (error) {
      return { data: [], count: 0 };
    }
  },

  getInventorySummary: async () => {
    try {
      const response = await posApi.get('/pos/inventory/summary');
      return response.data;
    } catch (error) {
      return { data: { totalProducts: 0, lowStock: 0, outOfStock: 0 } };
    }
  },

  // ==================== REPORTS ====================
  getSalesReport: async (params) => {
    try {
      const response = await posApi.get('/pos/reports/sales', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getTopProducts: async () => {
    try {
      const response = await posApi.get('/pos/reports/top-products');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }
};

export default posService;