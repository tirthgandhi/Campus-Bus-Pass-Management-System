import { apiCall } from './api';

export const attendanceService = {
  // Get attendance records with pagination
  getAttendance: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    // Add any custom filters
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.busId) params.append('busId', filters.busId);
    if (filters.date) params.append('date', filters.date);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    return apiCall(`/admin/attendance?${params.toString()}`);
  },
};
