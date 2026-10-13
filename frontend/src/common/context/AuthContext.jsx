import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiError, getMe, loginUser } from '../services/authService.js';
import {
  TOKEN_KEY,
  clearStoredSession,
  getTokenExpiresAt,
  invalidateSession,
  isTokenExpired,
  readToken,
  saveToken,
  subscribeSessionInvalidation,
} from '../services/session.js';
import { ROLES } from '../routes/rolePaths.js';

import { AuthContext } from './authState.js';
const signedOut = { user: null, token: null, loading: false, sessionError: null };

function accountFromResponse(response) {
  const account = response?.success && response.data;
  if (!account || !ROLES.includes(account.role)
    || typeof account.name !== 'string' || !account.name.trim()
    || typeof account.email !== 'string' || !account.email.trim()) {
    const error = new Error('Invalid account response.');
    error.code = 'INVALID_SESSION_RESPONSE';
    throw error;
  }
  return {
    name: account.name,
    email: account.email,
    role: account.role,
    ...(account._id || account.id ? { id: account._id || account.id } : {}),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({ ...signedOut, token: readToken(), loading: true }));
  const requestVersion = useRef(0);
  const controller = useRef(null);

  const cancelPendingRequest = useCallback(() => {
    requestVersion.current += 1;
    controller.current?.abort();
    controller.current = null;
    return requestVersion.current;
  }, []);

  const logout = useCallback(() => {
    cancelPendingRequest();
    clearStoredSession();
    setSession(signedOut);
  }, [cancelPendingRequest]);

  const retrySession = useCallback(async () => {
    const version = cancelPendingRequest();
    const savedToken = readToken();
    if (!savedToken || isTokenExpired(savedToken)) {
      clearStoredSession();
      setSession(signedOut);
      return;
    }

    const requestController = new AbortController();
    controller.current = requestController;
    setSession({ user: null, token: savedToken, loading: true, sessionError: null });
    try {
      const response = await getMe(savedToken, { signal: requestController.signal });
      const user = accountFromResponse(response);
      if (version !== requestVersion.current || readToken() !== savedToken) return;
      setSession({ user, token: savedToken, loading: false, sessionError: null });
    } catch (error) {
      if (version !== requestVersion.current || requestController.signal.aborted || readToken() !== savedToken) return;
      if (error.response?.status === 401 || error.code === 'SESSION_EXPIRED') {
        logout();
      } else {
        // A connection failure is recoverable; keep the token for a retry.
        setSession({ user: null, token: savedToken, loading: false, sessionError: getApiError(error, 'session') });
      }
    }
  }, [cancelPendingRequest, logout]);

  const login = useCallback(async (email, password, expectedRole) => {
    const version = cancelPendingRequest();
    const requestController = new AbortController();
    controller.current = requestController;
    const response = await loginUser(email, password, expectedRole, { signal: requestController.signal });
    if (version !== requestVersion.current) {
      const error = new Error('Session changed.');
      error.code = 'SESSION_CHANGED';
      throw error;
    }

    const user = accountFromResponse(response);
    if (expectedRole && user.role !== expectedRole) {
      const error = new Error('The selected role does not match this account.');
      error.code = 'ROLE_MISMATCH';
      throw error;
    }
    const token = response.data.token;
    if (typeof token !== 'string' || !token || isTokenExpired(token)) {
      const error = new Error('Invalid session response.');
      error.code = 'INVALID_SESSION_RESPONSE';
      throw error;
    }

    saveToken(token);
    setSession({ user, token, loading: false, sessionError: null });

    // Redirect students to the external student module
    if (user.role === 'student') {
      window.location.href = `http://localhost:5174/?token=${encodeURIComponent(token)}`;
      return user;
    }

    return user;
  }, [cancelPendingRequest]);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeSessionInvalidation(logout);
    const syncSession = (event) => {
      if (event.key === TOKEN_KEY || event.key === null) void retrySession();
    };
    window.addEventListener('storage', syncSession);
    queueMicrotask(() => {
      if (active) void retrySession();
    });
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener('storage', syncSession);
      cancelPendingRequest();
    };
  }, [cancelPendingRequest, logout, retrySession]);

  useEffect(() => {
    const expiresAt = getTokenExpiresAt(session.token);
    if (expiresAt === null) return undefined;
    let timer;
    const checkExpiry = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) invalidateSession(session.token);
      else timer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
    };
    checkExpiry();
    return () => window.clearTimeout(timer);
  }, [session.token]);

  return (
    <AuthContext.Provider value={{ ...session, isAuthenticated: Boolean(session.user && session.token), login, logout, retrySession }}>
      {children}
    </AuthContext.Provider>
  );
}

// Preserve the existing hook import path while keeping the context stable.
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from './authState.js';
