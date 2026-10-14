import axios from 'axios';
import { invalidateSession, isTokenExpired, readToken } from './session.js';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    config.headers.delete('Authorization');
    return config;
  }

  const token = config.authToken ?? readToken();
  if (token) {
    if (isTokenExpired(token)) {
      invalidateSession(token);
      const error = new Error('Session expired.');
      error.code = 'SESSION_EXPIRED';
      return Promise.reject(error);
    }
    config.headers.Authorization = `Bearer ${token}`;
    config.sessionToken = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuth) {
      invalidateSession(error.config?.sessionToken);
    }
    return Promise.reject(error);
  },
);

/** Never display arbitrary backend messages, stack traces, or database errors. */
export function getApiError(error, context = '') {
  if (error.code === 'ROLE_MISMATCH') {
    return 'This account belongs to a different role. Select the correct role and try again.';
  }
  if (error.code === 'INVALID_REGISTRATION_ROLE') {
    return 'Please choose student or driver registration.';
  }
  if (error.code === 'SESSION_EXPIRED') return 'Your session has expired. Please sign in again.';
  if (error.code === 'SESSION_CHANGED' || error.code === 'ERR_CANCELED') {
    return 'Your session changed. Please sign in again.';
  }
  if (error.code === 'INVALID_SESSION_RESPONSE') {
    return 'We could not verify your account. Please try again.';
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The server is taking too long to respond. Please try again.';
  }
  const status = error.response?.status;
  if (!status) return 'Unable to connect to the server. Please check your connection and try again.';
  if (status === 401) {
    return context === 'login'
      ? 'Invalid email or password.'
      : 'Your session has expired. Please sign in again.';
  }
  if (status === 403) return 'You do not have permission to access this page.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (context === 'signup' && (status === 400 || status === 409)) {
    const duplicateMessages = ['An account with these details already exists.'];
    if (status === 409 || duplicateMessages.includes(error.response.data?.message)) {
      return 'An account with these details already exists. Check your email and identification number.';
    }
  }
  if (status === 400 || status === 422) return 'Check the information you entered and try again.';
  if (context === 'session') return 'We could not verify your session. Please try again.';
  return 'Something went wrong. Please try again.';
}

export default api;
