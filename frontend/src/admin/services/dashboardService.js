import { apiCall } from './api';

export const dashboardService = {
  // Get dashboard statistics
  getDashboard: async () => {
    return apiCall('/admin/dashboard');
  },

  // Get admin profile
  getProfile: async () => {
    return apiCall('/admin/profile');
  },

  // Update admin profile
  updateProfile: async (data) => {
    return apiCall('/admin/profile', {
      method: 'PUT',
      body: data,
    });
  },
};
