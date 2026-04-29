'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

export default function TransfersPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [wallets, setWallets] = useState<any[]>([]);
  const [fromWallet, setFromWallet] = useState<string>('');
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [frequentRecipients, setFrequentRecipients] = useState<any[]>([]);

  useEffect(() => {
    fetchWallets();
    fetchFrequentRecipients();
  }, []);

  const fetchFrequentRecipients = async () => {
    try {
      const res = await api.get('/transactions/frequent-recipients');
      setFrequentRecipients(res.data);
    } catch (err) {
      console.error('Failed to fetch frequent recipients', err);
    }
  };

  useEffect(() => {
    if (fromWallet) {
      fetchTransactions();
    }
  }, [fromWallet]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/transactions/wallet/${fromWallet}`);
      setTransactions(res.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data);
      if (res.data.length > 0) setFromWallet(res.data[0].id);
    } catch (err) {
      console.error('Failed to fetch wallets', err);
    }
  };

  const createWallet = async () => {
    setLoading(true);
    try {
      await api.post('/wallets', { currency: 'USD' });
      await fetchWallets();
      showNotification('Primary USD Account created!', 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!amount || !recipientId || !fromWallet) return;
    setLoading(true);
    try {
      await api.post('/wallets/transfer', {
        fromWalletId: fromWallet,
        toWalletId: recipientId,
        amount: amount,
        description: description || 'P2P Transfer',
      });
      showNotification('Transfer completed successfully!', 'success');
      setAmount('');
      setRecipientId('');
      setDescription('');
      fetchTransactions();
      fetchFrequentRecipients();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Transfer Funds</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Instant Transfers Across the Network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left Column: Form */}
           <div className="lg:col-span-7 space-y-8">
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-10 shadow-2xl relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 
                 <div className="space-y-8 relative z-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">From Wallet</label>
                        <div className="relative">
                           {wallets.length > 0 ? (
                              <>
                                <select 
                                  value={fromWallet}
                                  onChange={(e) => setFromWallet(e.target.value)}
                                  className="glass-input w-full appearance-none pr-12 cursor-pointer"
                                >
                                   <option value="" disabled>Select From Wallet...</option>
                                   {wallets.map(w => (
                                     <option key={w.id} value={w.id} className="bg-navy py-4">
                                       {w.currency} Account — Bal: {parseFloat(w.balance || '0').toFixed(w.currency === 'BTC' ? 8 : 2)} {w.currency}
                                     </option>
                                   ))}
                                </select>
                                <span className="material-icons-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-soft-grey">expand_more</span>
                              </>
                           ) : (
                              <div className="flex items-center justify-between glass-input w-full">
                                <span className="text-xs text-soft-grey italic">No accounts found</span>
                                <button 
                                  type="button" 
                                  onClick={createWallet}
                                  disabled={loading}
                                  className="text-[10px] font-black text-green hover:underline uppercase tracking-widest disabled:opacity-50"
                                >
                                  {loading ? 'Creating...' : 'Create First Account'}
                                </button>
                              </div>
                           )}
                        </div>
                    </div>

                    {frequentRecipients.length > 0 && (
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Frequent Recipients</label>
                          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                             {frequentRecipients.map(r => (
                                <button 
                                  key={r.wallet_id}
                                  onClick={() => setRecipientId(r.wallet_id)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all shrink-0 ${
                                    recipientId === r.wallet_id ? 'bg-green/10 border-green text-green' : 'bg-white/5 border-white/5 text-soft-grey hover:bg-white/10 hover:border-white/10'
                                  }`}
                                >
                                   <div className="w-6 h-6 rounded-lg overflow-hidden">
                                      <img src={r.avatar_url || `https://ui-avatars.com/api/?name=${r.name}&background=16C66E&color=fff`} className="w-full h-full object-cover" alt={r.name} />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-widest">{r.name.split(' ')[0]}</span>
                                </button>
                             ))}
                          </div>
                       </div>
                    )}

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Recipient ID</label>
                       <div className="relative group">
                          <input 
                            type="text" 
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            placeholder="00000000-0000-0000-0000-000000000000"
                            className="glass-input w-full font-mono text-sm tracking-widest pl-14"
                          />
                          <span className="material-icons-outlined absolute left-6 top-1/2 -translate-y-1/2 text-soft-grey group-focus-within:text-green transition-colors">qr_code_scanner</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Transfer Amount</label>
                          <div className="relative">
                             <input 
                               type="number" 
                               value={amount}
                               onChange={(e) => setAmount(e.target.value)}
                               placeholder="0.00"
                               className="glass-input w-full text-2xl font-black italic tracking-tighter"
                             />
                             <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-soft-grey">
                                {wallets.find(w => w.id === fromWallet)?.currency || 'USD'}
                             </span>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Network Fee</label>
                          <div className="glass-input w-full bg-white/5 opacity-60 flex items-center justify-between">
                             <span className="text-xs font-bold text-soft-grey">Optimized</span>
                             <span className="text-xs font-black text-green">FREE</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Message (Optional)</label>
                       <input 
                         type="text" 
                         value={description}
                         onChange={(e) => setDescription(e.target.value)}
                         placeholder="What is this for?"
                         className="glass-input w-full"
                       />
                    </div>

                    <button 
                      onClick={handleTransfer}
                      disabled={loading || !amount || !recipientId || !(user?.status === 'VERIFIED' || user?.status === 'ACTIVE')}
                      className="btn-primary w-full py-7 text-sm shadow-2xl disabled:grayscale group"
                    >
                       {!(user?.status === 'VERIFIED' || user?.status === 'ACTIVE') ? (
                         <span className="flex items-center gap-3"><span className="material-icons-outlined">lock</span> KYC VERIFICATION REQUIRED</span>
                       ) : (
                         <span className="flex items-center gap-3">
                            <span className="material-icons-outlined group-hover:translate-x-2 transition-transform">send</span> 
                            {loading ? 'Sending...' : 'Send Now'}
                         </span>
                       )}
                    </button>
                 </div>
              </section>
           </div>

           {/* Right Column: Security & Recent */}
           <div className="lg:col-span-5 space-y-10">
              <section className="bg-blue/10 border border-blue/20 rounded-[3rem] p-10 space-y-6 shadow-2xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue/10 rounded-2xl flex items-center justify-center border border-blue/20">
                       <span className="material-icons-outlined text-blue">verified</span>
                    </div>
                    <h4 className="text-lg font-black italic">Instant Transfer</h4>
                 </div>
                 <ul className="space-y-4">
                    <SecurityFeature label="Instant Network Sync" desc="Transactions are finished immediately across the network." />
                    <SecurityFeature label="Final Transaction" desc="Once a transfer is sent, it cannot be reversed. Please verify the Recipient ID." />
                    <SecurityFeature label="No Fees" desc="Transfers between Generex users are always free of charge." />
                 </ul>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xl font-black italic">Recent Transfers</h3>
                     <span className="material-icons-outlined text-soft-grey text-sm">history</span>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                    {transactions.filter(tx => tx.type === 'TRANSFER').length > 0 ? (
                      transactions.filter(tx => tx.type === 'TRANSFER').slice(0, 5).map((tx) => (
                        <button 
                          key={tx.id} 
                          onClick={() => window.location.href = `/transactions/${tx.transaction_id}`}
                          className="w-full flex items-center justify-between p-5 rounded-2xl bg-navy/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-4 text-left">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-green">
                                <span className="material-icons-outlined text-lg">history</span>
                             </div>
                             <div>
                                <p className="text-xs font-black text-white italic">{tx.transaction?.description || 'Transfer'}</p>
                                <p className="text-[10px] text-soft-grey font-mono tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={`text-sm font-black italic ${tx.entry_type === 'CREDIT' ? 'text-green' : 'text-white'}`}>
                               {tx.entry_type === 'CREDIT' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                             </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center opacity-40">
                         <p className="text-[10px] font-black uppercase tracking-widest">No recent transfers</p>
                      </div>
                    )}
                  </div>
               </section>
           </div>

        </div>
      </div>
    </Shell>
  );
}

function SecurityFeature({ label, desc }: any) {
  return (
    <li className="flex gap-4">
       <span className="material-icons-outlined text-blue text-sm mt-1">check_circle</span>
       <div>
          <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[10px] text-soft-grey leading-relaxed">{desc}</p>
       </div>
    </li>
  );
}
