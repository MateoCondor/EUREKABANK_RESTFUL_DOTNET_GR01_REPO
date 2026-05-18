import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getToken, getUser, type LoginRequest } from '@/services/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  role: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    username: null,
    role: null,
  });

  // Check stored session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const user = await getUser();
        if (token && user) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            username: user.username,
            role: user.role,
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiLogin(data);
    setState({
      isAuthenticated: true,
      isLoading: false,
      username: res.username,
      role: res.role,
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({
      isAuthenticated: false,
      isLoading: false,
      username: null,
      role: null,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
