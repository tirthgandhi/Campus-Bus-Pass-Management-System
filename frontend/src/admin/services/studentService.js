import { apiCall } from './api';

export const studentService = {
  // Get all students with pagination
  getStudents: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    
    return apiCall(`/admin/students?${params.toString()}`);
  },

  // Get single student
  getStudentById: async (id) => {
    return apiCall(`/admin/students/${id}`);
  },

  // Create new student
  createStudent: async (data) => {
    return apiCall('/admin/students', {
      method: 'POST',
      body: data,
    });
  },

  // Update student
  updateStudent: async (id, data) => {
    return apiCall(`/admin/students/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Delete student
  deleteStudent: async (id) => {
    return apiCall(`/admin/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Allocate student to bus (legacy endpoint)
  allocateStudentToBus: async (data) => {
    return apiCall('/admin/students/allocate', {
      method: 'POST',
      body: data,
    });
  },
};
