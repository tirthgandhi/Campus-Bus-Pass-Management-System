import api from './api.js';
export { getApiError } from './api.js';

export const loginUser = async (email, password, role, options = {}) => {
  const response = await api.post('/auth/login', { email, password, role }, { skipAuth: true, signal: options.signal });
  return response.data;
};
export const signupUser = async (values, options = {}) => {
  const { name, email, password, role, phone, studentId, department, licenseNumber } = values;
  if (!['student', 'driver'].includes(role)) {
    const error = new Error('Public registration is limited to students and drivers.');
    error.code = 'INVALID_REGISTRATION_ROLE';
    throw error;
  }
  const payload = { name, password, role, phone: phone?.trim(), ...(role === 'student' ? { collegeEmail: email, studentId: studentId?.trim(), department: department?.trim() } : { email, licenseNumber: licenseNumber?.trim() }) };
  const response = await api.post('/auth/signup', payload, { skipAuth: true, signal: options.signal });
  return response.data;
};
export const getMe = async (token, options = {}) => {
  const response = await api.get('/auth/me', { authToken: token, signal: options.signal });
  return response.data;
};
