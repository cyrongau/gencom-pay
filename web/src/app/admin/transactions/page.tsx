'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';

export default function AdminTransactions() {
  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-end px-4">
           <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter">Master Ledger</h1>
              <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Audit Every Atomic Settlement Across The Network</p>
           </div>
           <div className="flex gap-4">
              <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Filter Nodes</button>
              <button className="btn-primary px-8 py-3 text-[10px]">Export .SQL</button>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-2xl overflow-x-auto">
           <table className="w-full text-left min-w-[1000px]">
              <thead>
                 <tr className="text-[11px] font-black text-soft-grey uppercase tracking-[0.4em] border-b border-white/5 pb-10">
                    <th className="pb-10 pl-6 italic">Ledger Hash</th>
                    <th className="pb-10 italic">Source / Destination</th>
                    <th className="pb-10 italic">Protocol</th>
                    <th className="pb-10 italic">Finalized At</th>
                    <th className="pb-10 italic">Volume</th>
                    <th className="pb-10 text-right pr-6 italic">State</th>
                 </tr>
              </thead>
              <tbody className="text-sm">
                 <MasterRow hash="0x48a...19e" source="User #849" dest="Merchant #22" protocol="SWAP" time="2s ago" amount="$1,240.00" status="FINALIZED" />
                 <MasterRow hash="0x92c...84a" source="Bank #10" dest="Wallet #491" protocol="DEPOSIT" time="5m ago" amount="$15,000.00" status="PENDING" />
                 <MasterRow hash="0xb21...741" source="Wallet #11" dest="User #02" protocol="P2P" time="12m ago" amount="$45.00" status="FINALIZED" />
              </tbody>
           </table>
        </div>
      </div>
    </AdminShell>
  );
}

function MasterRow({ hash, source, dest, protocol, time, amount, status }: any) {
  return (
    <tr className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
       <td className="py-10 pl-6">
          <span className="font-mono text-xs text-white/40 group-hover:text-green transition-colors">{hash}</span>
       </td>
       <td className="py-10">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-white italic">{source}</span>
             <span className="text-[9px] text-soft-grey uppercase tracking-widest mt-1">➔ {dest}</span>
          </div>
       </td>
       <td className="py-10">
          <span className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">{protocol}</span>
       </td>
       <td className="py-10 text-soft-grey font-medium text-xs">
          {time}
       </td>
       <td className="py-10 text-base font-black text-white italic tracking-tight">
          {amount}
       </td>
       <td className="py-10 text-right pr-6">
          <span className={`inline-block px-4 py-1.5 rounded-lg text-[9px] font-black tracking-[0.2em] shadow-xl border ${
            status === 'FINALIZED' ? 'bg-green/10 text-green border-green/20' : 'bg-gold/10 text-gold border border-gold/20'
          }`}>
             {status}
          </span>
       </td>
    </tr>
  );
}
