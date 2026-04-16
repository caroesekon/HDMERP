import staffApi from './staffApi';

const staffService = {
  // ==================== STAFF (EMPLOYEES) ====================
  getAllStaff: async (params) => {
    try {
      const response = await staffApi.get('/staff', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      return { data: [], count: 0 };
    }
  },

  getStaff: async (id) => {
    const response = await staffApi.get(`/staff/${id}`);
    return response.data;
  },

  createStaff: async (data) => {
    const response = await staffApi.post('/staff', data);
    return response.data;
  },

  updateStaff: async (id, data) => {
    const response = await staffApi.put(`/staff/${id}`, data);
    return response.data;
  },

  deleteStaff: async (id) => {
    const response = await staffApi.delete(`/staff/${id}`);
    return response.data;
  },

  // ==================== DEPARTMENTS ====================
  getDepartments: async () => {
    try {
      const response = await staffApi.get('/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { data: [] };
    }
  },

  getDepartment: async (id) => {
    const response = await staffApi.get(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await staffApi.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await staffApi.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await staffApi.delete(`/departments/${id}`);
    return response.data;
  },

  getDepartmentHierarchy: async () => {
    try {
      const response = await staffApi.get('/departments/hierarchy');
      return response.data;
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      return { data: [] };
    }
  },

  // ==================== ATTENDANCE ====================
  checkIn: async (staffId) => {
    const response = await staffApi.post('/attendance/check-in', { staffId });
    return response.data;
  },

  checkOut: async (staffId) => {
    const response = await staffApi.post('/attendance/check-out', { staffId });
    return response.data;
  },

  getStaffAttendance: async (staffId, params) => {
    const response = await staffApi.get(`/attendance/staff/${staffId}`, { params });
    return response.data;
  },

  getTodayAttendance: async () => {
    try {
      const response = await staffApi.get('/attendance/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      return { data: { total: 0, present: 0, absent: 0, late: 0, records: [] } };
    }
  },

  markAbsent: async (data) => {
    const response = await staffApi.post('/attendance/mark-absent', data);
    return response.data;
  },

  // ==================== PAYROLL ====================
  getAllPayrolls: async (params) => {
    try {
      const response = await staffApi.get('/payroll', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      return { data: [] };
    }
  },

  getPayroll: async (id) => {
    const response = await staffApi.get(`/payroll/${id}`);
    return response.data;
  },

  generatePayroll: async (data) => {
    const response = await staffApi.post('/payroll/generate', data);
    return response.data;
  },

  updatePayroll: async (id, data) => {
    const response = await staffApi.put(`/payroll/${id}`, data);
    return response.data;
  },

  markAsPaid: async (id, data) => {
    const response = await staffApi.post(`/payroll/${id}/pay`, data);
    return response.data;
  },

  getPayrollSummary: async () => {
    try {
      const response = await staffApi.get('/payroll/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll summary:', error);
      return { data: { currentMonth: { total: 0, count: 0 }, pendingCount: 0 } };
    }
  },

  // ==================== LEAVE ====================
  getLeaves: async (params) => {
    try {
      const response = await staffApi.get('/leave', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaves:', error);
      return { data: [] };
    }
  },

  getLeave: async (id) => {
    const response = await staffApi.get(`/leave/${id}`);
    return response.data;
  },

  applyLeave: async (data) => {
    const response = await staffApi.post('/leave', data);
    return response.data;
  },

  updateLeave: async (id, data) => {
    const response = await staffApi.put(`/leave/${id}`, data);
    return response.data;
  },

  updateLeaveStatus: async (id, status) => {
    const response = await staffApi.patch(`/leave/${id}/status`, { status });
    return response.data;
  },

  deleteLeave: async (id) => {
    const response = await staffApi.delete(`/leave/${id}`);
    return response.data;
  },

  getLeaveBalance: async (staffId) => {
    try {
      const response = await staffApi.get(`/leave/balance/${staffId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      return { data: { entitled: 0, taken: 0, remaining: 0 } };
    }
  },

  // ==================== PERFORMANCE REVIEWS ====================
  getPerformanceReviews: async (params) => {
    try {
      const response = await staffApi.get('/performance', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      return { data: [] };
    }
  },

  getPerformanceReview: async (id) => {
    const response = await staffApi.get(`/performance/${id}`);
    return response.data;
  },

  createPerformanceReview: async (data) => {
    const response = await staffApi.post('/performance', data);
    return response.data;
  },

  updatePerformanceReview: async (id, data) => {
    const response = await staffApi.put(`/performance/${id}`, data);
    return response.data;
  },

  deletePerformanceReview: async (id) => {
    const response = await staffApi.delete(`/performance/${id}`);
    return response.data;
  },

  getStaffPerformanceReviews: async (staffId) => {
    try {
      const response = await staffApi.get(`/performance/staff/${staffId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff performance:', error);
      return { data: [] };
    }
  },

  getPerformanceSummary: async () => {
    try {
      const response = await staffApi.get('/performance/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      return { data: { totalReviews: 0, completedReviews: 0, pendingReviews: 0, averageRating: 0 } };
    }
  },

  // ==================== USER MANAGEMENT ====================
  getUsers: async () => {
    try {
      const response = await staffApi.get('/staff/auth/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [] };
    }
  },

  getUser: async (id) => {
    const response = await staffApi.get(`/staff/auth/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await staffApi.put(`/staff/auth/users/${id}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await staffApi.patch(`/staff/auth/users/${id}/toggle`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await staffApi.delete(`/staff/auth/users/${id}`);
    return response.data;
  },

  // ==================== SETTINGS ====================
  getSettings: async () => {
    try {
      const response = await staffApi.get('/staff/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff settings:', error);
      return { data: {} };
    }
  },

  updateSettings: async (data) => {
    const response = await staffApi.put('/staff/settings', data);
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

export default staffService;