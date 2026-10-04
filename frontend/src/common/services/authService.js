import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/auth';

/**
 * Login an existing user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} API response data
 */
export const loginUser = async (email, password) => {
  const res = await axios.post(`${BASE_URL}/login`, { email, password });
  return res.data;
};

/**
 * Register a new student or driver account
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} collegeEmail  - required for students, empty string for drivers
 * @param {string} password
 * @param {string} role          - 'student' | 'driver'
 * @returns {Promise} API response data
 */
export const signupUser = async (
  firstName,
  lastName,
  email,
  collegeEmail,
  password,
  role,
) => {
  const res = await axios.post(`${BASE_URL}/signup`, {
    firstName,
    lastName,
    email,
    collegeEmail,
    password,
    role,
  });
  return res.data;
};

/**
 * Fetch current authenticated user info
 * @param {string} token - JWT token
 * @returns {Promise} API response data
 */
export const getMe = async (token) => {
  const res = await axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
