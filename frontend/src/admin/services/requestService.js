import { apiCall } from './api';

export const requestService = {
  // Get all transport requests with pagination
  getRequests: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    return apiCall(`/admin/transport-requests?${params.toString()}`);
  },

  // Get pending requests
  getPendingRequests: async (page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    return apiCall(`/admin/transport-requests/pending?${params.toString()}`);
  },

  // Get single request
  getRequestById: async (id) => {
    return apiCall(`/admin/transport-requests/${id}`);
  },

  // Approve request
  approveRequest: async (id) => {
    return apiCall(`/admin/transport-requests/${id}/approve`, {
      method: 'PUT',
    });
  },

  // Reject request
  rejectRequest: async (id, reason = '') => {
    return apiCall(`/admin/transport-requests/${id}/reject`, {
      method: 'PUT',
      body: { reason },
    });
  },
};
