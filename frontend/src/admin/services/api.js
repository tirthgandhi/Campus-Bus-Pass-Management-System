// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to add auth token to requests
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic fetch wrapper with error handling
export async function apiCall(endpoint, options = {}) {
  const { method = 'GET', body = null, ...rest } = options;

  const config = {
    method,
    headers: getHeaders(),
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

export const API_BASE_URL_EXPORT = API_BASE_URL;
