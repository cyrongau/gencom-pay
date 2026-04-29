'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';

const PROVIDERS = [
  { id: 'ZAAD', name: 'ZAAD (Telesom)', icon: 'smartphone', defaultCurrency: 'USD', supportedCurrencies: ['USD', 'SLS'] },
  { id: 'EDAHAB', name: 'eDahab (Somtel)', icon: 'payments', defaultCurrency: 'USD', supportedCurrencies: ['USD', 'SLS'] },
  { id: 'MPESA', name: 'M-Pesa (Safaricom)', icon: 'account_balance', defaultCurrency: 'KSH', supportedCurrencies: ['KSH'] },
  { id: 'PREMIER', name: 'Premier Wallet', icon: 'wallet', defaultCurrency: 'USD', supportedCurrencies: ['USD'] },
  { id: 'GENCOM', name: 'Gencom Pay', icon: 'shield', defaultCurrency: 'USD', supportedCurrencies: ['USD', 'EUR', 'GBP', 'KSH', 'SLS'] },
];

const BILL_TYPES = [
  { id: 'TILL', name: 'Till Number', icon: 'storefront' },
  { id: 'PAYBILL', name: 'Pay Bill', icon: 'receipt_long' },
  { id: 'UTILITY', name: 'Utility Service', icon: 'lightbulb' },
];

