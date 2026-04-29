'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';

export default function AdminLiquidity() {
  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Liquidity Management</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Monitor Protocol Reserves & Settlement Nodes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-4">
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Total Reserves</p>
              <h2 className="text-4xl font-black italic">$1,240,492.00</h2>
           </div>
           <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-4">
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">SLS In-Circulation</p>
              <h2 className="text-4xl font-black italic">42,849,102</h2>
           </div>
           <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-4">
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Node Healthy</p>
              <h2 className="text-4xl font-black italic text-green">100%</h2>
           </div>
        </div>

        <section className="bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-2xl">
           <h3 className="text-2xl font-black italic mb-10">Reserve Allocation</h3>
           <div className="space-y-8">
              <div className="h-4 w-full bg-white/5 rounded-full flex overflow-hidden">
                 <div className="h-full bg-green" style={{ width: '40%' }}></div>
                 <div className="h-full bg-blue" style={{ width: '30%' }}></div>
                 <div className="h-full bg-gold" style={{ width: '20%' }}></div>
                 <div className="h-full bg-soft-grey" style={{ width: '10%' }}></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">USDC Reserve (40%)</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">BTC Node (30%)</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gold rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Mobile Cash (20%)</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-soft-grey rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Others (10%)</span>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </AdminShell>
  );
}
