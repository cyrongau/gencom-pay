'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';

export default function AdminVolume() {
  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Volume Analytics</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Historical & Real-Time Protocol Throughput</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-2xl h-[500px] flex flex-col items-center justify-center space-y-6">
           <div className="w-20 h-20 bg-blue/10 rounded-[2rem] flex items-center justify-center border border-blue/20">
              <span className="material-icons-outlined text-blue text-4xl">insights</span>
           </div>
           <h3 className="text-2xl font-black italic">Advanced Charting</h3>
           <p className="text-[10px] text-soft-grey uppercase tracking-[0.3em] max-w-md text-center leading-relaxed">
              Integration with TradingView & Real-time ledger sockets is being synchronized. Switch to list view for raw data.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-6">
              <h4 className="text-lg font-black italic">Top Corridors</h4>
              <div className="space-y-4">
                 <CorridorLine from="USD" to="SLS" vol="$420K" />
                 <CorridorLine from="BTC" to="KES" vol="$180K" />
                 <CorridorLine from="ETH" to="USD" vol="$120K" />
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-6">
              <h4 className="text-lg font-black italic">Active Nodes</h4>
              <div className="space-y-4">
                 <NodeLine name="Mogadishu-01" status="ACTIVE" />
                 <NodeLine name="Nairobi-Main" status="ACTIVE" />
                 <NodeLine name="Dubai-Bridge" status="MAINTENANCE" />
              </div>
           </div>
        </div>
      </div>
    </AdminShell>
  );
}

function CorridorLine({ from, to, vol }: any) {
  return (
    <div className="flex justify-between items-center pb-4 border-b border-white/5">
       <span className="text-[11px] font-black uppercase tracking-widest">{from} / {to}</span>
       <span className="text-sm font-black italic text-green">{vol}</span>
    </div>
  );
}

function NodeLine({ name, status }: any) {
  return (
    <div className="flex justify-between items-center pb-4 border-b border-white/5">
       <span className="text-[11px] font-black uppercase tracking-widest">{name}</span>
       <span className={`text-[9px] font-black tracking-widest ${status === 'ACTIVE' ? 'text-green' : 'text-gold'}`}>{status}</span>
    </div>
  );
}
