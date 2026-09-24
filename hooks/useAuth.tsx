'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, removeToken } from '@/lib/auth';
import { MOCK_MODE, mockToken } from '@/lib/mock-api';

interface User {
  id: number;
  name: string;
  email: string;
  userTypeId: number;
  roles: string[];
  permissions: string[];
  companyId?: number;
  servicePartnerId?: number | null;
}

interface AuthContextType {
  user: User | null;
  /** Tenant identifier extracted from JWT — always present after login. */
  companyId: number | null;
  /** Sub-tenant identifier — present only for service-partner-scoped users. */
  servicePartnerId: number | null;
  /** Initial auth hydration from sessionStorage */
  loading: boolean;
  /** Alias for `loading` (compat with callers that expect `isLoading`) */
  isLoading: boolean;
  login: (userData: { user?: User }) => void;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isRestricted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_MODE ? {
    id: 101,
    name: 'João Silva',
    email: 'joao@logixsphere.local',
    userTypeId: 1,
    roles: ['admin'],
    permissions: ['all_access'],
    companyId: 1,
    servicePartnerId: null,
  } : null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (MOCK_MODE) {
        const mockUser = {
          id: 101, name: 'João Silva', email: 'joao@logixsphere.local', userTypeId: 1,
          roles: ['admin'], permissions: ['all_access'], companyId: 1, servicePartnerId: null,
        };
        sessionStorage.setItem('auth_user', JSON.stringify(mockUser));
        sessionStorage.setItem('auth-token', mockToken);
        setUser(mockUser);
        setLoading(false);
        return;
      }
      const isAuth = isAuthenticated();
      if (!isAuth) {
        setUser(null);
        setLoading(false);
        return;
      }

      const storedUser = sessionStorage.getItem('auth_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (_e) {
          sessionStorage.removeItem('auth_user');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (authData: { user?: User }) => {
    if (authData && authData.user) {
      setUser(authData.user);
      sessionStorage.setItem('auth_user', JSON.stringify(authData.user));
    }
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
    sessionStorage.removeItem('auth_user');
    router.push('/login');
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  const hasPermission = (permission: string) => {
    if (user?.roles.includes('admin')) return true;
    return user?.permissions.includes(permission) || user?.permissions.includes('all_access') || false;
  };

  const isRestricted = hasRole('supervisor');

  return (
    <AuthContext.Provider
      value={{
        user,
        companyId: user?.companyId ?? null,
        servicePartnerId: user?.servicePartnerId ?? null,
        loading,
        isLoading: loading,
        login,
        logout,
        hasRole,
        hasPermission,
        isRestricted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
