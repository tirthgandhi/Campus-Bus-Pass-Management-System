import { apiCall } from './api';

export const assignmentService = {
  // Get all assignments with pagination
  getAssignments: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    return apiCall(`/admin/assignments?${params.toString()}`);
  },

  // Get single assignment
  getAssignmentById: async (id) => {
    return apiCall(`/admin/assignments/${id}`);
  },

  // Create new assignment
  createAssignment: async (data) => {
    return apiCall('/admin/assignments', {
      method: 'POST',
      body: data,
    });
  },

  // Update assignment
  updateAssignment: async (id, data) => {
    return apiCall(`/admin/assignments/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
};
