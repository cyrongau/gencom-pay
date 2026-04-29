'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function LandingPage() {
  const { user, branding } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B1225] text-white selection:bg-[#16C66E]/30 overflow-x-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#16C66E]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#2B59FF]/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            {branding?.LOGO_LANDSCAPE ? (
              <img src={`${api.defaults.baseURL}${branding.LOGO_LANDSCAPE}`} className="h-10 object-contain transition-all" alt={branding?.APP_NAME || 'Generex'} />
            ) : (
              <>
                {branding?.LOGO_SQUARE ? (
                  <img src={`${api.defaults.baseURL}${branding.LOGO_SQUARE}`} className="w-10 h-10 object-contain" alt="Logo" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#16C66E] to-[#2B59FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#16C66E]/20 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-xl font-black italic">{branding?.APP_NAME?.[0] || 'G'}</span>
                  </div>
                )}
                <span className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  {branding?.APP_NAME || 'Generex'}
                </span>
              </>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-12">
            <a href="#vision" className="text-[10px] font-black uppercase tracking-widest text-soft-grey hover:text-white transition-colors">Vision</a>
            <a href="#users" className="text-[10px] font-black uppercase tracking-widest text-soft-grey hover:text-white transition-colors">Personal</a>
            <a href="#merchants" className="text-[10px] font-black uppercase tracking-widest text-soft-grey hover:text-white transition-colors">Business</a>
            <a href="#p2p" className="text-[10px] font-black uppercase tracking-widest text-soft-grey hover:text-white transition-colors">Exchange</a>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <Link href="/dashboard" className="bg-white/10 border border-white/20 px-6 py-2.5 rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-all group">
                <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                <div className="w-6 h-6 rounded-lg bg-green/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <span className="material-icons-outlined text-[14px] text-green">space_dashboard</span>
                </div>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-xs font-black uppercase tracking-widest text-soft-grey hover:text-white transition-colors">Sign In</Link>
                <Link href="/register" className="bg-gradient-to-r from-[#16C66E] to-[#2B59FF] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#16C66E]/20 hover:scale-105 active:scale-95 transition-all">
                  Join Network
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-48 pb-32">
        <div className="text-center space-y-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-full border border-white/10 animate-in fade-in zoom-in duration-1000">
            <span className="w-2 h-2 bg-[#16C66E] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#16C66E]">Next-Gen Financial Operating System</span>
          </div>
          
          <h1 className="text-7xl lg:text-[9rem] font-black leading-[0.85] tracking-[calc(-0.04em)] animate-in fade-in slide-in-from-bottom-12 duration-1000 uppercase">
            {(branding?.APP_NAME || 'Generex').split(' ')[0]} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#16C66E] via-[#16C66E] to-[#2B59FF]">
              {(branding?.APP_NAME || 'Generex').split(' ').slice(1).join(' ') || 'FINANCIAL NETWORK.'}
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-soft-grey max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            The high-fidelity bridge between Mobile Money, Global Banking, and Digital Assets. 
            Secured by a verified double-entry ledger.
          </p>

          <div className="flex justify-center gap-6 pt-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link href="/dashboard" className="bg-white text-navy font-black px-12 py-6 rounded-[2rem] shadow-2xl hover:bg-[#16C66E] hover:text-white transition-all transform hover:-translate-y-1">
              Start Building
            </Link>
            <Link href="#vision" className="bg-white/5 border border-white/10 text-white font-black px-12 py-6 rounded-[2rem] hover:bg-white/10 transition-all flex items-center gap-3 group">
              Watch Vision 
              <span className="material-icons-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Floating Dashboard Preview */}
        <div className="mt-32 relative group">
           <div className="absolute inset-0 bg-gradient-to-t from-[#16C66E]/20 to-transparent blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
           <div className="bg-navy/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-4 shadow-2xl overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-1000">
              <img src="/assets/dashboard.png" alt="Gencom Pay Dashboard" className="w-full h-auto rounded-[3.5rem] shadow-2xl" />
           </div>
           {/* Decorative Elements */}
           <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#16C66E]/20 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#2B59FF]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
      </section>

      {/* Section: The Problem & Solution */}
      <section id="vision" className="py-32 bg-white/2 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h2 className="text-5xl font-black italic leading-tight">The Problem with <br />Modern Finance.</h2>
            <div className="space-y-8">
              <ProblemItem title="Fragmentation" desc="Your money is trapped in isolated silos—Mobile Money, Local Banks, and Exchanges don't talk to each other." />
              <ProblemItem title="Opaque Settlement" desc="Transactions take days to settle with zero visibility into the underlying ledger." />
              <ProblemItem title="Identity Friction" desc="Onboarding is slow, manual, and insecure, leading to constant compliance delays." />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#16C66E]/20 to-[#2B59FF]/20 rounded-[4rem] p-16 border border-white/10 relative">
             <div className="absolute inset-0 bg-navy/40 backdrop-blur-3xl rounded-[4rem] z-0"></div>
             <div className="relative z-10 space-y-10">
                <h3 className="text-3xl font-black">The {branding?.APP_NAME || 'Generex'} Solution.</h3>
                <p className="text-soft-grey leading-relaxed">We built a unified protocol that treats every financial asset as a first-class citizen on a single, atomic ledger.</p>
                <div className="grid grid-cols-2 gap-6">
                   <SolutionCard icon="hub" label="Unified Bridge" />
                   <SolutionCard icon="verified" label="Atomic Ledger" />
                   <SolutionCard icon="psychology" label="AI KYC" />
                   <SolutionCard icon="auto_graph" label="Real-time Liquidity" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Section: Personal Banking (User) */}
      <section id="users" className="py-48 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5 space-y-10">
            <div className="w-16 h-16 bg-green/10 border border-green/20 rounded-[1.5rem] flex items-center justify-center">
              <span className="material-icons-outlined text-green text-3xl">person</span>
            </div>
            <h2 className="text-6xl font-black italic leading-none">Your Assets, <br />One Identity.</h2>
            <p className="text-xl text-soft-grey leading-relaxed">
              Ditch the 10 different apps. Manage your USD, BTC, and Local Assets in one high-integrity vault. 
              Our AI identity engine verifies you once, unlocking the entire ecosystem.
            </p>
            <div className="pt-6">
              <Link href="/register" className="group flex items-center gap-4 text-green font-black uppercase tracking-widest text-xs">
                Create Personal Node
                <span className="material-icons-outlined group-hover:translate-x-2 transition-transform">east</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 relative">
             <div className="absolute -inset-10 bg-gradient-to-r from-green/10 to-transparent blur-3xl"></div>
             <div className="relative bg-white/5 border border-white/10 rounded-[4rem] p-4 shadow-2xl overflow-hidden rotate-2 hover:rotate-0 transition-all duration-700">
                <img src="/assets/profile.png" alt="Personal Profile" className="w-full h-auto rounded-[3rem]" />
             </div>
          </div>
        </div>
      </section>

      {/* Section: Merchant Power */}
      <section id="merchants" className="py-48 bg-navy/50 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
               <div className="relative bg-white/5 border border-white/10 rounded-[4rem] p-4 shadow-2xl overflow-hidden -rotate-2 hover:rotate-0 transition-all duration-700">
                  <img src="/assets/merchant.png" alt="Merchant Dashboard" className="w-full h-auto rounded-[3rem]" />
               </div>
            </div>
            <div className="lg:col-span-5 space-y-10 order-1 lg:order-2">
              <div className="w-16 h-16 bg-blue/10 border border-blue/20 rounded-[1.5rem] flex items-center justify-center">
                <span className="material-icons-outlined text-blue text-3xl">storefront</span>
              </div>
              <h2 className="text-6xl font-black italic leading-none">Built for <br />Scale.</h2>
              <p className="text-xl text-soft-grey leading-relaxed">
                Accept payments globally, settle locally. Our Merchant Portal provides instant liquidity, 
                automated escrow protection, and robust webhooks for your developers.
              </p>
              <div className="space-y-6">
                <FeatureItem icon="lock" text="Smart Escrow Settlement" />
                <FeatureItem icon="code" text="High-Performance API" />
                <FeatureItem icon="account_balance" text="Instant Fiat Off-ramp" />
              </div>
              <div className="pt-6">
                <Link href="/merchant" className="bg-white/5 border border-white/10 text-white font-black px-10 py-5 rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest">
                  Become a Partner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: P2P & Exchange */}
      <section id="p2p" className="py-48 max-w-7xl mx-auto px-8">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-7xl font-black italic tracking-tighter">Liquid Markets.</h2>
          <p className="text-2xl text-soft-grey max-w-3xl mx-auto">Instant P2P transfers and currency exchange at mid-market rates. No hidden fees, just pure liquidity.</p>
        </div>
        <div className="relative">
           <div className="absolute inset-0 bg-[#F5B800]/5 blur-[120px] rounded-full"></div>
           <div className="relative bg-navy/40 border border-white/10 rounded-[5rem] p-8 shadow-2xl overflow-hidden">
              <img src="/assets/p2p.png" alt="Exchange Interface" className="w-full h-auto rounded-[4rem]" />
              {/* Overlay Statistics */}
              <div className="absolute bottom-20 left-20 right-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center backdrop-blur-xl bg-navy/60 p-12 rounded-[3rem] border border-white/10">
                 <div>
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mb-2">Average Settlement</p>
                    <p className="text-4xl font-black italic text-green">1.2 Seconds</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mb-2">P2P Volume</p>
                    <p className="text-4xl font-black italic text-white">$4.2M+</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mb-2">Network Uptime</p>
                    <p className="text-4xl font-black italic text-blue">99.99%</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-48 max-w-5xl mx-auto px-8 text-center space-y-16">
         <h2 className="text-7xl font-black leading-tight italic">Ready to Bridge the Gap?</h2>
         <div className="flex flex-col items-center gap-10">
            <Link href="/register" className="bg-gradient-to-r from-[#16C66E] to-[#2B59FF] text-white font-black px-16 py-8 rounded-[2.5rem] text-xl shadow-2xl shadow-[#16C66E]/20 hover:scale-105 active:scale-95 transition-all">
               Join the Generex Network
            </Link>
            <p className="text-soft-grey uppercase tracking-widest text-[10px] font-black">Zero Fees to Start • AI Verified in Minutes • Global Reach</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-20 bg-navy/20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              {branding?.LOGO_LANDSCAPE ? (
                <img src={`${api.defaults.baseURL}${branding.LOGO_LANDSCAPE}`} className="h-10 object-contain opacity-80 hover:opacity-100 transition-all" alt={branding?.APP_NAME || 'Generex'} />
              ) : (
                <>
                  {branding?.LOGO_SQUARE ? (
                    <img src={`${api.defaults.baseURL}${branding.LOGO_SQUARE}`} className="w-10 h-10 object-contain" alt="Logo" />
                  ) : (
                    <div className="w-10 h-10 bg-[#16C66E] rounded-xl flex items-center justify-center">
                      <span className="text-xl font-black italic text-navy">{branding?.APP_NAME?.[0] || 'G'}</span>
                    </div>
                  )}
                  <span className="text-2xl font-black italic tracking-tighter">{branding?.APP_NAME || 'Generex'}</span>
                </>
              )}
            </div>
            <p className="text-soft-grey max-w-sm leading-relaxed">
              Empowering the next billion users with high-integrity financial rails.
              Regulated liquidity and verified double-entry settlement.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Network</h4>
            <div className="flex flex-col gap-4 text-sm text-soft-grey font-medium">
               <a href="#" className="hover:text-green transition-colors">Exchange</a>
               <a href="#" className="hover:text-green transition-colors">Liquidity Pools</a>
               <a href="#" className="hover:text-green transition-colors">Developer Portal</a>
               <a href="#" className="hover:text-green transition-colors">System Status</a>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Company</h4>
            <div className="flex flex-col gap-4 text-sm text-soft-grey font-medium">
               <a href="#" className="hover:text-blue transition-colors">Vision</a>
               <a href="#" className="hover:text-blue transition-colors">Security Audit</a>
               <a href="#" className="hover:text-blue transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-blue transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] text-soft-grey font-black uppercase tracking-widest">© 2026 {branding?.APP_NAME || 'Gencom Pay'}. All Rights Reserved.</p>
           <div className="flex gap-8">
              <span className="text-[10px] font-black text-white flex items-center gap-2">
                 <span className="w-2 h-2 bg-green rounded-full animate-pulse"></span>
                 SYSTEM OPERATIONAL
              </span>
           </div>
        </div>
      </footer>
      
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}

function ProblemItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center shrink-0 border border-red-400/10 group-hover:bg-red-400/20 transition-all">
        <span className="material-icons-outlined text-red-400 text-xl">close</span>
      </div>
      <div>
        <h4 className="font-bold text-white mb-2">{title}</h4>
        <p className="text-sm text-soft-grey leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SolutionCard({ icon, label }: { icon: string, label: string }) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-4 hover:bg-white/10 transition-all cursor-default group">
       <span className="material-icons-outlined text-green text-3xl group-hover:scale-110 transition-transform">{icon}</span>
       <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string, text: string }) {
  return (
    <div className="flex items-center gap-4 group">
       <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center border border-blue/20 group-hover:bg-blue/20 transition-all">
          <span className="material-icons-outlined text-blue text-sm">{icon}</span>
       </div>
       <span className="text-sm font-bold text-white/80">{text}</span>
    </div>
  );
}
