'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

const PLATFORMS = [
  { id: 'wallet', name: 'Gencom Wallet', icon: 'account_balance_wallet', color: 'green' },
  { id: 'zaad', name: 'ZAAD (Telesom)', icon: 'smartphone', color: 'blue' },
  { id: 'edahab', name: 'eDahab (Somtel)', icon: 'payments', color: 'gold' },
  { id: 'bank', name: 'Local Bank', icon: 'account_balance', color: 'soft-grey' },
];

export default function EscrowPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [sourcePlatform, setSourcePlatform] = useState('zaad');
  const [destPlatform, setDestPlatform] = useState('wallet');
  const [amount, setAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    setFetching(true);
    try {
      await Promise.all([fetchEscrows(), fetchWallets()]);
    } finally {
      setFetching(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data);
    } catch (err) {
      console.error('Failed to fetch wallets', err);
    }
  };

  const fetchEscrows = async () => {
    try {
      const res = await api.get('/escrows');
      setEscrows(res.data);
    } catch (err) {
      console.error('Failed to fetch escrows', err);
    }
  };

  const handleCreateEscrow = async () => {
    if (!amount) return;
    setCreating(true);
    try {
      const usdWallet = wallets.find(w => w.currency === 'USD') || wallets[0];
      if (!usdWallet) {
        showNotification('No wallet found to back the escrow. Please create a wallet first.', 'error');
        return;
      }

      await api.post('/escrows', { 
        amount, 
        currency: 'USD',
        description: `Bridge from ${sourcePlatform} to ${destPlatform}`,
        sourcePlatform, 
        destPlatform,
        buyerWalletId: usdWallet.id,
        sellerWalletId: usdWallet.id // Simulating same user for bridge
      });
      
      showNotification('Escrow bridge initiated successfully!', 'success');
      setAmount('');
      fetchEscrows();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to initiate escrow bridge', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await api.post(`/escrows/${id}/release`);
      showNotification('Funds released successfully!', 'success');
      fetchEscrows();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to release funds', 'error');
    }
  };

  const handleRefund = async (id: string) => {
    try {
      await api.post(`/escrows/${id}/refund`);
      showNotification('Funds refunded successfully!', 'success');
      fetchEscrows();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to refund funds', 'error');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1225] text-foreground selection:bg-green/30">
      {/* Header */}
      <header className="bg-navy/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-soft-grey hover:text-white transition-colors">
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green to-blue">
               Secure Payments
            </h1>
          </div>
          <div className="bg-green/10 px-4 py-1.5 rounded-full border border-green/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-green uppercase tracking-widest">Secure Payment v2</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        <div className="grid grid-cols-12 gap-10">
          
          {/* Create Escrow Bridge Form */}
          <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-[100px] group-hover:bg-green/10 transition-all"></div>
              
              <h2 className="text-3xl font-black italic mb-8 relative z-10">New Payment</h2>
              
              <div className="space-y-8 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] block mb-4 px-2">From Platform</label>
                  <div className="grid grid-cols-2 gap-4">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSourcePlatform(p.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${sourcePlatform === p.id ? 'bg-blue/20 border-blue text-white shadow-xl scale-[1.02]' : 'bg-white/5 border-white/5 text-soft-grey hover:bg-white/10'}`}
                      >
                        <span className="material-icons-outlined text-sm">{p.icon}</span>
                        <span className="text-[11px] font-black uppercase tracking-widest">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => {
                        const temp = sourcePlatform;
                        setSourcePlatform(destPlatform);
                        setDestPlatform(temp);
                    }}
                    className="bg-white/5 p-3 rounded-full border border-white/10 hover:bg-white/10 hover:rotate-180 transition-all duration-500"
                  >
                    <span className="material-icons-outlined text-green rotate-90">swap_horiz</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] block mb-4 px-2">To Platform</label>
                  <div className="grid grid-cols-2 gap-4">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setDestPlatform(p.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${destPlatform === p.id ? 'bg-green/20 border-green text-white shadow-xl scale-[1.02]' : 'bg-white/5 border-white/5 text-soft-grey hover:bg-white/10'}`}
                      >
                        <span className="material-icons-outlined text-sm">{p.icon}</span>
                        <span className="text-[11px] font-black uppercase tracking-widest">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-navy/40 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between group-focus-within:border-green/30 transition-all">
                  <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Amount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black italic text-soft-grey">$</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent text-right text-3xl font-black italic text-white focus:outline-none w-32 tracking-tighter"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCreateEscrow}
                  disabled={creating || !amount}
                  className="w-full bg-green text-navy font-black italic text-sm py-6 rounded-[2rem] shadow-2xl shadow-green/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest"
                >
                  {creating ? 'Processing...' : 'Confirm Secure Payment'}
                </button>
              </div>
            </div>
          </section>

          {/* Bridge Activity */}
          <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl min-h-[600px] relative overflow-hidden group">
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue/5 rounded-full blur-[100px] group-hover:bg-blue/10 transition-all"></div>
              
              <div className="flex justify-between items-center mb-10 relative z-10">
                <h2 className="text-3xl font-black italic">Payment Activity</h2>
                <div className="flex items-center gap-3">
                   <button onClick={fetchData} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
                      <span className={`material-icons-outlined text-sm ${fetching ? 'animate-spin' : ''}`}>refresh</span>
                   </button>
                   <span className="material-icons-outlined text-soft-grey">history</span>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                {escrows.length === 0 && !fetching ? (
                   <div className="py-20 text-center space-y-4 opacity-40">
                      <span className="material-icons-outlined text-5xl">bridge</span>
                       <p className="text-xs font-black uppercase tracking-widest">No active payments found</p>
                   </div>
                ) : (
                  escrows.map((escrow) => (
                    <div key={escrow.id} className="bg-navy/40 border border-white/5 rounded-[2.5rem] p-8 hover:border-white/20 transition-all group/item shadow-lg">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center ${escrow.status === 'LOCKED' ? 'bg-gold/10' : escrow.status === 'RELEASED' ? 'bg-green/10' : 'bg-red-400/10'}`}>
                            <span className={`material-icons-outlined text-2xl ${escrow.status === 'LOCKED' ? 'text-gold' : escrow.status === 'RELEASED' ? 'text-green' : 'text-red-400'}`}>
                              {escrow.status === 'LOCKED' ? 'lock' : escrow.status === 'RELEASED' ? 'check_circle' : 'error'}
                            </span>
                          </div>
                          <div>
                            <p className="text-2xl font-black italic tracking-tighter">${parseFloat(escrow.amount).toFixed(2)} {escrow.currency}</p>
                            <p className="text-[10px] font-black uppercase text-soft-grey tracking-widest">{new Date(escrow.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-[0.2em] ${
                          escrow.status === 'LOCKED' ? 'bg-gold/10 text-gold border-gold/20' : escrow.status === 'RELEASED' ? 'bg-green/10 text-green border-green/20' : 'bg-red-400/10 text-red-400 border-red-400/20'
                        }`}>
                          {escrow.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 bg-white/5 rounded-3xl p-5 border border-white/5">
                        <div className="flex flex-col items-center flex-1">
                           <span className="text-[8px] text-soft-grey font-black uppercase tracking-widest mb-2 opacity-50">Pay From</span>
                          <div className="flex items-center gap-2">
                             <span className="material-icons-outlined text-xs text-blue">hub</span>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">{escrow.source_platform}</span>
                          </div>
                        </div>
                        <div className="flex items-center opacity-20">
                           <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                           <div className="w-8 h-px bg-white"></div>
                           <span className="material-icons-outlined text-sm mx-1">chevron_right</span>
                           <div className="w-8 h-px bg-white"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                           <span className="text-[8px] text-soft-grey font-black uppercase tracking-widest mb-2 opacity-50">Pay To</span>
                          <div className="flex items-center gap-2">
                             <span className="material-icons-outlined text-xs text-green">account_tree</span>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">{escrow.destination_platform}</span>
                          </div>
                        </div>
                      </div>

                      {escrow.status === 'LOCKED' && (
                        <div className="mt-6 flex gap-4">
                          <button 
                            onClick={() => handleRelease(escrow.id)}
                            className="flex-1 bg-green/10 hover:bg-green/20 border border-green/20 text-green text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all"
                          >
                            Pay Out
                          </button>
                          <button 
                            onClick={() => handleRefund(escrow.id)}
                            className="px-6 bg-red-400/10 border border-red-400/10 text-red-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-red-400/20 transition-all"
                          >
                            Cancel Payment
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>
      </main>

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
