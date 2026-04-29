'use client';

import React from 'react';
import Link from 'next/link';

interface MerchantLockBannerProps {
  status: 'PENDING' | 'SUSPENDED';
}

export default function MerchantLockBanner({ status }: MerchantLockBannerProps) {
  const isPending = status === 'PENDING';

  return (
    <div className="mb-12 animate-in slide-in-from-top duration-700">
      <div className={`p-10 rounded-[3rem] border flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative ${
        isPending ? 'bg-gold/10 border-gold/30' : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className={`absolute top-0 left-0 w-64 h-64 blur-[100px] -ml-20 -mt-20 ${isPending ? 'bg-gold/10' : 'bg-red-500/10'}`}></div>
        
        <div className="flex items-center gap-8 relative z-10">
           <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center border shadow-2xl ${
             isPending ? 'bg-gold/20 border-gold/40' : 'bg-red-500/20 border-red-500/40'
           }`}>
              <span className={`material-icons-outlined text-4xl ${isPending ? 'text-gold' : 'text-red-500'}`}>
                {isPending ? 'pending_actions' : 'gpp_bad'}
              </span>
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                {isPending ? 'Action Required: Verification Pending' : 'Account Suspended'}
              </h3>
              <p className="text-soft-grey text-xs font-medium max-w-xl">
                {isPending 
                  ? 'Your merchant features are currently locked. Please upload your business verification documents to gain full access to terminals, settlements, and team management.'
                  : 'Access to your merchant services has been restricted. Please contact our compliance team at compliance@gencom.io for more information.'
                }
              </p>
           </div>
        </div>

        {isPending && (
          <Link 
            href="/merchant/settings" 
            className="bg-gold text-navy font-black italic text-xs px-10 py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest relative z-10 shrink-0"
          >
            Upload KYC Documents
          </Link>
        )}
      </div>
      
      {/* Visual Overlay for locked content */}
      <style jsx global>{`
        .locked-content {
          position: relative;
          pointer-events: none;
          opacity: 0.4;
          filter: grayscale(1);
          user-select: none;
        }
      `}</style>
    </div>
  );
}
