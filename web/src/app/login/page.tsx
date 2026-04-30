'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, branding } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
                    (typeof window !== 'undefined' && window.location.hostname.includes('generexcom.com') 
                      ? 'https://api.generexcom.com' 
                      : 'http://localhost:4000');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-green/30 flex overflow-hidden font-sans">
      
      {/* Left Column: Branding & Vision (Expanded) */}
      <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] bg-gradient-dashboard relative items-center justify-center p-24 overflow-hidden border-r border-white/5 shadow-2xl">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-green/10 rounded-full blur-[150px] -mr-64 -mt-64 opacity-50"></div>
         <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-blue/10 rounded-full blur-[120px] -ml-40 -mb-40 opacity-40"></div>
         
         <div className="relative z-10 max-w-4xl space-y-16">
            <div className="flex items-center gap-6">
               {branding?.LOGO_SQUARE ? (
                 <img src={`${apiBaseUrl}${branding.LOGO_SQUARE}`} alt="Logo" className="w-16 h-16 object-contain rounded-2xl" />
               ) : (
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-2xl">
                    <span className="material-icons-outlined text-green text-3xl">shield</span>
                 </div>
               )}
               <span className="text-4xl font-black italic tracking-tighter">{branding?.APP_NAME || 'Gencom Pay'}</span>
            </div>

            <div className="space-y-10">
               <h1 className="text-8xl xl:text-[10rem] font-black leading-[0.85] tracking-tighter italic">
                  Digital <br />
                  <span className="text-green">Financial</span> <br />
                  Integrity.
               </h1>
               <p className="text-2xl text-white/60 leading-relaxed font-medium max-w-2xl">
                  A secure bridge between legacy banking and the digital future. Simple, fast, and reliable payments on the Gencom Pay Network.
               </p>
            </div>

            <div className="flex gap-16 pt-10">
               <div className="space-y-3">
                  <p className="text-4xl font-black italic text-white">99.99%</p>
                  <p className="text-[11px] font-black text-soft-grey uppercase tracking-[0.3em]">System Status</p>
               </div>
               <div className="w-px h-16 bg-white/10"></div>
               <div className="space-y-3">
                  <p className="text-4xl font-black italic text-white">Real-Time</p>
                  <p className="text-[11px] font-black text-soft-grey uppercase tracking-[0.3em]">Instant Transfers</p>
               </div>
               <div className="w-px h-16 bg-white/10"></div>
               <div className="space-y-3">
                  <p className="text-4xl font-black italic text-white">AI-Driven</p>
                  <p className="text-[11px] font-black text-soft-grey uppercase tracking-[0.3em]">Compliance</p>
               </div>
            </div>
         </div>

         {/* Floating Status Card */}
         <div className="absolute bottom-10 right-10 w-80 h-auto bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-1000 p-8 hidden xl:block">
            <div className="space-y-8">
               <div className="flex justify-between items-center pb-8 border-b border-white/5">
                  <span className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Network Status</span>
                  <div className="w-3 h-3 bg-green rounded-full animate-pulse shadow-[0_0_10px_rgba(22,198,110,0.8)]"></div>
               </div>
               <div className="space-y-5">
                  <div className="flex justify-between">
                     <span className="text-[11px] font-bold text-soft-grey">System Status</span>
                     <span className="text-[11px] font-black text-green tracking-widest">ACTIVE</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="w-full h-full bg-green shadow-[0_0_10px_rgba(22,198,110,0.4)]"></div>
                  </div>
               </div>
               <div className="space-y-5">
                  <div className="flex justify-between">
                     <span className="text-[11px] font-black text-white">4,281 ACTIVE USERS</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="w-3/4 h-full bg-blue shadow-[0_0_10px_rgba(74,104,231,0.4)]"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Right Column: Authentication Form (Balanced) */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-20 xl:p-32 relative bg-navy lg:bg-transparent">
         <div className="w-full max-w-[480px] space-y-16">
            <div className="lg:hidden flex items-center justify-center gap-4 mb-12">
               {branding?.LOGO_SQUARE ? (
                 <img src={`${apiBaseUrl}${branding.LOGO_SQUARE}`} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
               ) : (
                 <span className="material-icons-outlined text-green text-4xl">shield</span>
               )}
               <h2 className="text-3xl font-black tracking-tighter italic">{branding?.APP_NAME || 'Gencom Pay'}</h2>
            </div>

            <div className="space-y-6 text-center lg:text-left">
               <h2 className="text-5xl font-black italic tracking-tighter text-white">Sign In</h2>
               <p className="text-[11px] font-black text-soft-grey uppercase tracking-[0.4em] px-1">Enter your email and password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
               {error && (
                 <div className="bg-red-400/10 border border-red-400/20 text-red-400 p-8 rounded-[2.5rem] text-[10px] font-black text-center animate-shake uppercase tracking-[0.2em] shadow-2xl">
                   <span className="material-icons-outlined text-lg mb-2 block">report_problem</span>
                   {error}
                 </div>
               )}

               <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4">Email Address</label>
                    <div className="relative group">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 material-icons-outlined text-soft-grey group-focus-within:text-green transition-all text-xl">alternate_email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="glass-input w-full pl-20 py-7 text-sm font-medium"
                        placeholder="name@gencom.io"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                      <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Password</label>
                      <Link href="/auth/forgot-password" title="Recover Password" className="text-[10px] font-black text-green uppercase tracking-[0.2em] hover:underline">Forgot Password?</Link>
                    </div>
                    <div className="relative group">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 material-icons-outlined text-soft-grey group-focus-within:text-green transition-all text-xl">vpn_key</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="glass-input w-full pl-20 py-7 tracking-[1em] text-xl font-bold"
                        placeholder="••••••"
                        required
                      />
                    </div>
                  </div>
                          <button
                 type="submit"
                 className="btn-primary w-full py-8 text-sm shadow-[0_20px_50px_rgba(22,198,110,0.2)]"
               >
                 SIGN IN
               </button>
     </div>
            </form>

            <div className="pt-12 text-center lg:text-left space-y-12">
               <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em]">
                New User?{' '}
                <Link href="/register" className="text-green font-black hover:underline tracking-widest">
                  Create Account
                </Link>
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 opacity-30 group cursor-help transition-opacity hover:opacity-100">
                 <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-base">verified_user</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Secure Connection</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-base">dns</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">TLS 1.3 SECURE</span>
                 </div>
              </div>
            </div>
         </div>
      </div>

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
