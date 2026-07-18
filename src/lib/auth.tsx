import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { api, getAuthToken, setAuthToken, clearAuthToken, ApiError } from './api';
import type {
  Profile,
  MeResponse,
  MeProfileResponse,
  AuthResponse,
} from './types';

export type AuthStatus =
  | 'loading'
  | 'unauthenticated'
  | 'needsOnboarding'
  | 'authenticated';

export interface AuthState {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
  profile: Profile | null;
  hasActiveSubscription: boolean;
  followerCount: number;
  followingCount: number;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  createProfile: (data: {
    username: string;
    name: string;
    bio: string;
    bioImageUrl: string;
  }) => Promise<void>;
  updateProfile: (data: {
    username?: string;
    name?: string;
    bio?: string;
    bioImageUrl?: string;
  }) => Promise<void>;
  refresh: () => Promise<void>;
}

const initialState: AuthState = {
  status: 'loading',
  userId: null,
  email: null,
  isAdmin: false,
  profile: null,
  hasActiveSubscription: false,
  followerCount: 0,
  followingCount: 0,
};

function unauthenticatedState(): AuthState {
  return {
    status: 'unauthenticated',
    userId: null,
    email: null,
    isAdmin: false,
    profile: null,
    hasActiveSubscription: false,
    followerCount: 0,
    followingCount: 0,
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setState(unauthenticatedState());
      return;
    }

    // Fetch /me to verify token and get admin status / email
    let me: MeResponse | null = null;
    try {
      me = await api.get<MeResponse>('/me');
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        clearAuthToken();
        setState(unauthenticatedState());
        return;
      }
      // transient — keep token, keep current state
      return;
    }

    if (!me) return;

    // Now check for profile
    try {
      const profileRes = await api.get<MeProfileResponse>('/me/profile');
      setState({
        status: 'authenticated',
        userId: me.userId,
        email: me.email,
        isAdmin: me.isAdmin,
        profile: profileRes.profile,
        hasActiveSubscription: profileRes.hasActiveSubscription,
        followerCount: profileRes.followerCount,
        followingCount: profileRes.followingCount,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 404) {
          // Token valid, no profile yet — needs onboarding
          setState({
            status: 'needsOnboarding',
            userId: me.userId,
            email: me.email,
            isAdmin: me.isAdmin,
            profile: null,
            hasActiveSubscription: false,
            followerCount: 0,
            followingCount: 0,
          });
          return;
        }
        if (e.status === 401 || e.status === 403) {
          clearAuthToken();
          setState(unauthenticatedState());
          return;
        }
      }
      // transient — keep state as-is
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      setAuthToken(res.accessToken);
      // CRITICAL: re-derive state so hasProfile/role etc. are correct
      await refresh();
    },
    [refresh]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/register', { email, password });
      setAuthToken(res.accessToken);
      await refresh();
    },
    [refresh]
  );

  const adminLogin = useCallback(
    async (username: string, password: string) => {
      const res = await api.post<AuthResponse>('/admin/login', {
        email: username,
        password,
      });
      setAuthToken(res.accessToken);
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // session already gone — continue with local cleanup unconditionally
    }
    clearAuthToken();
    setState(unauthenticatedState());
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await api.delete('/me');
    } catch {
      // continue with cleanup
    }
    clearAuthToken();
    setState(unauthenticatedState());
  }, []);

  const createProfile = useCallback(
    async (data: {
      username: string;
      name: string;
      bio: string;
      bioImageUrl: string;
    }) => {
      await api.post('/me/profile', data);
      await refresh();
    },
    [refresh]
  );

  const updateProfile = useCallback(
    async (data: {
      username?: string;
      name?: string;
      bio?: string;
      bioImageUrl?: string;
    }) => {
      await api.patch('/me/profile', data);
      await refresh();
    },
    [refresh]
  );

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    adminLogin,
    logout,
    deleteAccount,
    createProfile,
    updateProfile,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthStatus() {
  const { status, isAdmin } = useAuth();
  const isAuthenticated = status === 'needsOnboarding' || status === 'authenticated';
  const hasProfile = status === 'authenticated';
  return { status, isAuthenticated, hasProfile, isAdmin };
}