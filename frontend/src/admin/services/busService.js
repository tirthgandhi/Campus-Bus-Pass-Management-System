import { apiCall } from './api';

export const busService = {
  // Get all buses with pagination
  getBuses: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    return apiCall(`/admin/buses?${params.toString()}`);
  },

  // Get single bus
  getBusById: async (id) => {
    return apiCall(`/admin/buses/${id}`);
  },

  // Create new bus
  createBus: async (data) => {
    return apiCall('/admin/buses', {
      method: 'POST',
      body: data,
    });
  },

  // Update bus
  updateBus: async (id, data) => {
    return apiCall(`/admin/buses/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Delete bus
  deleteBus: async (id) => {
    return apiCall(`/admin/buses/${id}`, {
      method: 'DELETE',
    });
  },

  // Assign driver to bus
  assignDriverToBus: async (busId, driverId) => {
    return apiCall(`/admin/buses/${busId}/driver`, {
      method: 'PUT',
      body: { driverId },
    });
  },

  // Unassign driver from bus
  unassignDriverFromBus: async (busId) => {
    return apiCall(`/admin/buses/${busId}/driver`, {
      method: 'DELETE',
    });
  },
};
