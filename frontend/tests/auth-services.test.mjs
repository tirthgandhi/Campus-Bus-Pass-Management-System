import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import api, { getApiError } from '../src/common/services/api.js';
import { loginUser, signupUser, getMe } from '../src/common/services/authService.js';
import {
  clearStoredSession,
  getTokenExpiresAt,
  invalidateSession,
  isTokenExpired,
  readToken,
  saveToken,
  subscribeSessionInvalidation,
} from '../src/common/services/session.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalAdapter = api.defaults.adapter;
let entries;
let requests;
const tokenAt = (expiry) => `header.${btoa(JSON.stringify({ exp: expiry }))}.signature`;
const currentToken = () => tokenAt(Math.floor(Date.now() / 1000) + 3600);

function rejectWithStatus(status, message = 'Server details must remain private') {
  api.defaults.adapter = async (config) => {
    const response = { status, statusText: 'Error', data: { message }, headers: {}, config };
    throw new AxiosError(message, 'ERR_BAD_REQUEST', config, {}, response);
  };
}

beforeEach(() => {
  entries = new Map();
  requests = [];
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
      removeItem: (key) => entries.delete(key),
    },
  });
  clearStoredSession();
  api.defaults.adapter = async (config) => {
    requests.push(config);
    return { status: 200, statusText: 'OK', headers: {}, config, data: { success: true, data: {} } };
  };
});

afterEach(() => {
  clearStoredSession();
  api.defaults.adapter = originalAdapter;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
});

test('registration sends only fields accepted by the real signup endpoint', async () => {
  saveToken(currentToken());
  await signupUser({ name: 'Campus Student', email: 'student@example.edu', password: 'private-password', role: 'student', phone: '9876543210', studentId: 'ENR1', department: 'Engineering', confirmPassword: 'unused' });
  assert.equal(requests[0].url, '/auth/signup');
  assert.deepEqual(JSON.parse(requests[0].data), {
    name: 'Campus Student', collegeEmail: 'student@example.edu', password: 'private-password', role: 'student', phone: '9876543210', studentId: 'ENR1', department: 'Engineering',
  });
  assert.equal(requests[0].headers.Authorization, undefined);
});

test('public registration refuses admin before issuing a request', async () => {
  await assert.rejects(signupUser({ name: 'Admin', email: 'admin@example.edu', password: 'private-password', role: 'admin' }), { code: 'INVALID_REGISTRATION_ROLE' });
  assert.equal(requests.length, 0);
});

test('login posts credentials with role and without sending a stale stored bearer token', async () => {
  saveToken(currentToken());
  await loginUser('student@example.edu', 'private-password', 'student');
  assert.equal(requests[0].url, '/auth/login');
  assert.deepEqual(JSON.parse(requests[0].data), { email: 'student@example.edu', password: 'private-password', role: 'student' });
  assert.equal(requests[0].headers.Authorization, undefined);
});

test('protected requests carry the bearer token and use the existing me route', async () => {
  const token = currentToken();
  saveToken(token);
  await getMe();
  assert.equal(requests[0].url, '/auth/me');
  assert.equal(requests[0].headers.Authorization, `Bearer ${token}`);
});

test('a protected 401 invalidates the session while preserving unrelated storage', async () => {
  const token = currentToken();
  saveToken(token);
  entries.set('theme', 'light');
  entries.set('user', 'legacy account data');
  let invalidations = 0;
  const unsubscribe = subscribeSessionInvalidation(() => { invalidations += 1; });
  rejectWithStatus(401);
  await assert.rejects(getMe());
  unsubscribe();
  assert.equal(readToken(), null);
  assert.equal(entries.get('user'), undefined);
  assert.equal(entries.get('theme'), 'light');
  assert.equal(invalidations, 1);
});

test('a public login failure cannot invalidate an existing session', async () => {
  const token = currentToken();
  saveToken(token);
  rejectWithStatus(401, 'Invalid credentials');
  await assert.rejects(loginUser('student@example.edu', 'wrong-password', 'student'));
  assert.equal(readToken(), token);
});

test('a transient connection failure preserves the session for recovery', async () => {
  const token = currentToken();
  saveToken(token);
  api.defaults.adapter = async (config) => { throw new AxiosError('Network Error', 'ERR_NETWORK', config); };
  await assert.rejects(getMe());
  assert.equal(readToken(), token);
});

test('a 403 denies the resource without deleting an otherwise valid session', async () => {
  const token = currentToken();
  saveToken(token);
  rejectWithStatus(403);
  await assert.rejects(getMe());
  assert.equal(readToken(), token);
});

test('a delayed unauthorized response from an old session leaves a new session intact', () => {
  const newToken = currentToken();
  saveToken(newToken);
  invalidateSession('older-token');
  assert.equal(readToken(), newToken);
});

test('an expired JWT is cleared before any protected request is sent', async () => {
  saveToken(tokenAt(Math.floor(Date.now() / 1000) - 1));
  await assert.rejects(getMe(), { code: 'SESSION_EXPIRED' });
  assert.equal(requests.length, 0);
  assert.equal(readToken(), null);
});

test('JWT expiry uses seconds while malformed tokens are left for backend verification', () => {
  assert.equal(getTokenExpiresAt(tokenAt(100)), 100000);
  assert.equal(isTokenExpired(tokenAt(100), 99999), false);
  assert.equal(isTokenExpired(tokenAt(100), 100000), true);
  assert.equal(getTokenExpiresAt('malformed'), null);
  assert.equal(getTokenExpiresAt(null), null);
});

test('server internals never reach visible error messages', () => {
  const privateMessage = 'MongoServerError connection secret at internal/path.js';
  assert.equal(getApiError({ response: { status: 500, data: { message: privateMessage } } }, 'login'), 'Something went wrong. Please try again.');
  assert.equal(getApiError({ response: { status: 400, data: { message: privateMessage } } }, 'signup'), 'Check the information you entered and try again.');
  assert.equal(getApiError({ response: { status: 401, data: { message: privateMessage } } }, 'login'), 'Invalid email or password.');
  assert.match(getApiError({ response: { status: 400, data: { message: 'An account with these details already exists.' } } }, 'signup'), /account with these details already exists/);
});

test('a restricted storage write still permits an in-memory login and logout', () => {
  globalThis.localStorage.setItem = () => { throw new Error('Storage blocked'); };
  const token = currentToken();
  saveToken(token);
  assert.equal(readToken(), token);
  clearStoredSession();
  assert.equal(readToken(), null);
});
