/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginDriver, getProfile } from "../api/driverApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("driverToken"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverInfo");
    setToken(null);
    setDriver(null);
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getProfile();
        if (res.data.success) {
          setDriver(res.data.driver);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [logout, token]);

  const login = async (credentials) => {
    const res = await loginDriver(credentials);
    if (res.data.success) {
      localStorage.setItem("driverToken", res.data.token);
      localStorage.setItem("driverInfo", JSON.stringify(res.data.driver));
      setToken(res.data.token);
      setDriver(res.data.driver);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  return (
    <AuthContext.Provider value={{ driver, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}