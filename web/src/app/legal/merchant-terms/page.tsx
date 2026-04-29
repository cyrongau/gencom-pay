'use client';

import React from 'react';
import Link from 'next/link';

export default function MerchantTerms() {
  return (
    <div className="min-h-screen bg-[#0B1225] text-white font-sans p-10 md:p-24 selection:bg-green/30">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <header className="space-y-6">
           <Link href="/merchant/kyc" className="inline-flex items-center gap-3 text-soft-grey hover:text-white transition-colors group">
              <span className="material-icons-outlined text-sm">arrow_back</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Verification</span>
           </Link>
           <h1 className="text-6xl font-black italic tracking-tighter italic">Merchant Protocol</h1>
           <p className="text-sm text-soft-grey font-medium uppercase tracking-widest">Compliance & Settlement Terms v1.4</p>
        </header>

        <div className="h-px bg-white/10 w-full"></div>

        {/* Content */}
        <div className="space-y-12 text-soft-grey leading-relaxed">
           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">1. Settlement Framework</h2>
              <p>
                By enrolling as a Gencom Pay Merchant, you agree to the following settlement rules:
              </p>
              <ul className="list-disc pl-6 space-y-4">
                 <li><strong>Daily:</strong> Funds collected are batched and released to your settlement wallet at 00:00 UTC.</li>
                 <li><strong>Instant:</strong> Funds are settled immediately after transaction authorization, subject to a 2% bridge fee.</li>
                 <li><strong>Weekly:</strong> Total weekly volume is settled every Monday morning.</li>
              </ul>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">2. Compliance & Verification</h2>
              <p>
                All merchants must undergo Business KYC (Know Your Business) verification. You are required to submit:
              </p>
              <ul className="list-disc pl-6 space-y-4">
                 <li>Proof of Business Registration / Articles of Incorporation.</li>
                 <li>Current Operating Licence.</li>
                 <li>Tax Identification Number (TIN/VAT) if applicable.</li>
              </ul>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">3. Fee Structure</h2>
              <p>
                Gencom Pay charges a standard 1.5% transaction fee on all C2B (Merchant Terminal) payments. 
                Cross-currency bridge fees may apply if the customer pays in a currency different from your 
                settlement preference.
              </p>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-black text-white italic">4. Prohibited Businesses</h2>
              <p>
                Gencom Pay prohibits the processing of payments for gambling, unlicensed pharmaceuticals, 
                adult content, and any other illegal goods or services.
              </p>
           </section>

           <section className="space-y-10 p-10 bg-[#0F3D3A]/20 border border-green/20 rounded-[3rem]">
              <h3 className="text-xl font-black text-white italic">Withdrawal Authorization</h3>
              <p className="text-sm">
                To withdraw settled funds to external bank accounts or crypto addresses, your account must 
                maintain a minimum reserve of 5% of your last 30-day volume to cover potential disputes.
              </p>
           </section>
        </div>

        <footer className="pt-20 border-t border-white/5 flex justify-between items-center opacity-40">
           <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Gencom Pay Merchant Services</p>
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
           </div>
        </footer>

      </div>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
