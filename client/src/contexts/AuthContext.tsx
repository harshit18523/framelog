import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthUser, AuthResponseData } from '../types/auth';
import {
  loginApi,
  registerApi,
  logoutApi,
  getMeApi,
  refreshTokenApi,
  LoginPayload,
  RegisterPayload,
} from '../api/auth.api';

const AVATAR_TONES = [
  '#4A3418',
  '#1F3140',
  '#3A2438',
  '#223628',
  '#402626',
  '#2C2C3A',
  '#3A3320',
];

const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getTone = (nameOrId: string): string => {
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_TONES.length;
  return AVATAR_TONES[index];
};

export const formatAuthUser = (raw: AuthResponseData['user']): AuthUser => {
  const id = raw._id || raw.id || 'user';
  return {
    id,
    _id: id,
    name: raw.name || 'Anonymous',
    username: raw.username || 'user',
    email: raw.email || '',
    avatar: raw.avatar || '',
    bio: raw.bio || '',
    location: raw.location || '',
    yearlyGoal: raw.yearlyGoal ?? 100,
    age: raw.age,
    phone: raw.phone || '',
    phoneCountry: raw.phoneCountry || 'IN',
    phoneVerified: raw.phoneVerified || false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    handle: raw.username || 'user',
    initials: getInitials(raw.name),
    tone: raw.avatar && raw.avatar.startsWith('#') ? raw.avatar : getTone(raw.name || id),
  };
};

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('framelog_token');
      if (!storedToken) {
        // Try cookie-based refresh token if available
        try {
          const refRes = await refreshTokenApi();
          if (isMounted && refRes.data?.user && refRes.data?.accessToken) {
            localStorage.setItem('framelog_token', refRes.data.accessToken);
            setAccessToken(refRes.data.accessToken);
            setUser(formatAuthUser(refRes.data.user));
          }
        } catch {
          // No active session
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      try {
        setAccessToken(storedToken);
        const res = await getMeApi();
        if (isMounted && res.data?.user) {
          setUser(formatAuthUser(res.data.user));
        }
      } catch {
        // Access token might be expired, try refreshing
        try {
          const refRes = await refreshTokenApi();
          if (isMounted && refRes.data?.user && refRes.data?.accessToken) {
            localStorage.setItem('framelog_token', refRes.data.accessToken);
            setAccessToken(refRes.data.accessToken);
            setUser(formatAuthUser(refRes.data.user));
            return;
          }
        } catch {
          // Refresh token is also expired or invalid
        }

        console.warn('[Auth] Session validation failed or expired');
        localStorage.removeItem('framelog_token');
        if (isMounted) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const res = await loginApi(payload);
    if (!res.data || !res.data.user || !res.data.accessToken) {
      throw new Error(res.message || 'Login failed');
    }

    const formattedUser = formatAuthUser(res.data.user);
    localStorage.setItem('framelog_token', res.data.accessToken);
    setUser(formattedUser);
    setAccessToken(res.data.accessToken);
    return formattedUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthUser> => {
    const res = await registerApi(payload);
    if (!res.data || !res.data.user || !res.data.accessToken) {
      throw new Error(res.message || 'Registration failed');
    }

    const formattedUser = formatAuthUser(res.data.user);
    localStorage.setItem('framelog_token', res.data.accessToken);
    setUser(formattedUser);
    setAccessToken(res.data.accessToken);
    return formattedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.warn('[Auth] Logout API call error (proceeding to clear local state):', error);
    } finally {
      localStorage.removeItem('framelog_token');
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const updateUser = useCallback((updatedData: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: Boolean(user && accessToken),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

export default AuthContext;
