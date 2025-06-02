"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string } | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a mock password. In a real app, never hardcode credentials.
const MOCK_PASSWORD = "password123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for a stored auth state (e.g., in localStorage or a cookie)
    // This is a simplified example.
    const storedAuth = localStorage.getItem('accendia-auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      if (authData.isAuthenticated && authData.user) {
        setIsAuthenticated(true);
        setUser(authData.user);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (password === MOCK_PASSWORD) {
      const userData = { name: 'Demo User' };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('accendia-auth', JSON.stringify({ isAuthenticated: true, user: userData }));
      setIsLoading(false);
      return true;
    }
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setIsLoading(true);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('accendia-auth');
    router.push('/login');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