export default function PayBillPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const [provider, setProvider] = useState('ZAAD');
  const [billType, setBillType] = useState('TILL');
  const [merchantId, setMerchantId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [merchantSearchResults, setMerchantSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    const p = PROVIDERS.find(p => p.id === provider);
    if (p) setTargetCurrency(p.defaultCurrency);
  }, [provider]);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data);
      if (res.data.length > 0) setSelectedWallet(res.data[0].id);
    } catch (err) {
      console.error('Failed to fetch wallets', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/bills/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch bill history', err);
    }
  };

  const searchMerchants = async (q: string) => {
    if (!q || q.length < 2) {
      setMerchantSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/bills/search-merchants?query=${q}`);
      setMerchantSearchResults(res.data);
    } catch (err) {
      console.error('Merchant search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (provider === 'GENCOM' && merchantId.length >= 2) {
      const timer = setTimeout(() => searchMerchants(merchantId), 500);
      return () => clearTimeout(timer);
    }
  }, [merchantId, provider]);

  const handlePayment = async () => {
    if (!merchantId || !amount) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const wallet = wallets.find(w => w.id === selectedWallet);
      await api.post('/bills/pay', {
        provider,
        billType,
        merchantId,
        accountNumber: billType === 'PAYBILL' ? accountNumber : undefined,
        amount,
        currency: targetCurrency, // The currency the merchant expects
        walletId: selectedWallet, // The wallet we are paying from (auto-conversion handled by bridge logic)
      });

      showNotification('Payment processed successfully!', 'success');
      setMerchantId('');
      setAccountNumber('');
      setAmount('');
      fetchHistory();
      fetchWallets();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Payment failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !user) return null;

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col gap-2">
           <h1 className="text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green to-blue w-fit">Pay Bill & Services</h1>
           <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Multi-Currency Hybrid Bridge Protocol v1.2</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Payment Form */}
          <section className="lg:col-span-7 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-[100px] group-hover:bg-green/10 transition-all"></div>
              
              <div className="space-y-10 relative z-10">
                {/* Provider Selection */}
                <div>
                  <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] block mb-5 px-2">Select Provider</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProvider(p.id)}
                        className={`flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all ${provider === p.id ? 'bg-blue/20 border-blue text-white shadow-xl scale-[1.05]' : 'bg-white/5 border-white/5 text-soft-grey hover:bg-white/10'}`}
                      >
                        <span className={`material-icons-outlined text-2xl ${provider === p.id ? 'text-blue' : ''}`}>{p.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Type Selection */}
                <div>
                  <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] block mb-5 px-2">Payment Type</label>
                  <div className="flex gap-4">
                    {BILL_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setBillType(t.id)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border transition-all ${billType === t.id ? 'bg-green/20 border-green text-white' : 'bg-white/5 border-white/5 text-soft-grey hover:bg-white/10'}`}
                      >
                        <span className="material-icons-outlined text-sm">{t.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">{billType === 'TILL' ? 'Till Number' : 'Business Number'}</label>
                    <input 
                      type="text" 
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      placeholder={billType === 'TILL' ? 'e.g. 123456' : 'e.g. 888888'}
                      className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-black italic focus:outline-none focus:border-green/50 transition-all"
                    />
                    
                    {provider === 'GENCOM' && merchantSearchResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-navy/95 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                        {merchantSearchResults.map((m) => (
                          <button 
                            key={m.id}
                            onClick={() => {
                              setMerchantId(m.gencom_merchant_id);
                              setMerchantSearchResults([]);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center border border-green/20">
                               <img src={m.logo_url || `https://ui-avatars.com/api/?name=${m.business_name}&background=16C66E&color=fff`} className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                               <p className="text-xs font-black italic text-white">{m.business_name}</p>
                               <p className="text-[9px] font-black text-green uppercase tracking-widest">{m.gencom_merchant_id}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {billType === 'PAYBILL' && (
                    <div className="space-y-3 animate-in slide-in-from-left-4 duration-300">
                      <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Account / Ref Number</label>
                      <input 
                        type="text" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 123456789"
                        className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-black italic focus:outline-none focus:border-green/50 transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Merchant Currency</label>
                    <div className="flex gap-2">
                       {PROVIDERS.find(p => p.id === provider)?.supportedCurrencies.map(c => (
                         <button
                           key={c}
                           onClick={() => setTargetCurrency(c)}
                           className={`flex-1 py-3 rounded-xl border text-[10px] font-black tracking-widest transition-all ${targetCurrency === c ? 'bg-blue/20 border-blue text-white' : 'bg-white/5 border-white/5 text-soft-grey'}`}
                         >
                            {c}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Amount in {targetCurrency}</label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black italic text-soft-grey">
                         {targetCurrency === 'KSH' ? 'Ksh' : targetCurrency === 'SLS' ? 'Sl' : '$'}
                       </span>
                       <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 pl-14 text-white text-2xl font-black italic focus:outline-none focus:border-green/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Pay From Wallet</label>
                    <select 
                      value={selectedWallet}
                      onChange={(e) => setSelectedWallet(e.target.value)}
                      className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-black italic focus:outline-none focus:border-green/50 transition-all appearance-none cursor-pointer"
                    >
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.currency} Account ({parseFloat(w.balance).toFixed(w.currency === 'BTC' ? 8 : 2)} {w.currency})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-navy/60 border border-white/5 rounded-3xl flex items-center justify-between shadow-inner">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center border border-green/20">
                         <span className="material-icons-outlined text-green text-sm">currency_exchange</span>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest">Bridge Protocol</p>
                         <p className="text-xs font-black text-white italic">Auto-conversion Enabled</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-soft-grey uppercase tracking-widest">Est. Exchange Rate</p>
                      <p className="text-xs font-black text-green italic">1 {wallets.find(w => w.id === selectedWallet)?.currency || 'USD'} ≈ {targetCurrency === 'KSH' ? '134.20 KSH' : targetCurrency === 'SLS' ? '8500 SLS' : '1.00 USD'}</p>
                   </div>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-green text-navy font-black italic text-sm py-6 rounded-3xl shadow-2xl shadow-green/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {isProcessing ? 'Authorizing Protocol...' : 'Complete Payment'}
                </button>
              </div>
            </div>
          </section>

          {/* History Sidebar */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl min-h-[500px]">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black italic tracking-tighter">Recent Payments</h2>
                  <span className="material-icons-outlined text-soft-grey">history</span>
               </div>

               <div className="space-y-5">
                  {history.length === 0 ? (
                    <div className="py-20 text-center space-y-4 opacity-20">
                       <span className="material-icons-outlined text-4xl">receipt_long</span>
                       <p className="text-[10px] font-black uppercase tracking-widest">No transaction history</p>
                    </div>
                  ) : (
                    history.map((h) => (
                      <div key={h.id} className="bg-navy/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
                         <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-green/30 transition-all">
                                  <span className="material-icons-outlined text-sm text-soft-grey group-hover:text-green">payments</span>
                               </div>
                               <div>
                                  <p className="text-sm font-black italic text-white tracking-tight">{h.provider} - {h.merchant_id}</p>
                                  <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest mt-0.5">{new Date(h.created_at).toLocaleDateString()} • {h.bill_type}</p>
                               </div>
                            </div>
                            <p className="text-sm font-black italic text-white">-{parseFloat(h.amount).toFixed(2)} {h.currency}</p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </section>

        </div>
      </div>
    </Shell>
  );
}
