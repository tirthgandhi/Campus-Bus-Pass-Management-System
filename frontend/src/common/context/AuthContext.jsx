import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../services/authService';

const AuthContext = createContext();

/**
 * AuthProvider — wraps the app and provides auth state + actions
 * Restores session from localStorage on mount using getMe()
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      getMe(savedToken)
        .then((res) => {
          setUser(res.data);
          setToken(savedToken);
        })
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Persists user data and token after successful login
   * @param {Object} userData - { name, email, role, token }
   */
  const login = (userData) => {
    setUser({ name: userData.name, email: userData.email, role: userData.role });
    setToken(userData.token);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Clears auth state + localStorage and redirects to /login
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — consume auth context anywhere in the component tree
 */
export const useAuth = () => useContext(AuthContext);
