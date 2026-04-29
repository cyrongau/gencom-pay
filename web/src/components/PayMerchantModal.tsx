'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

export default function PayMerchantModal({ isOpen, onClose, wallets, onPaymentSuccess }: any) {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1); // 1: Search, 2: Amount/Confirm
  const [searchQuery, setSearchQuery] = useState('');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/merchant/search?q=${searchQuery}`);
      setMerchants(data);
    } catch (err) {
      showNotification('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const proceedToPay = (merchant: any) => {
    setSelectedMerchant(merchant);
    setStep(2);
  };

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await api.post('/merchant/pay-by-id', {
        merchantId: selectedMerchant.gencom_merchant_id,
        amount,
        currency
      });
      showNotification('Payment successfully transmitted', 'success');
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0 bg-navy/80 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative bg-[#0B1225] border border-white/10 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
         <div className="flex justify-between items-start mb-10">
            <div>
               <h3 className="text-3xl font-black italic tracking-tighter">Pay Merchant</h3>
               <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-2">Atomic Peer-to-Business Settlement</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
               <span className="material-icons-outlined text-sm">close</span>
            </button>
         </div>

         {step === 1 ? (
           <div className="space-y-8">
              <div className="flex gap-4">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Enter Merchant ID or Business Name..."
                   className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-green/40 transition-all"
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 />
                 <button 
                   onClick={handleSearch}
                   className="bg-green text-navy px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                 >
                   {loading ? '...' : 'SEARCH'}
                 </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                 {merchants.length > 0 ? (
                   merchants.map((m) => (
                     <div 
                       key={m.id} 
                       onClick={() => proceedToPay(m)}
                       className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-green"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center overflow-hidden border border-white/5">
                              <img 
                                src={m.logo_url?.startsWith('/') ? `${api.defaults.baseURL}${m.logo_url}` : m.logo_url || `https://ui-avatars.com/api/?name=${m.business_name}`} 
                                className="w-full h-full object-cover" 
                              />
                           </div>
                           <div>
                              <p className="text-sm font-black italic">{m.business_name}</p>
                              <p className="text-[9px] text-soft-grey uppercase tracking-widest mt-1">ID: {m.gencom_merchant_id}</p>
                           </div>
                        </div>
                        <span className="material-icons-outlined text-soft-grey text-sm">chevron_right</span>
                     </div>
                   ))
                 ) : searchQuery && !loading ? (
                    <div className="py-12 text-center opacity-40">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">No merchants found</p>
                    </div>
                 ) : null}
              </div>
           </div>
         ) : (
           <div className="space-y-10">
              <div className="p-8 bg-green/5 border border-green/20 rounded-[2.5rem] flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl overflow-hidden border border-green/20">
                    <img 
                      src={selectedMerchant.logo_url?.startsWith('/') ? `${api.defaults.baseURL}${selectedMerchant.logo_url}` : selectedMerchant.logo_url || `https://ui-avatars.com/api/?name=${selectedMerchant.business_name}`} 
                      className="w-full h-full object-cover" 
                    />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-black text-green uppercase tracking-widest mb-1">Paying to</p>
                    <p className="text-xl font-black italic">{selectedMerchant.business_name}</p>
                    <p className="text-[10px] text-soft-grey uppercase tracking-widest mt-1">ID: {selectedMerchant.gencom_merchant_id}</p>
                 </div>
                 <button onClick={() => setStep(1)} className="text-[10px] font-black text-soft-grey hover:text-white uppercase tracking-widest">Change</button>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-end px-2">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Payment Amount</label>
                    <div className="flex gap-4">
                       {wallets.map((w: any) => (
                         <button 
                           key={w.id}
                           onClick={() => setCurrency(w.currency)}
                           className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border transition-all ${
                             currency === w.currency ? 'bg-white/10 border-white/20 text-white' : 'text-soft-grey border-transparent hover:border-white/10'
                           }`}
                         >
                           {w.currency}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-green">{currency === 'KSH' ? 'Ksh' : '$'}</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-10 pl-20 text-4xl font-black italic outline-none focus:border-green/40 transition-all placeholder:opacity-20"
                    />
                 </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading || !amount}
                className="w-full bg-green text-navy py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-green/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'PROCESSING...' : 'AUTHORIZE SETTLEMENT'}
              </button>
           </div>
         )}
      </div>
    </div>
  );
}
