import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfile, getToken, setToken, removeToken } from '../api';

const DEFAULT_ADMIN: UserProfile = {
  id: 'user-admin-01',
  name: 'Sarah Chen',
  email: 'admin@verity.acme.com',
  role: 'admin',
  org_id: 'org-verity-demo',
  org_name: 'Acme Global Technologies'
};

interface AuthContextType {
  user: UserProfile;
  token: string | null;
  loading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string) => Promise<void>;
  demoLogin: (role: 'admin' | 'creator' | 'reviewer') => Promise<void>;
  register: (name: string, email: string, role?: string, orgName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchRole: (role: 'admin' | 'creator' | 'reviewer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_ADMIN);
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

  const initAuth = async () => {
    setLoading(true);
    try {
      const existingToken = getToken();
      if (existingToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          return;
        } catch {}
      }
      // Zero-login demo mode: automatically acquire demo admin session
      const res = await api.demoLogin('admin');
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } catch {
      // Fallback: stay on default admin user with zero blocking
      setUser(DEFAULT_ADMIN);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
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
    } catch {
      setUser((prev) => ({ ...prev, role }));
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: 'admin' | 'creator' | 'reviewer') => {
    await demoLogin(role);
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
    // Reset to default Admin demo mode without locking out the user
    demoLogin('admin');
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
        switchRole,
        register,
        logout,
        refreshUser: initAuth,
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
