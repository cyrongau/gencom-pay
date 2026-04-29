'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';
import QRCode from 'react-qr-code';

export default function MerchantTerminals() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [terminals, setTerminals] = useState<any[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTerminalName, setNewTerminalName] = useState('');
  const [activeTerminal, setActiveTerminal] = useState<any>(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectCurrency, setCollectCurrency] = useState('USD');
  const [qrData, setQrData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    fetchTerminals();
    fetchMerchant();
  }, [user, loading, router]);

  const fetchMerchant = async () => {
    try {
      const res = await api.get('/merchant/profile');
      setMerchant(res.data);
    } catch (err) {
      console.error('Failed to fetch merchant profile', err);
    }
  };

  const fetchTerminals = async () => {
    try {
      const res = await api.get('/merchant/terminals');
      setTerminals(res.data);
    } catch (err) {
      console.error('Failed to fetch terminals', err);
    }
  };

  const handleCreateTerminal = async () => {
    try {
      await api.post('/merchant/terminals', { name: newTerminalName });
      setShowAddModal(false);
      setNewTerminalName('');
      fetchTerminals();
    } catch (err) {
      console.error('Failed to create terminal', err);
    }
  };

  const initiateCollection = async () => {
    try {
      const res = await api.post(`/merchant/terminals/${activeTerminal.id}/collect`, {
        amount: collectAmount,
        currency: collectCurrency
      });
      setQrData(res.data);
    } catch (err) {
      console.error('Failed to initiate collection', err);
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Page Header */}
        <div className="flex justify-between items-end px-4">
           <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter">Terminal Fleet</h1>
              <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Virtual POS & Physical Hardware Management</p>
           </div>
           <button 
             onClick={() => setShowAddModal(true)}
             disabled={merchant?.status !== 'VERIFIED'}
             className="btn-primary py-4 px-8 text-[10px] flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
           >
              {merchant?.status !== 'VERIFIED' && <span className="material-icons-outlined text-sm">lock</span>}
              <span className="material-icons-outlined text-sm">add</span> Provision New Terminal
           </button>
        </div>

        {/* Verification Warning */}
        {merchant?.status !== 'VERIFIED' && (
           <div className="mx-4 p-8 bg-gold/10 border border-gold/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center">
                    <span className="material-icons-outlined text-gold text-2xl">verified_user</span>
                 </div>
                 <div>
                    <h4 className="text-lg font-black italic text-white">Verification Required</h4>
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-1">Terminal provisioning and live collections are locked until KYC approval.</p>
                 </div>
              </div>
              <button 
                onClick={() => router.push('/merchant/kyc')}
                className="bg-gold text-navy px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
              >
                Complete KYC Protocol
              </button>
           </div>
        )}

        {/* Terminals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {terminals.map((terminal) => (
              <div 
                key={terminal.id}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 hover:bg-white/10 transition-all group shadow-xl relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-green/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 
                 <div className="flex justify-between items-start relative z-10">
                    <div className="w-14 h-14 bg-navy rounded-2xl border border-white/5 flex items-center justify-center">
                       <span className="material-icons-outlined text-2xl text-green">point_of_sale</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest border ${
                      terminal.status === 'ACTIVE' ? 'bg-green/10 text-green border-green/20' : 'bg-red-400/10 text-red-400 border-red-400/20'
                    }`}>
                       {terminal.status}
                    </span>
                 </div>

                 <div className="relative z-10">
                    <h3 className="text-xl font-black text-white italic tracking-tight">{terminal.name}</h3>
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.2em] mt-1">ID: {terminal.terminal_id}</p>
                 </div>

                 <div className="pt-4 border-t border-white/5 flex gap-4 relative z-10">
                    <button 
                      onClick={() => setActiveTerminal(terminal)}
                      className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                       Launch Terminal
                    </button>
                    <button className="w-12 bg-white/5 border border-white/10 py-3 rounded-xl flex items-center justify-center hover:text-red-400 transition-all">
                       <span className="material-icons-outlined text-sm">settings</span>
                    </button>
                 </div>
              </div>
           ))}
           
           {terminals.length === 0 && (
             <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] space-y-6 opacity-40">
                <span className="material-icons-outlined text-6xl">sensors_off</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Terminals Provisioned</p>
             </div>
           )}
        </div>

        {/* Provision Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-navy/80 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
            <div className="bg-[#0B1225] border border-white/10 w-full max-w-lg rounded-[3rem] p-12 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
               <h3 className="text-3xl font-black italic mb-2">New Terminal</h3>
               <p className="text-xs text-soft-grey mb-10">Assign a name to your new payment collection point.</p>
               
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-1">Terminal Name</label>
                     <input 
                       type="text" 
                       value={newTerminalName}
                       onChange={(e) => setNewTerminalName(e.target.value)}
                       placeholder="e.g. Main Registry, Staff A"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:border-green transition-all outline-none"
                     />
                  </div>
                  <button 
                    onClick={handleCreateTerminal}
                    className="btn-primary w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4"
                  >
                     Confirm Provisioning
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Virtual Terminal POS Interface */}
        {activeTerminal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-navy/95 backdrop-blur-xl" onClick={() => { setActiveTerminal(null); setQrData(null); }}></div>
            
            <div className="bg-[#151C2C] border border-white/10 w-full max-w-2xl rounded-[4rem] overflow-hidden relative z-10 shadow-2xl animate-in slide-in-from-bottom-12 duration-500">
               
               {/* Terminal Top Bar */}
               <div className="bg-white/5 p-8 flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-green/10 rounded-xl flex items-center justify-center border border-green/20">
                        <span className="material-icons-outlined text-green text-sm">point_of_sale</span>
                     </div>
                     <div>
                        <p className="text-xs font-black text-white leading-none">{activeTerminal.name}</p>
                        <p className="text-[8px] font-black text-soft-grey uppercase tracking-widest mt-1">Terminal {activeTerminal.terminal_id}</p>
                     </div>
                  </div>
                  <button onClick={() => { setActiveTerminal(null); setQrData(null); }} className="text-soft-grey hover:text-white transition-colors">
                     <span className="material-icons-outlined">close</span>
                  </button>
               </div>

               <div className="p-12 flex flex-col md:flex-row gap-12">
                  
                  {/* Left: Input Area */}
                  <div className="flex-1 space-y-10">
                     {!qrData ? (
                        <>
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Collection Amount</p>
                              <div className="relative">
                                 <input 
                                   type="number" 
                                   value={collectAmount}
                                   onChange={(e) => setCollectAmount(e.target.value)}
                                   placeholder="0.00"
                                   className="w-full bg-navy/50 border border-white/10 rounded-3xl p-8 text-5xl font-black italic outline-none focus:border-green transition-all"
                                 />
                                 <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                    <select 
                                      value={collectCurrency}
                                      onChange={(e) => setCollectCurrency(e.target.value)}
                                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black outline-none"
                                    >
                                       <option value="USD">USD</option>
                                       <option value="KSH">KSH</option>
                                       <option value="SLS">SLS</option>
                                    </select>
                                 </div>
                              </div>
                           </div>

                           <button 
                             onClick={initiateCollection}
                             disabled={!collectAmount}
                             className="w-full btn-primary py-6 rounded-3xl text-sm flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                           >
                              <span className="material-icons-outlined">sensors</span> Generate Payment Intent
                           </button>

                           <div className="grid grid-cols-2 gap-4">
                              <button className="bg-white/5 border border-white/10 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                 <span className="material-icons-outlined text-xs">contactless</span> Tap to Pay
                              </button>
                              <button className="bg-white/5 border border-white/10 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                 <span className="material-icons-outlined text-xs">keyboard</span> Manual Entry
                              </button>
                           </div>
                        </>
                     ) : (
                        <div className="space-y-10 animate-in fade-in duration-500">
                           <div className="p-8 bg-green/5 border border-green/20 rounded-[2.5rem] text-center">
                              <p className="text-[10px] font-black text-green uppercase tracking-[0.3em] mb-4">Awaiting Authorization</p>
                              <p className="text-5xl font-black text-white italic tracking-tighter">${collectAmount}</p>
                              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-4">Intent ID: {qrData.intent_id}</p>
                           </div>
                           <button 
                             onClick={() => setQrData(null)}
                             className="w-full bg-white/5 border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                           >
                              Cancel Collection
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Right: QR Area */}
                  <div className="w-full md:w-[280px] flex flex-col items-center justify-center space-y-6">
                     <div 
                       className="bg-white p-6 rounded-[3rem] shadow-2xl w-full aspect-square flex items-center justify-center"
                       style={{ boxShadow: `0 25px 50px -12px ${merchant?.branding_color}40` }}
                     >
                        {qrData ? (
                           <QRCode value={qrData.qr_data} size={200} />
                        ) : (
                           <div className="flex flex-col items-center gap-4 opacity-20">
                              <span className="material-icons-outlined text-6xl text-navy">qr_code_2</span>
                              <p className="text-[9px] font-black text-navy uppercase tracking-widest">Ready for Protocol</p>
                           </div>
                        )}
                     </div>
                     <p className="text-[9px] font-black text-soft-grey text-center uppercase tracking-[0.2em] leading-loose">
                        Ask customer to scan with <br/> <span className="text-white">Gencom Pay mobile app</span>
                     </p>
                  </div>
               </div>

               {/* Terminal Footer */}
               <div className="bg-navy/40 p-6 flex justify-center border-t border-white/5">
                  <div className="flex items-center gap-2 opacity-40">
                     <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse"></span>
                     <p className="text-[8px] font-black uppercase tracking-widest">Secure Terminal Session Active</p>
                  </div>
               </div>

            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}
