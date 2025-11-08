import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, apiJson } from '../lib/api';
import { saveTokens, clearTokens, getTokens, Tokens } from '../lib/auth';

type User = {
  id: number;
  email: string;
  phone?: string | null;
  first_name?: string;
  last_name?: string;
  role?: string;
  patient_id?: number;
} | null;

type RegisterPayload = { first_name: string; last_name: string; phone: string; email: string; password: string };

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  applyTokenPair: (pair: Tokens) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  async login() {
    return false;
  },
  async register() {
    return false;
  },
  async logout() {},
  async applyTokenPair() {
    return false;
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    (async () => {
      if (getTokens()) {
        try {
          const data = await apiJson<User>('/auth/me');
          setUser(data);
        } catch (err) {
          clearTokens();
          setUser(null);
        }
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    try {
      const data = await apiJson<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data?.access && data?.refresh) {
        saveTokens({ access: data.access, refresh: data.refresh });
        setUser(data.user || null);
        return true;
      }
    } catch (err) {
      console.warn('[auth] login failed', err);
    }
    return false;
  }

  async function register(payload: RegisterPayload) {
    try {
      const data = await apiJson<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data?.access && data?.refresh) {
        saveTokens({ access: data.access, refresh: data.refresh });
        setUser(data.user || null);
        return true;
      }
    } catch (err) {
      console.warn('[auth] register failed', err);
    }
    return false;
  }

  async function logout() {
    try {
      await api('/auth/logout', {
        method: 'POST',
        body: JSON.stringify(getTokens() || {}),
      });
    } catch (err) {
      console.warn('[auth] logout warning', err);
    }
    clearTokens();
    setUser(null);
  }

  async function applyTokenPair(pair: Tokens) {
    if (!pair?.access || !pair?.refresh) return false;
    saveTokens(pair);
    try {
      const data = await apiJson<User>('/auth/me');
      setUser(data);
      return true;
    } catch (err) {
      clearTokens();
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, applyTokenPair }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
