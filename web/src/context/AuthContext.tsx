'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  branding: any;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch Branding
    api.get('/public/branding').then(res => setBranding(res.data)).catch(console.error);

    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
    router.push('/dashboard');
  };

  const register = async (email: string, pass: string, fullName: string) => {
    const res = await api.post('/auth/register', { email, password: pass, full_name: fullName });
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
    router.push('/dashboard');
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, branding, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
