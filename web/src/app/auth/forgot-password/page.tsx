'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showNotification('Reset link sent to your email!', 'success');
    } catch (err) {
      showNotification('Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-teal/20 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-signature rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-green/20">
            <span className="material-icons-outlined text-3xl text-white">lock_reset</span>
          </div>
          <h1 className="text-3xl font-black italic">Reset Password</h1>
          <p className="text-soft-grey text-xs uppercase tracking-widest font-bold">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-soft-grey uppercase tracking-widest block mb-3 ml-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-navy/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-green transition-all"
              placeholder="name@example.com"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-signature text-white font-black py-5 rounded-2xl shadow-xl shadow-green/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-soft-grey uppercase tracking-widest">
          Remembered? <Link href="/login" className="text-green hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
