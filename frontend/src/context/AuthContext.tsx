import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfile, getToken, setToken, removeToken } from '../api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string) => Promise<void>;
  demoLogin: (role: 'admin' | 'creator' | 'reviewer') => Promise<void>;
  register: (name: string, email: string, role?: string, orgName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('verity_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('verity_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const refreshUser = async () => {
    try {
      if (getToken()) {
        const profile = await api.getMe();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      removeToken();
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const res = await api.login(email);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'admin' | 'creator' | 'reviewer') => {
    setLoading(true);
    try {
      const res = await api.demoLogin(role);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, role = 'creator', orgName?: string) => {
    setLoading(true);
    try {
      const res = await api.register({ display_name: name, email, role, org_name: orgName });
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toggleTheme,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
