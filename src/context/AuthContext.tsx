import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/services/api';
import { setSentryUser } from '@/sentry';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  reputation?: number;
  role?: string;
  isFoundingMember?: boolean;
  authProvider?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: (raw?: NonNullable<Awaited<ReturnType<typeof api.getCurrentUser>>['user']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUserData(u: NonNullable<Awaited<ReturnType<typeof api.getCurrentUser>>['user']>): User {
  return {
    id: u.id || u._id || '',
    _id: u._id,
    name: u.name,
    email: u.email || '',
    avatar: u.avatar,
    bio: u.bio,
    location: u.location,
    website: u.website,
    reputation: u.reputation,
    role: u.role,
    isFoundingMember: u.isFoundingMember,
    authProvider: u.authProvider,
    emailVerified: u.emailVerified,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSentryUser(user ? { id: user.id, email: user.email } : null);
  }, [user]);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.getCurrentUser();
        if (response.success && response.user) {
          setUser(mapUserData(response.user));
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.user) {
      setUser(mapUserData(response.user));
    }
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await api.loginWithGoogle(credential);
    if (response.success && response.user) {
      setUser(mapUserData(response.user));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register(name, email, password);
    if (response.success && response.user) {
      setUser(mapUserData(response.user));
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  const refreshUser = (raw?: NonNullable<Awaited<ReturnType<typeof api.getCurrentUser>>['user']>) => {
    if (raw) {
      setUser(mapUserData(raw));
      return;
    }
    api.getCurrentUser().then(response => {
      if (response.success && response.user) {
        setUser(mapUserData(response.user));
      }
    }).catch(err => {
      console.error('refreshUser failed:', err);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
    }}>
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
