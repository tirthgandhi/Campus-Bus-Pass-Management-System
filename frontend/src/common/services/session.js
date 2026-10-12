export const TOKEN_KEY = 'token';

let memoryToken = null;
let storageAvailable = true;
const invalidationListeners = new Set();

// Storage can be unavailable in a restricted browser. The current tab can still
// use a session; only persistence across page refreshes depends on localStorage.
export function readToken() {
  if (!storageAvailable) return memoryToken;
  try {
    memoryToken = globalThis.localStorage.getItem(TOKEN_KEY);
  } catch {
    storageAvailable = false;
    // Keep the in-memory session when storage is unavailable.
  }
  return memoryToken;
}

export function saveToken(token) {
  memoryToken = token;
  try {
    globalThis.localStorage.setItem(TOKEN_KEY, token);
    globalThis.localStorage.removeItem('user');
    storageAvailable = true;
  } catch {
    storageAvailable = false;
    // A blocked storage write should not reject a valid sign-in.
  }
}

export function clearStoredSession() {
  memoryToken = null;
  try {
    globalThis.localStorage.removeItem(TOKEN_KEY);
    globalThis.localStorage.removeItem('user');
    storageAvailable = true;
  } catch {
    storageAvailable = false;
    // Authentication is also cleared from memory.
  }
}

/** Decode expiry only. The backend remains responsible for JWT verification. */
export function getTokenExpiresAt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(globalThis.atob(payload));
    return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token, now = Date.now()) {
  const expiresAt = getTokenExpiresAt(token);
  return expiresAt !== null && expiresAt <= now;
}

export function subscribeSessionInvalidation(listener) {
  invalidationListeners.add(listener);
  return () => invalidationListeners.delete(listener);
}

export function invalidateSession(requestToken) {
  // A delayed 401 for a previous account must not sign out a newer session.
  if (!requestToken || readToken() !== requestToken) return;
  clearStoredSession();
  invalidationListeners.forEach((listener) => listener());
}
