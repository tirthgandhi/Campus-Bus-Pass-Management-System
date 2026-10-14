import { createContext, useContext } from 'react';

// Keep context identity stable when Vite refreshes the provider component.
export const AuthContext = createContext(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
