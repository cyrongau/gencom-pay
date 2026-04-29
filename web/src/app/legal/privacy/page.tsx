'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0B1225] text-white font-sans p-10 md:p-24 selection:bg-green/30">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <header className="space-y-6">
           <Link href="/" className="inline-flex items-center gap-3 text-soft-grey hover:text-white transition-colors group">
              <span className="material-icons-outlined text-sm">arrow_back</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Gencom Pay</span>
           </Link>
           <h1 className="text-6xl font-black italic tracking-tighter italic">Privacy Policy</h1>
           <p className="text-sm text-soft-grey font-medium uppercase tracking-widest">Effective Date: April 27, 2026</p>
        </header>

        <div className="h-px bg-white/10 w-full"></div>

        {/* Content */}
        <div className="space-y-12 text-soft-grey leading-relaxed">
           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">1. Protocol Overview</h2>
              <p>
                Gencom Pay ("we," "our," or "us") is committed to protecting the privacy of our users. This Privacy Policy 
                outlines our practices regarding the collection, use, and disclosure of your information when you use our 
                unified financial ledger and exchange platform.
              </p>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">2. Information Collection</h2>
              <p>We collect information to provide a secure and compliant financial experience:</p>
              <ul className="list-disc pl-6 space-y-4">
                 <li><strong>Identity Data:</strong> Full name, date of birth, and government-issued identification for KYC compliance.</li>
                 <li><strong>Financial Data:</strong> Wallet addresses, transaction history, and settlement preferences.</li>
                 <li><strong>Technical Data:</strong> IP address, device fingerprints, and biometric hashes (processed locally on-device).</li>
              </ul>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">3. Data Security Protocols</h2>
              <p>
                Your data is protected by industry-standard encryption and secure multi-party computation (SMPC) techniques. 
                We do not store your private keys or raw biometric data. All biometric authentication is handled by your 
                device's secure enclave (Tee/SEP).
              </p>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">4. Third-Party Disclosure</h2>
              <p>
                We may share your data with regulatory authorities only when required by law or to prevent fraudulent 
                activity within the Gencom network. We do not sell your personal information to third parties.
              </p>
           </section>

           <section className="space-y-10 p-10 bg-white/5 border border-white/10 rounded-[3rem]">
              <h3 className="text-xl font-black text-white italic">Contact Security Compliance</h3>
              <p className="text-sm">For inquiries regarding your data or to request a protocol audit of your account info, please contact:</p>
              <div className="flex gap-8">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green">Email</p>
                    <p className="text-white font-bold">compliance@gencom.io</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green">Support</p>
                    <p className="text-white font-bold">support.gencom.io</p>
                 </div>
              </div>
           </section>
        </div>

        <footer className="pt-20 border-t border-white/5 flex justify-between items-center opacity-40">
           <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Gencom Pay Ecosystem</p>
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
              <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
           </div>
        </footer>

      </div>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
