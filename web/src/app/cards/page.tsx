'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';

export default function CardCenter() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [issuing, setIssuing] = useState(false);
  const [revealData, setRevealData] = useState(false);
  const [revealedDetails, setRevealedDetails] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [updatingLimits, setUpdatingLimits] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      const res = await api.get('/cards');
      setCards(res.data);
      if (res.data.length > 0) {
        fetchCardTransactions(res.data[0].id);
        setDailyLimit(res.data[0].daily_limit);
        setMonthlyLimit(res.data[0].monthly_limit);
      }
    } catch (err) {
      console.error('Failed to fetch cards', err);
    }
  };

  const fetchCardTransactions = async (cardId: string) => {
    try {
      const res = await api.get(`/cards/${cardId}/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch card transactions', err);
    }
  };

  const handleIssueCard = async () => {
    setIssuing(true);
    try {
      await api.post('/cards', { cardHolderName: user?.full_name });
      showNotification('Virtual Card issued successfully!', 'success');
      fetchCards();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to issue card', 'error');
    } finally {
      setIssuing(false);
    }
  };

  const toggleFreeze = async (cardId: string) => {
    try {
      const res = await api.put(`/cards/${cardId}/freeze`);
      const updatedCard = res.data;
      setCards(prev => prev.map(c => c.id === cardId ? updatedCard : c));
      showNotification(`Card ${updatedCard.status === 'FROZEN' ? 'frozen' : 'unfrozen'} successfully`, 'success');
    } catch (err) {
      showNotification('Action failed', 'error');
    }
  };

  const handleReveal = async (cardId: string) => {
    if (revealData) {
      setRevealData(false);
      setRevealedDetails(null);
      return;
    }

    try {
      const res = await api.get(`/cards/${cardId}/reveal`);
      setRevealedDetails(res.data);
      setRevealData(true);
      showNotification('Card details revealed securely', 'info');
    } catch (err) {
      showNotification('Failed to reveal card details', 'error');
    }
  };

  const updateLimits = async () => {
    const activeCard = cards[0];
    if (!activeCard) return;

    setUpdatingLimits(true);
    try {
      const res = await api.put(`/cards/${activeCard.id}/limits`, {
        daily: dailyLimit,
        monthly: monthlyLimit
      });
      setCards(prev => prev.map(c => c.id === activeCard.id ? res.data : c));
      showNotification('Spending limits updated successfully!', 'success');
      setShowLimitModal(false);
    } catch (err) {
      showNotification('Failed to update limits', 'error');
    } finally {
      setUpdatingLimits(false);
    }
  };

  const regenerateCVV = async (cardId: string) => {
    try {
      const res = await api.put(`/cards/${cardId}/regenerate-cvv`);
      setCards(prev => prev.map(c => c.id === cardId ? res.data : c));
      if (revealData) {
        const revealRes = await api.get(`/cards/${cardId}/reveal`);
        setRevealedDetails(revealRes.data);
      }
      showNotification('CVV regenerated successfully!', 'success');
    } catch (err) {
      showNotification('Failed to regenerate CVV', 'error');
    }
  };

  if (loading || !user) return null;

  const activeCard = cards.find(c => c.status === 'ACTIVE') || cards[0];

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Page Header */}
        <div className="flex justify-between items-end px-4">
           <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter">Card Management</h1>
              <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Secure Virtual Corporate Assets</p>
           </div>
           <button 
             onClick={handleIssueCard}
             disabled={issuing}
             className="btn-primary py-5 px-10 text-xs shadow-2xl shadow-green/20"
           >
              {issuing ? 'Deploying...' : '+ Issue New Virtual Card'}
           </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           
           {/* Left/Main Column: Active Card & History */}
           <div className="xl:col-span-8 space-y-10">
              
              {/* Card Display Grid (Desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activeCard ? (
                     <div className="relative group perspective-1000 animate-float h-[350px]">
                        <div 
                          className={`relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          {/* FRONT SIDE */}
                          <div className="absolute inset-0 backface-hidden">
                             <div className={`w-full h-full rounded-[3rem] glass-financial border border-white/20 p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden card-glow-green`}>
                                <div className="card-shine"></div>
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green/10 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
                                
                                <div className="relative z-10 flex justify-between items-start">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-signature rounded-xl flex items-center justify-center p-2 shadow-xl">
                                         <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                                            <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="8" />
                                            <path d="M50 25 L75 37.5 L75 62.5 L50 75 L25 62.5 L25 37.5 Z" />
                                         </svg>
                                      </div>
                                      <div>
                                         <h3 className="text-lg font-black italic tracking-tighter">GENCOM <span className="text-green">PAY</span></h3>
                                         <p className="text-[7px] font-black text-soft-grey uppercase tracking-[0.3em]">Corporate</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <span className="material-icons-outlined text-white/40 text-xl rotate-90">wifi</span>
                                      <p className="text-[10px] font-black text-white italic">VISA</p>
                                   </div>
                                </div>

                                <div className="relative z-10">
                                   <div className="w-12 h-9 bg-gradient-to-br from-gold/40 to-white/5 rounded-lg border border-white/10 flex flex-col justify-center gap-1 p-2">
                                      <div className="w-full h-0.5 bg-white/20 rounded-full"></div>
                                      <div className="w-3/4 h-0.5 bg-white/20 rounded-full"></div>
                                      <div className="w-full h-0.5 bg-white/20 rounded-full"></div>
                                   </div>
                                </div>

                                <div className="relative z-10 space-y-6">
                                   <div className="flex justify-between items-center">
                                      <div className="flex gap-3 sm:gap-5">
                                         {revealData && revealedDetails ? (
                                           revealedDetails.card_number.match(/.{1,4}/g)?.map((chunk: string, idx: number) => (
                                             <span key={idx} className="text-lg sm:text-xl font-mono tracking-[0.15em] text-white font-bold">{chunk}</span>
                                           ))
                                         ) : (
                                           <>
                                             <span className="text-lg sm:text-xl font-mono tracking-[0.15em] text-white font-bold">4532</span>
                                             <span className="text-lg sm:text-xl font-mono tracking-[0.15em] text-white font-bold">88••</span>
                                             <span className="text-lg sm:text-xl font-mono tracking-[0.15em] text-white font-bold">••••</span>
                                             <span className="text-lg sm:text-xl font-mono tracking-[0.15em] text-white font-bold">{activeCard.last_four}</span>
                                           </>
                                         )}
                                      </div>
                                   </div>

                                   <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                      <div className="space-y-1">
                                         <p className="text-[7px] font-black text-soft-grey uppercase tracking-widest">ID ENTITY</p>
                                         <p className="text-xs font-black uppercase tracking-[0.1em] italic text-white">{activeCard.card_holder_name}</p>
                                      </div>
                                      <div className="space-y-1">
                                         <p className="text-[7px] font-black text-soft-grey uppercase tracking-widest text-center">VALID THRU</p>
                                         <p className="text-xs font-black tracking-[0.15em] text-white">{revealData && revealedDetails ? `${revealedDetails.expiry_month}/${revealedDetails.expiry_year.toString().slice(-2)}` : `${activeCard.expiry_month}/${activeCard.expiry_year.toString().slice(-2)}`}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* BACK SIDE */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180">
                             <div className={`w-full h-full rounded-[3rem] glass-financial border border-white/20 flex flex-col justify-between shadow-2xl relative overflow-hidden`}>
                                <div className="mt-8 w-full h-14 bg-navy/80 border-y border-white/10"></div>
                                
                                <div className="px-10 flex justify-between items-center">
                                   <div className="w-2/3 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center px-4 overflow-hidden relative">
                                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                                      <p className="text-[8px] font-mono text-soft-grey tracking-widest uppercase">Authorized Signature</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[7px] font-black text-soft-grey uppercase tracking-widest mb-1">CVV CODE</p>
                                      <div className="bg-white px-3 py-1 rounded shadow-inner">
                                         <p className="text-xs font-black text-navy italic tracking-[0.2em]">{revealData && revealedDetails ? revealedDetails.cvv : '•••'}</p>
                                      </div>
                                   </div>
                                </div>

                                <div className="p-10 pt-0">
                                   <p className="text-[6px] text-soft-grey uppercase tracking-tighter opacity-40 leading-relaxed">
                                      This virtual card is issued by Gencom Financial Services. Use is subject to the terms of service. 
                                      If found, please return to any Gencom Financial branch or contact support. 
                                      Encryption Protocol: 256-bit AES. Node ID: {activeCard.id.slice(0,8).toUpperCase()}
                                   </p>
                                   <div className="mt-4 flex justify-between items-center">
                                      <div className="flex gap-1 text-green/40">
                                         {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-current"></div>)}
                                      </div>
                                      <div className="text-right">
                                         <h3 className="text-sm font-black italic tracking-tighter text-white/20">GENCOM <span className="text-green/20">PAY</span></h3>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                        </div>
                     </div>
                  ) : (
                    <div onClick={handleIssueCard} className="w-full h-[350px] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 group hover:border-green/40 hover:bg-white/5 transition-all cursor-pointer">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-icons-outlined text-soft-grey text-3xl group-hover:text-green">add_card</span>
                       </div>
                       <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Issue Your First Card</p>
                    </div>
                  )}

                 {/* Secondary Card or "Issue" Slot */}
                 <div onClick={handleIssueCard} className="w-full h-[350px] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 group hover:border-green/40 hover:bg-white/5 transition-all cursor-pointer opacity-60">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <span className="material-icons-outlined text-soft-grey text-3xl group-hover:text-green">add_card</span>
                    </div>
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Issue Secondary Card</p>
                 </div>
              </div>

              {/* Transactions Specific to Card */}
              <section className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 space-y-10 shadow-2xl">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black italic">Activity Log</h3>
                    <div className="flex gap-2 bg-navy rounded-xl p-1 border border-white/5">
                       <button className="px-4 py-2 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">Successful</button>
                       <button className="px-4 py-2 text-[10px] font-black text-soft-grey hover:text-white uppercase tracking-widest transition-colors">Declined</button>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    {transactions.length > 0 ? (
                      transactions.filter(tx => tx.tag === 'CARD_PURCHASE').map((tx: any) => (
                        <CardTransaction 
                          key={tx.id} 
                          icon="payments" 
                          name={tx.transaction?.description || 'Card Transaction'} 
                          category={new Date(tx.created_at).toLocaleString()} 
                          amount={`-$${parseFloat(tx.amount).toFixed(2)}`} 
                          status="SUCCESS" 
                        />
                      ))
                    ) : (
                      <div className="py-10 text-center opacity-40 space-y-4">
                         <span className="material-icons-outlined text-4xl">receipt_long</span>
                         <p className="text-[10px] font-black uppercase tracking-widest">No recent card activity</p>
                      </div>
                    )}
                 </div>
              </section>
           </div>

           {/* Right Column: Controls & Analytics */}
           <div className="xl:col-span-4 space-y-8">
               {/* Card Controls Panel */}
               <section className="space-y-8">
                  <div className="flex justify-between items-center px-4">
                     <h3 className="text-2xl font-black italic tracking-tighter">Card Controls</h3>
                     <span className="text-[9px] font-black text-soft-grey uppercase tracking-widest opacity-40">Secure Session Active</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                     <ControlItem 
                       onClick={() => activeCard && toggleFreeze(activeCard.id)} 
                       icon={activeCard?.status === 'FROZEN' ? 'lock_open' : 'ac_unit'} 
                       label={activeCard?.status === 'FROZEN' ? 'Unfreeze' : 'Freeze Card'} 
                       desc="Instantly disable card" 
                       active={activeCard?.status === 'FROZEN'}
                       color="green"
                     />
                     <ControlItem 
                       onClick={() => activeCard && handleReveal(activeCard.id)} 
                       icon={revealData ? 'visibility_off' : 'visibility'} 
                       label="Reveal Details" 
                       desc="Show sensitive data" 
                       toggleActive={revealData}
                       color="blue"
                     />
                     <ControlItem 
                       onClick={() => setShowLimitModal(true)} 
                       icon="tune" 
                       label="Set Limits" 
                       desc="Manage spending" 
                       color="gold"
                     />
                     <ControlItem 
                       onClick={() => activeCard && regenerateCVV(activeCard.id)} 
                       icon="refresh" 
                       label="New CVV" 
                       desc="Cycle security code" 
                       color="purple"
                     />
                  </div>
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="flex items-center justify-center gap-4 py-4 border border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group"
                  >
                     <span className="material-icons-outlined text-soft-grey group-hover:text-white transition-colors">flip</span>
                     <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest group-hover:text-white transition-colors">
                        {isFlipped ? 'Show Front Side' : 'Flip to View CVV'}
                     </p>
                  </div>
               </section>

              {/* Spending Analytics */}
              <section className="bg-[#0F3D3A]/20 backdrop-blur-xl border border-green/20 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black italic text-green">Spending Limits</h3>
                    <span className="material-icons-outlined text-green">analytics</span>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Monthly Allowance</span>
                          <p className="text-lg font-black text-white">${parseFloat(activeCard?.monthly_limit || '5000').toFixed(2)} <span className="text-soft-grey text-xs font-medium">Cap</span></p>
                       </div>
                       <div className="h-2 w-full bg-navy/60 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className="h-full w-[0%] bg-green rounded-full shadow-[0_0_15px_rgba(22,198,110,0.6)]"></div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Daily Limit</span>
                          <p className="text-lg font-black text-white">${parseFloat(activeCard?.daily_limit || '1000').toFixed(2)} <span className="text-soft-grey text-xs font-medium">Cap</span></p>
                       </div>
                       <div className="h-2 w-full bg-navy/60 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className="h-full w-[0%] bg-blue rounded-full shadow-[0_0_15px_rgba(74,104,231,0.6)]"></div>
                       </div>
                    </div>
                 </div>
                 <p className="text-[9px] font-bold text-soft-grey uppercase tracking-[0.2em] text-center italic opacity-60">Limits reset automatically in 12 days</p>
              </section>
           </div>

        </div>
      </div>

      {/* Limit Control Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-navy/90 backdrop-blur-xl" onClick={() => setShowLimitModal(false)}></div>
           <div className="relative bg-[#0B1225] border border-white/10 w-full max-w-md rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-10 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-4">
                 <h2 className="text-3xl font-black italic text-white tracking-tighter">Limit Control</h2>
                 <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.4em]">Adjust spending protocols</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Daily Spending Limit ($)</label>
                    <input 
                      type="number" 
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-black italic focus:outline-none focus:border-green/50 transition-all"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Monthly Allowance ($)</label>
                    <input 
                      type="number" 
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(e.target.value)}
                      className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-black italic focus:outline-none focus:border-green/50 transition-all"
                    />
                 </div>

                 <button 
                   onClick={updateLimits}
                   disabled={updatingLimits}
                   className="w-full bg-green text-navy font-black italic text-sm py-6 rounded-2xl shadow-2xl shadow-green/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
                 >
                   {updatingLimits ? 'Updating Protocols...' : 'Commit Changes'}
                 </button>
              </div>

              <button 
                onClick={() => setShowLimitModal(false)}
                className="w-full text-[10px] font-black text-soft-grey uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
           </div>
        </div>
      )}
    </Shell>
  );
}

function ControlItem({ icon, label, desc, onClick, active, toggleActive, color }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`relative glass-financial p-8 rounded-[2rem] text-left group hover:scale-[1.02] transition-all overflow-hidden ${active ? 'bg-red-400/10 border-red-400/30' : 'border-white/10'}`}
    >
       <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${color === 'green' ? 'from-green' : color === 'blue' ? 'from-blue' : color === 'gold' ? 'from-gold' : 'from-purple-400'} to-transparent opacity-40 group-hover:opacity-100 transition-opacity`}></div>
       
       <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-all ${active ? 'text-red-400' : `text-${color}-400`}`}>
                <span className="material-icons-outlined text-2xl">{icon}</span>
             </div>
             {toggleActive !== undefined && (
               <div className={`w-10 h-6 rounded-full p-1 transition-colors ${toggleActive ? 'bg-green' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${toggleActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
               </div>
             )}
             {active && (
                <div className="w-10 h-6 bg-red-400/20 rounded-full flex items-center justify-center border border-red-400/30">
                   <span className="material-icons-outlined text-[10px] text-red-400">lock</span>
                </div>
             )}
          </div>
          <div>
             <h4 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-green transition-colors">{label}</h4>
             <p className="text-[9px] text-soft-grey font-medium uppercase tracking-tight mt-1 opacity-60 leading-relaxed">{desc}</p>
          </div>
       </div>
    </button>
  );
}

function CardTransaction({ icon, name, category, amount, status }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5">
       <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-navy border border-white/10 flex items-center justify-center group-hover:rotate-6 transition-transform">
             <span className="material-icons-outlined text-soft-grey group-hover:text-green text-xl">{icon}</span>
          </div>
          <div>
             <p className="text-sm font-black text-white">{name}</p>
             <p className="text-[10px] text-soft-grey font-medium uppercase tracking-widest mt-1">{category}</p>
          </div>
       </div>
       <div className="text-right space-y-2">
          <p className="text-sm font-black text-white italic">{amount}</p>
          <span className={`inline-block px-4 py-1 rounded-md text-[8px] font-black tracking-widest border ${
            status === 'SUCCESS' ? 'bg-green/10 text-green border-green/20' : 'bg-blue/10 text-blue border-blue/20'
          }`}>
             {status}
          </span>
       </div>
    </div>
  );
}
