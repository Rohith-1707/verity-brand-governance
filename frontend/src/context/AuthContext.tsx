import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfile, getToken, setToken, removeToken } from '../api';

const DEFAULT_ADMIN: UserProfile = {
  id: 'user-admin-01',
  name: 'Rohith (Administrator)',
  email: 'rohith@verity.acme.com',
  role: 'admin',
  org_id: 'org-verity-demo',
  org_name: 'Acme Global Technologies'
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string) => Promise<void>;
  demoLogin: (role?: 'admin' | 'creator' | 'reviewer') => Promise<void>;
  register: (name: string, email: string, role?: string, orgName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchRole: (role: 'admin' | 'creator' | 'reviewer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    return localStorage.getItem('verity_logged_out') === 'true' ? null : DEFAULT_ADMIN;
  });
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
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const initAuth = async () => {
    setLoading(true);
    const loggedOut = localStorage.getItem('verity_logged_out') === 'true';
    if (loggedOut) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const existingToken = getToken();
      if (existingToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          return;
        } catch {}
      }
      // Demo authentication: default to administrator credentials
      const res = await api.demoLogin('admin');
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } catch {
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
    localStorage.removeItem('verity_logged_out');
    try {
      const res = await api.login(email);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'admin' | 'creator' | 'reviewer' = 'admin') => {
    setLoading(true);
    localStorage.removeItem('verity_logged_out');
    try {
      const res = await api.demoLogin(role);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
    } catch {
      if (role === 'admin') {
        setUser(DEFAULT_ADMIN);
      } else {
        setUser({
          ...DEFAULT_ADMIN,
          id: `user-${role}-01`,
          role,
          name: role === 'reviewer' ? 'Elena Rostova' : 'Marcus Vance',
          email: `${role}@verity.acme.com`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: 'admin' | 'creator' | 'reviewer') => {
    await demoLogin(role);
  };

  const register = async (name: string, email: string, role = 'creator', orgName?: string) => {
    setLoading(true);
    localStorage.removeItem('verity_logged_out');
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
    localStorage.setItem('verity_logged_out', 'true');
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
