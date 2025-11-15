import { createContext, useContext, useEffect, useState } from "react";
import { api, apiJson } from "../lib/api";
import { saveTokens, clearTokens, getTokens } from "../lib/auth";
const AuthContext = createContext({
  user: null,
  async login() {
    return false;
  },
  async register() {
    return false;
  },
  async logout() {
  },
  async applyTokenPair() {
    return false;
  }
});
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    (async () => {
      if (getTokens()) {
        try {
          const data = await apiJson("/auth/me");
          setUser(data);
        } catch (err) {
          clearTokens();
          setUser(null);
        }
      }
    })();
  }, []);
  async function login(email, password) {
    try {
      const data = await apiJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (data?.access && data?.refresh) {
        saveTokens({ access: data.access, refresh: data.refresh });
        setUser(data.user || null);
        return true;
      }
    } catch (err) {
      console.warn("[auth] login failed", err);
    }
    return false;
  }
  async function register(payload) {
    try {
      const data = await apiJson("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (data?.access && data?.refresh) {
        saveTokens({ access: data.access, refresh: data.refresh });
        setUser(data.user || null);
        return true;
      }
    } catch (err) {
      console.warn("[auth] register failed", err);
    }
    return false;
  }
  async function logout() {
    try {
      await api("/auth/logout", {
        method: "POST",
        body: JSON.stringify(getTokens() || {})
      });
    } catch (err) {
      console.warn("[auth] logout warning", err);
    }
    clearTokens();
    setUser(null);
  }
  async function applyTokenPair(pair) {
    if (!pair?.access || !pair?.refresh) return false;
    saveTokens(pair);
    try {
      const data = await apiJson("/auth/me");
      setUser(data);
      return true;
    } catch (err) {
      clearTokens();
      return false;
    }
  }
  return <AuthContext.Provider value={{ user, login, register, logout, applyTokenPair }}>
      {children}
    </AuthContext.Provider>;
};
const useAuth = () => useContext(AuthContext);
export {
  AuthProvider,
  useAuth
};
