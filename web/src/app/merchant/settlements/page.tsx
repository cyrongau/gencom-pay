'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';

export default function MerchantSettlements() {
  const { user, loading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  
  const [settlements, setSettlements] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, loading, router]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [sRes, bRes] = await Promise.all([
        api.get('/merchant/settlements'),
        api.get('/merchant/balance')
      ]);
      setSettlements(sRes.data);
      setBalance(bRes.data);
    } catch (err) {
      console.error('Failed to fetch settlement data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInstantSettlement = async () => {
    if (!balance || parseFloat(balance.balance) <= 0) return;
    setIsSettling(true);
    try {
      await api.post('/merchant/settlements/instant');
      showNotification('Instant Bridge Protocol Initiated. Funds will be dispersed shortly.', 'success');
      await fetchData();
    } catch (err) {
      console.error('Settlement failed', err);
      showNotification('Failed to initiate settlement. Please check your balance.', 'error');
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Header & Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 px-4">
           <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter">Settlement Ledger</h1>
              <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Dispersion Protocols & Funds History</p>
           </div>
           
           <div className="flex gap-4">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 pr-12">
                 <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mb-1">Pending Balance</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white italic">{balance?.balance || '0.00'}</span>
                    <span className="text-[10px] font-black text-green uppercase tracking-widest">{balance?.currency || 'USD'}</span>
                 </div>
              </div>
              <button 
                onClick={fetchData}
                disabled={isRefreshing}
                className="w-16 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center hover:bg-white/10 transition-all"
              >
                 <span className={`material-icons-outlined ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
              </button>
           </div>
        </div>

        {/* Settlement Status Banner */}
        <div className="mx-4 p-8 bg-blue/5 border border-blue/20 rounded-[2.5rem] flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-blue/10 rounded-2xl flex items-center justify-center">
                 <span className="material-icons-outlined text-blue">event_repeat</span>
              </div>
              <div>
                 <p className="text-sm font-black text-white italic">Automatic Daily Batching Active</p>
                 <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest mt-1">Next settlement protocol initiated at 00:00 UTC</p>
              </div>
           </div>
           <button 
             onClick={handleInstantSettlement}
             disabled={isSettling || !balance || parseFloat(balance.balance) <= 0}
             className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-50"
           >
             {isSettling ? 'Processing...' : 'Request Instant Bridge'}
           </button>
        </div>

        {/* Ledger Table */}
        <div className="mx-4 bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
           
           <table className="w-full text-left relative z-10">
              <thead>
                 <tr className="text-[11px] font-black text-soft-grey uppercase tracking-[0.4em] border-b border-white/5 pb-10">
                    <th className="pb-10 pl-6 italic">Settlement ID</th>
                    <th className="pb-10 italic">Amount</th>
                    <th className="pb-10 italic">Destination</th>
                    <th className="pb-10 italic">Status</th>
                    <th className="pb-10 text-right pr-6 italic">Timestamp</th>
                 </tr>
              </thead>
              <tbody className="text-sm">
                 {settlements.map((settlement) => (
                    <tr key={settlement.id} className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
                       <td className="py-8 pl-6 font-mono text-[10px] text-white/60 uppercase">
                          {settlement.id.substring(0, 12)}...
                       </td>
                       <td className="py-8">
                          <div className="flex items-baseline gap-2">
                             <span className="font-black text-white italic">{settlement.amount}</span>
                             <span className="text-[8px] font-black text-soft-grey uppercase tracking-widest">{settlement.currency}</span>
                          </div>
                       </td>
                       <td className="py-8">
                          <div className="flex items-center gap-2">
                             <span className="material-icons-outlined text-xs text-soft-grey">account_balance_wallet</span>
                             <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">
                                {settlement.destination_wallet_id ? `Wallet ${settlement.destination_wallet_id.substring(0, 6)}` : 'Primary Node'}
                             </span>
                          </div>
                       </td>
                       <td className="py-8">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest border ${
                            settlement.status === 'COMPLETED' ? 'bg-green/10 text-green border-green/20' : 
                            settlement.status === 'PENDING' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-red-400/10 text-red-400 border-red-400/20'
                          }`}>
                             {settlement.status}
                          </span>
                       </td>
                       <td className="py-8 text-right pr-6 text-soft-grey font-medium text-xs">
                          {new Date(settlement.created_at).toLocaleString()}
                       </td>
                    </tr>
                 ))}
                 
                 {settlements.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                             <span className="material-icons-outlined text-6xl">receipt_long</span>
                             <p className="text-[10px] font-black uppercase tracking-[0.4em]">No settlement records found</p>
                          </div>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

      </div>
    </Shell>
  );
}
