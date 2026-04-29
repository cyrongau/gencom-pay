'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function TwoFactorPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { fetchProfile } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/2fa/verify', { code });
      await fetchProfile();
      showNotification('Identity Verified!', 'success');
      router.push('/dashboard');
    } catch (err) {
      showNotification('Invalid verification code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-teal/20 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-10 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto border border-blue/20">
            <span className="material-icons-outlined text-3xl text-blue">security</span>
          </div>
          <h1 className="text-3xl font-black italic">Two-Factor Auth</h1>
          <p className="text-soft-grey text-xs uppercase tracking-widest font-bold leading-relaxed px-4">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <input 
            type="text" 
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-navy/40 border border-white/10 rounded-2xl px-6 py-6 text-center text-4xl font-black tracking-[0.5em] text-white focus:outline-none focus:border-blue transition-all"
            placeholder="000000"
          />

          <button 
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-blue text-white font-black py-5 rounded-2xl shadow-xl shadow-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
          </button>
        </form>

        <button 
          onClick={() => router.push('/login')}
          className="text-[10px] font-bold text-soft-grey uppercase tracking-widest hover:text-white transition-colors"
        >
          Cancel and Sign Out
        </button>
      </div>
    </div>
  );
}
