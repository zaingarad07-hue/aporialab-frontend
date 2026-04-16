/**
 * Copyright (c) 2026 AporiaLab
 * جميع الحقوق محفوظة
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  discussions: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.getCurrentUser()
        .then((response) => {
          if (response.success && response.user) {
            const userId = response.user.id || response.user._id || '';
            setUser({
              id: userId,
              name: response.user.name,
              email: response.user.email,
              avatar: response.user.avatar,
              bio: response.user.bio,
              reputation: response.user.reputation || 0,
              discussions: 0,
              role: response.user.role || 'user',
            });
          }
        })
        .catch(() => {
          api.clearToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.user) {
      const userId = response.user.id || response.user._id || '';
      setUser({
        id: userId,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar,
        bio: response.user.bio,
        reputation: response.user.reputation || 0,
        discussions: 0,
        role: response.user.role || 'user',
      });
    } else {
      throw new Error(response.message || 'فشل تسجيل الدخول');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register(name, email, password);
    if (response.success && response.user) {
      const userId = response.user.id || response.user._id || '';
      setUser({
        id: userId,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar,
        bio: response.user.bio,
        reputation: response.user.reputation || 0,
        discussions: 0,
        role: response.user.role || 'user',
      });
    } else {
      throw new Error(response.message || 'فشل إنشاء الحساب');
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
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
