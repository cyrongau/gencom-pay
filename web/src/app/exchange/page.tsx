'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/Shell';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

const RATES: Record<string, number> = {
  'USD': 1.0,
  'KES': 134.20,
  'KSH': 134.20,
  'SLS': 294.11,
  'EUR': 0.92,
  'GBP': 0.78,
  'BTC': 0.000015,
  'ETH': 0.0004
};

export default function ExchangePage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [wallets, setWallets] = useState<any[]>([]);
  const [fromWallet, setFromWallet] = useState<string>('');
  const [toWallet, setToWallet] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data);
      if (res.data.length > 1) {
        setFromWallet(res.data[0].id);
        setToWallet(res.data[1].id);
      } else if (res.data.length > 0) {
        setFromWallet(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch wallets', err);
    }
  };

  const createWallet = async (currency: string = 'USD') => {
    setLoading(true);
    try {
      await api.post('/wallets', { currency });
      await fetchWallets();
      showNotification(`${currency} Account created!`, 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async () => {
    if (!amount || !fromWallet || !toWallet) return;
    setLoading(true);
    try {
      await api.post('/transactions/exchange', {
        fromWalletId: fromWallet,
        toWalletId: toWallet,
        amount: amount,
      });
      setSuccess(true);
      setAmount('');
    } catch (err: any) {
      console.error('Exchange failed', err);
    } finally {
      setLoading(false);
    }
  };

  const fromWalletData = wallets.find(w => w.id === fromWallet);
  const toWalletData = wallets.find(w => w.id === toWallet);

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Header */}
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Currency Exchange</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Instant Currency Conversion & Fast Settlement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left Column: Swap Form */}
           <div className="lg:col-span-7">
              <section className="bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-2xl relative flex flex-col h-full">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 
                 {success ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-green/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-green/20 shadow-2xl">
                         <span className="material-icons-outlined text-green text-5xl">sync_alt</span>
                      </div>
                      <h4 className="text-4xl font-black italic mb-4">Exchange Successful</h4>
                      <p className="text-lg text-soft-grey font-medium mb-10 max-w-md">Your account balances have been updated at real-time market rates.</p>
                      <button 
                        onClick={() => setSuccess(false)}
                        className="btn-primary py-6 px-12 text-sm"
                      >
                         NEW EXCHANGE
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-12 relative z-10 flex-1">
                      
                      {/* Sell Card */}
                      <div className="bg-navy/60 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-inner group focus-within:border-green/40 transition-all">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">You Pay</span>
                            <span className="text-[10px] text-green font-black uppercase tracking-widest bg-green/10 px-3 py-1 rounded-lg">Balance: {fromWalletData?.balance || '0.00'} {fromWalletData?.currency}</span>
                         </div>
                         <div className="flex justify-between items-center gap-10">
                            <div className="flex-1 relative">
                               <select 
                                 value={fromWallet}
                                 onChange={(e) => setFromWallet(e.target.value)}
                                 className="w-full bg-navy/80 text-2xl font-black text-white focus:outline-none rounded-xl px-4 py-2 appearance-none cursor-pointer italic tracking-tighter border border-white/10 group-hover:border-green/40 transition-all"
                               >
                                 {wallets.map(w => (
                                   <option key={w.id} value={w.id} className="bg-navy text-white">{w.currency}</option>
                                 ))}
                               </select>
                               <span className="material-icons-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green text-xl group-hover:scale-110 transition-transform">expand_more</span>
                            </div>
                            <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-transparent text-right text-5xl font-black text-white focus:outline-none w-[60%] italic tracking-tighter placeholder:text-white/10"
                            />
                         </div>
                      </div>

                      {/* Swap Divider */}
                      <div className="flex justify-center -my-16 relative z-20">
                         <div className="w-20 h-20 bg-gradient-signature rounded-[2rem] flex items-center justify-center shadow-2xl shadow-green/40 border-[12px] border-[#0B1225] rotate-45 group hover:rotate-[225deg] transition-transform duration-700 cursor-pointer">
                            <span className="material-icons-outlined text-white text-3xl -rotate-45">swap_vert</span>
                         </div>
                      </div>

                      {/* Buy Card */}
                      <div className="bg-navy/60 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-inner group focus-within:border-blue/40 transition-all pt-16">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">You Get (Est.)</span>
                         </div>
                         <div className="flex justify-between items-center gap-10">
                            <div className="flex-1 relative">
                               <select 
                                 value={toWallet}
                                 onChange={(e) => setToWallet(e.target.value)}
                                 className="w-full bg-navy/80 text-2xl font-black text-white focus:outline-none rounded-xl px-4 py-2 appearance-none cursor-pointer italic tracking-tighter border border-white/10 group-hover:border-blue/40 transition-all"
                               >
                                 {wallets.map(w => (
                                   <option key={w.id} value={w.id} className="bg-navy text-white">{w.currency}</option>
                                 ))}
                               </select>
                               <span className="material-icons-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue text-xl group-hover:scale-110 transition-transform">expand_more</span>
                            </div>
                            <div className="text-right text-5xl font-black text-white italic tracking-tighter opacity-40">
                               {amount && fromWalletData && toWalletData ? (parseFloat(amount) * (RATES[toWalletData.currency] / RATES[fromWalletData.currency]) * 0.9985).toFixed(2) : '0.00'}
                            </div>
                         </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-green text-sm">trending_up</span>
                            <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Market Rate</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-white tracking-widest italic">1 {fromWalletData?.currency || '...'} = {
                              fromWalletData && toWalletData 
                                ? (RATES[toWalletData.currency] / RATES[fromWalletData.currency]).toFixed(4)
                                : '1.0000'
                            } {toWalletData?.currency || '...'}</span>
                      </div>

                      <button 
                        onClick={handleExchange}
                        disabled={loading || !amount || !(user?.status === 'VERIFIED' || user?.status === 'ACTIVE')}
                        className="btn-primary w-full py-7 text-sm shadow-2xl disabled:grayscale group"
                      >
                         {!(user?.status === 'VERIFIED' || user?.status === 'ACTIVE') ? (
                            <span className="flex items-center gap-3"><span className="material-icons-outlined">lock</span> KYC VERIFICATION REQUIRED</span>
                         ) : (
                            <span className="flex items-center gap-3">
                               <span className="material-icons-outlined group-hover:rotate-180 transition-transform">autorenew</span>
                               {loading ? 'CALCULATING...' : 'CONVERT NOW'}
                            </span>
                         )}
                      </button>
                   </div>
                 )}
              </section>
           </div>

           {/* Right Column: Analytics & Rates */}
           <div className="lg:col-span-5 space-y-10">
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                 <h3 className="text-2xl font-black italic">Market Depth</h3>
                 <div className="space-y-6">
                    <RateAnalytics pair="BTC / USD" rate="64,231.00" trend="+1.2%" />
                    <RateAnalytics pair="ETH / USD" rate="2,450.12" trend="-0.4%" />
                    <RateAnalytics pair="KES / USD" rate="134.20" trend="+0.1%" />
                    <RateAnalytics pair="SLS / USD" rate="0.0034" trend="0.0%" />
                 </div>
              </section>

              <section className="bg-blue/10 border border-blue/20 rounded-[3rem] p-10 space-y-6 shadow-2xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue/10 rounded-2xl flex items-center justify-center border border-blue/20">
                       <span className="material-icons-outlined text-blue">bolt</span>
                    </div>
                    <h4 className="text-lg font-black italic">Fast Settlement</h4>
                 </div>
                 <p className="text-[10px] text-soft-grey leading-relaxed uppercase tracking-[0.2em] font-bold">
                    Swaps are executed via the Gencom Network. Settlement is fast with zero slippage for pairs within the platform.
                 </p>
                 <div className="pt-6 border-t border-blue/20 flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Service Fee</span>
                    <span className="text-xs font-black text-green tracking-widest">0.15% (Optimized)</span>
                 </div>
              </section>
           </div>

        </div>
      </div>
    </Shell>
  );
}

function RateAnalytics({ pair, rate, trend }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-navy/40 border border-white/5 rounded-2xl group hover:bg-white/5 transition-all">
       <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(22,198,110,0.6)]"></div>
          <p className="text-xs font-black text-white tracking-widest uppercase">{pair}</p>
       </div>
       <div className="text-right">
          <p className="text-sm font-mono font-bold text-white tracking-tighter">{rate}</p>
          <p className={`text-[9px] font-black ${trend.startsWith('+') ? 'text-green' : trend.startsWith('-') ? 'text-red-400' : 'text-soft-grey'}`}>{trend}</p>
       </div>
    </div>
  );
}
