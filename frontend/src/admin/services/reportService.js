import { apiCall } from './api';

export const reportService = {
  // Get reports
  getReports: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    // Add any custom filters
    if (filters.type) params.append('type', filters.type);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    return apiCall(`/admin/reports?${params.toString()}`);
  },
};
