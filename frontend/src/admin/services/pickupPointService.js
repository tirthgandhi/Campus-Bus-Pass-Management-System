import { apiCall } from './api';

export const pickupPointService = {
  // Get all pickup points with pagination
  getPickupPoints: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    return apiCall(`/admin/pickup-points?${params.toString()}`);
  },

  // Get single pickup point
  getPickupPointById: async (id) => {
    return apiCall(`/admin/pickup-points/${id}`);
  },

  // Create new pickup point
  createPickupPoint: async (data) => {
    return apiCall('/admin/pickup-points', {
      method: 'POST',
      body: data,
    });
  },

  // Update pickup point
  updatePickupPoint: async (id, data) => {
    return apiCall(`/admin/pickup-points/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Delete pickup point
  deletePickupPoint: async (id) => {
    return apiCall(`/admin/pickup-points/${id}`, {
      method: 'DELETE',
    });
  },
};
