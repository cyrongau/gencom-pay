'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, branding } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-green/30 flex overflow-hidden font-sans">
      
      {/* Left Column: Branding & Vision (Expanded) */}
      <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] bg-gradient-dashboard relative items-center justify-center p-24 overflow-hidden border-r border-white/5 shadow-2xl">
         <div className="absolute top-0 left-0 w-[100%] h-[100%] bg-blue/10 rounded-full blur-[150px] -ml-64 -mt-64 opacity-50"></div>
         
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
                  Build Your <br />
                  <span className="text-green">Financial</span> <br />
                  Identity.
               </h1>
               <p className="text-2xl text-white/60 leading-relaxed font-medium max-w-2xl">
                  Join the unified network for global payments. One account, infinite possibilities across fiat, crypto, and commerce.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-10">
               <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl group hover:bg-white/10 transition-all">
                  <div className="w-16 h-16 bg-green/10 rounded-2xl flex items-center justify-center mb-8 border border-green/20 group-hover:scale-110 transition-transform">
                    <span className="material-icons-outlined text-green text-4xl">account_balance_wallet</span>
                  </div>
                  <h4 className="text-2xl font-black italic mb-4">Unified Wallet</h4>
                  <p className="text-xs text-soft-grey uppercase tracking-[0.2em] leading-relaxed">Manage ZAAD, eDahab, Banks and Crypto in one app.</p>
               </div>
               <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl group hover:bg-white/10 transition-all">
                  <div className="w-16 h-16 bg-blue/10 rounded-2xl flex items-center justify-center mb-8 border border-blue/20 group-hover:scale-110 transition-transform">
                    <span className="material-icons-outlined text-blue text-4xl">verified</span>
                  </div>
                  <h4 className="text-2xl font-black italic mb-4">AI Compliance</h4>
                  <p className="text-xs text-soft-grey uppercase tracking-[0.2em] leading-relaxed">Instant KYC verification powered by Gencom Security.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Right Column: Registration Form (Balanced) */}
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
               <h2 className="text-5xl font-black italic tracking-tighter text-white">Create Account</h2>
               <p className="text-[11px] font-black text-soft-grey uppercase tracking-[0.4em] px-1">Sign up for a Gencom Pay account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
               {error && (
                 <div className="bg-red-400/10 border border-red-400/20 text-red-400 p-8 rounded-[2.5rem] text-[10px] font-black text-center animate-shake uppercase tracking-[0.2em] shadow-2xl">
                   <span className="material-icons-outlined text-lg mb-2 block">report_problem</span>
                   {error}
                 </div>
               )}

               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4">Full Name</label>
                    <div className="relative group">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 material-icons-outlined text-soft-grey group-focus-within:text-green transition-all text-xl">person_outline</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="glass-input w-full pl-20 py-7 text-sm font-medium"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

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
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4">Password</label>
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
               </div>

               <div className="space-y-8">
                  <button
                    type="submit"
                    className="btn-primary w-full py-8 text-sm shadow-[0_20px_50px_rgba(22,198,110,0.2)]"
                  >
                    CREATE ACCOUNT
                  </button>

                  <p className="text-[9px] text-soft-grey uppercase tracking-[0.3em] text-center leading-relaxed px-10 font-bold opacity-60">
                     By joining, you agree to our <span className="text-white hover:underline cursor-pointer">Terms of Service</span> and <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.
                  </p>
               </div>
            </form>

            <div className="pt-8 text-center lg:text-left">
               <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em]">
                Already have an account?{' '}
                <Link href="/login" className="text-green font-black hover:underline tracking-widest">
                  Sign In
                </Link>
              </p>
            </div>
         </div>
      </div>

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
