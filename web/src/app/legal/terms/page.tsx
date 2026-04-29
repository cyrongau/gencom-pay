'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0B1225] text-white font-sans p-10 md:p-24 selection:bg-green/30">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <header className="space-y-6">
           <Link href="/" className="inline-flex items-center gap-3 text-soft-grey hover:text-white transition-colors group">
              <span className="material-icons-outlined text-sm">arrow_back</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Gencom Pay</span>
           </Link>
           <h1 className="text-6xl font-black italic tracking-tighter italic">Terms of Service</h1>
           <p className="text-sm text-soft-grey font-medium uppercase tracking-widest">Last Updated: April 27, 2026</p>
        </header>

        <div className="h-px bg-white/10 w-full"></div>

        {/* Content */}
        <div className="space-y-12 text-soft-grey leading-relaxed">
           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Gencom Pay platform, you agree to be bound by these Terms of Service. 
                If you do not agree to all of these terms, do not use our services.
              </p>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">2. Account Responsibility</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all 
                activities that occur under your account. You must notify us immediately of any unauthorized use 
                of your account or any other breach of security.
              </p>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">3. Prohibited Conduct</h2>
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc pl-6 space-y-4">
                 <li>Laundering money or financing illegal activities via the platform.</li>
                 <li>Circumventing or attempting to circumvent any security features or KYC protocols.</li>
                 <li>Using the platform for any fraudulent or deceptive purposes.</li>
              </ul>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">4. Financial Asset Risk</h2>
              <p>
                The value of certain assets (especially cryptocurrencies) may be highly volatile. You acknowledge 
                that there is a significant risk of loss in holding or trading these assets. Gencom Pay is not 
                responsible for any financial losses resulting from market fluctuations.
              </p>
           </section>

           <section className="space-y-10 p-10 bg-white/5 border border-white/10 rounded-[3rem]">
              <h3 className="text-xl font-black text-white italic">Dispute Resolution</h3>
              <p className="text-sm">
                Any disputes arising from these terms will be settled through binding arbitration in accordance 
                with the laws of the jurisdiction where Gencom Pay is registered.
              </p>
           </section>
        </div>

        <footer className="pt-20 border-t border-white/5 flex justify-between items-center opacity-40">
           <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Gencom Pay Ecosystem</p>
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
           </div>
        </footer>

      </div>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
