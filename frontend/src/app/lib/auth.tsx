import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore } from './api';

export type User = {
  id: string;
  role: 'member' | 'staff' | 'admin';
  firstName: string;
  lastName: string;
  idNumber: string;
  idType: 'id' | 'passport';
  email: string;
  phone?: string;
  address?: string;
  nationality?: string;
  memberNumber: string;
  plan?: 'school' | 'healthcare' | 'both';
  createdAt: string;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  isStaff: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (data: Record<string, unknown>) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await api<{ user: User }>('/auth/me');
      setUser(user);
    } catch {
      tokenStore.set(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (identifier: string, password: string) => {
    const r = await api<{ token: string; user: User }>('/auth/login', { method: 'POST', json: { identifier, password } });
    tokenStore.set(r.token);
    setUser(r.user);
    return r.user;
  };

  const register = async (data: Record<string, unknown>) => {
    const r = await api<{ token: string; user: User }>('/auth/register', { method: 'POST', json: data });
    tokenStore.set(r.token);
    setUser(r.user);
    return r.user;
  };

  const logout = () => {
    tokenStore.set(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, isStaff: !!user && user.role !== 'member', login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
}
