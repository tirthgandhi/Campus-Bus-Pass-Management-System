import { apiCall } from './api';

export const routeService = {
  // Get all routes with pagination
  getRoutes: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    return apiCall(`/admin/routes?${params.toString()}`);
  },

  // Get single route
  getRouteById: async (id) => {
    return apiCall(`/admin/routes/${id}`);
  },

  // Create new route
  createRoute: async (data) => {
    return apiCall('/admin/routes', {
      method: 'POST',
      body: data,
    });
  },

  // Update route
  updateRoute: async (id, data) => {
    return apiCall(`/admin/routes/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Delete route
  deleteRoute: async (id) => {
    return apiCall(`/admin/routes/${id}`, {
      method: 'DELETE',
    });
  },

  // Assign driver to route
  assignDriverToRoute: async (routeId, driverId) => {
    return apiCall(`/admin/routes/${routeId}/driver`, {
      method: 'PUT',
      body: { driverId },
    });
  },
};
