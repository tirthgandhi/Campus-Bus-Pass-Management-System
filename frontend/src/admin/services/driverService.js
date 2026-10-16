import { apiCall } from './api';

export const driverService = {
  // Get all drivers with pagination
  getDrivers: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    return apiCall(`/admin/drivers?${params.toString()}`);
  },

  // Get single driver
  getDriverById: async (id) => {
    return apiCall(`/admin/drivers/${id}`);
  },

  // Create new driver
  createDriver: async (data) => {
    return apiCall('/admin/drivers', {
      method: 'POST',
      body: data,
    });
  },

  // Update driver
  updateDriver: async (id, data) => {
    return apiCall(`/admin/drivers/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Delete driver
  deleteDriver: async (id) => {
    return apiCall(`/admin/drivers/${id}`, {
      method: 'DELETE',
    });
  },
};
