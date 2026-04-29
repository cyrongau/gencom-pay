'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function DepositPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'MOBILE' | 'BANK' | 'CRYPTO'>('MOBILE');
  const [provider, setProvider] = useState('ZAAD');
  const [currency, setCurrency] = useState('USD');
  const [crypto, setCrypto] = useState('BTC');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await api.post('/transactions/deposit/simulate', {
        amount,
        method,
        currency: method === 'MOBILE' ? currency : (method === 'CRYPTO' ? crypto : 'USD'),
        provider: method === 'MOBILE' ? provider : (method === 'BANK' ? 'WIRE' : crypto),
        accountInfo: method === 'MOBILE' ? phone : (method === 'BANK' ? 'Bank Account Info' : 'Crypto Wallet Info'),
      });
      setSuccess(true);
      setAmount('');
    } catch (err) {
      console.error('Deposit failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Header */}
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Deposit Funds</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Add funds to your Gencom account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left Column: Method Selection */}
           <div className="lg:col-span-5 space-y-8">
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                 <h3 className="text-2xl font-black italic px-2">Funding Source</h3>
                 <div className="grid grid-cols-1 gap-5">
                    <MethodButton 
                      onClick={() => setMethod('MOBILE')} 
                      active={method === 'MOBILE'} 
                      icon="smartphone" 
                      label="Mobile Money" 
                      desc="Regional Mobile Settlements" 
                      color="green" 
                    />
                    <MethodButton 
                      onClick={() => setMethod('BANK')} 
                      active={method === 'BANK'} 
                      icon="account_balance" 
                      label="Bank Transfer" 
                      desc="SWIFT / Local Wire Transfer" 
                      color="blue" 
                    />
                    <MethodButton 
                      onClick={() => setMethod('CRYPTO')} 
                      active={method === 'CRYPTO'} 
                      icon="currency_bitcoin" 
                      label="Crypto Deposit" 
                      desc="Send Cryptocurrency" 
                      color="gold" 
                    />
                 </div>

                 <div className="p-8 bg-blue/10 border border-blue/20 rounded-[2.5rem] space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="material-icons-outlined text-blue">verified_user</span>
                       <h4 className="text-xs font-black uppercase tracking-widest text-white">Secure Deposits</h4>
                    </div>
                    <p className="text-[10px] text-soft-grey leading-relaxed uppercase tracking-wider">All funding methods are verified against our secure ledger in real-time. Finality typically reached in 2-5 minutes.</p>
                 </div>
              </section>
           </div>

           {/* Right Column: Dynamic Form */}
           <div className="lg:col-span-7">
              <section className="bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden h-full flex flex-col">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 
                 {success ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-green/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-green/20 shadow-2xl">
                         <span className="material-icons-outlined text-green text-5xl">check_circle</span>
                      </div>
                      <h4 className="text-4xl font-black italic mb-4">Deposit Successful</h4>
                      <p className="text-lg text-soft-grey font-medium mb-10 max-w-md">Your account balance has been updated. Transaction ID: #TXN-{Math.floor(Math.random()*90000)}</p>
                      <button 
                        onClick={() => setSuccess(false)}
                        className="btn-primary py-6 px-12 text-sm"
                      >
                         ADD MORE FUNDS
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-10 relative z-10 flex-1">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center px-4">
                            <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Amount to Deposit ({currency})</label>
                            {method === 'MOBILE' && (
                              <div className="flex gap-2">
                                 {['USD', 'SLS', 'KSH'].filter(c => {
                                   if (provider === 'M-Pesa') return c === 'KSH' || c === 'USD';
                                   if (['ZAAD', 'eDahab', 'Sahal'].includes(provider)) return c === 'USD' || c === 'SLS';
                                   return c === 'USD';
                                 }).map(c => (
                                   <button
                                     key={c}
                                     onClick={() => setCurrency(c)}
                                     className={`text-[9px] font-black px-3 py-1 rounded-full border transition-all ${
                                       currency === c ? 'bg-green text-navy border-green' : 'bg-white/5 border-white/10 text-soft-grey'
                                     }`}
                                   >
                                      {c}
                                   </button>
                                 ))}
                              </div>
                            )}
                         </div>
                         <div className="relative group">
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 font-black italic text-2xl group-focus-within:text-green transition-colors">
                               {currency === 'USD' ? '$' : currency === 'KSH' ? 'Ksh' : 'S'}
                            </span>
                            <input 
                               type="number" 
                               value={amount}
                               onChange={(e) => setAmount(e.target.value)}
                               className="glass-input w-full pl-20 text-3xl font-black italic tracking-tighter"
                               placeholder="0.00"
                            />
                         </div>
                      </div>

                      <div className="h-px bg-white/5"></div>

                      {method === 'MOBILE' ? (
                        <div className="space-y-10 animate-in fade-in duration-500">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4">Select Provider</label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 {['ZAAD', 'eDahab', 'Sahal', 'M-Pesa'].map(p => (
                                   <button 
                                     key={p}
                                     onClick={() => {
                                       setProvider(p);
                                       if (p === 'M-Pesa') setCurrency('KSH');
                                       else setCurrency('USD');
                                     }}
                                     className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                       provider === p ? 'bg-green/10 border-green text-white shadow-xl' : 'bg-navy border-white/5 text-soft-grey hover:border-white/10'
                                     }`}
                                   >
                                      {p}
                                   </button>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4">Mobile Number</label>
                              <input 
                                type="text" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="glass-input w-full font-mono tracking-widest"
                                placeholder="+252 ••• ••• •••"
                              />
                           </div>
                        </div>
                      ) : method === 'BANK' ? (
                        <div className="space-y-8 animate-in fade-in duration-500 bg-navy/60 p-10 rounded-[3rem] border border-white/5">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 bg-blue/10 rounded-xl flex items-center justify-center border border-blue/20">
                                 <span className="material-icons-outlined text-blue">account_balance</span>
                              </div>
                              <h4 className="text-sm font-black text-white uppercase tracking-widest">Bank Transfer Details</h4>
                           </div>
                           <div className="grid grid-cols-1 gap-6">
                              <InstructionLine label="BENEFICIARY" value="Generex Financial Ltd" />
                              <InstructionLine label="SWIFT / BIC" value="GENX SO 22 XXX" />
                              <InstructionLine label="ACCOUNT NUMBER" value="1000 4920 1120 8491" />
                              <InstructionLine label="REFERENCE CODE" value={`GEN-${user?.id?.slice(0, 8).toUpperCase()}`} />
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-10 animate-in fade-in duration-500">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4">Select Asset</label>
                              <div className="grid grid-cols-3 gap-4">
                                 {['BTC', 'ETH', 'USDT'].map(c => (
                                   <button 
                                     key={c}
                                     onClick={() => setCrypto(c)}
                                     className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                       crypto === c ? 'bg-gold/10 border-gold text-white shadow-xl' : 'bg-navy border-white/5 text-soft-grey hover:border-white/10'
                                     }`}
                                   >
                                      {c}
                                   </button>
                                 ))}
                              </div>
                           </div>
                           <div className="p-8 bg-navy/60 rounded-[2.5rem] border border-white/5 space-y-6">
                              <div className="flex flex-col items-center gap-6">
                                 <div className="p-4 bg-white rounded-3xl">
                                    <div className="w-32 h-32 bg-navy flex items-center justify-center">
                                       <span className="material-icons-outlined text-gold text-5xl">qr_code_2</span>
                                    </div>
                                 </div>
                                 <div className="w-full space-y-2">
                                    <label className="text-[9px] font-black text-soft-grey uppercase tracking-widest text-center block">Deposit Address</label>
                                    <div className="bg-navy p-4 rounded-2xl border border-white/5 font-mono text-[10px] text-white break-all text-center">
                                       {crypto === 'BTC' ? 'bc1qxy2kgdy...z7' : '0x71C765...f4'}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}

                      <div className="mt-auto pt-10">
                        <button 
                          onClick={handleDeposit}
                          disabled={loading || !amount}
                          className="btn-primary w-full py-7 text-sm shadow-2xl disabled:grayscale group"
                        >
                           <span className="flex items-center justify-center gap-3">
                              <span className="material-icons-outlined group-hover:rotate-12 transition-transform">bolt</span>
                              {loading ? 'PROCESSING...' : `CONFIRM ${amount ? (currency === 'USD' ? '$' : currency === 'KSH' ? 'Ksh ' : 'S ') + amount : ''} DEPOSIT`}
                           </span>
                        </button>
                        <p className="text-[9px] text-soft-grey text-center uppercase tracking-widest mt-6 opacity-40 italic font-bold">
                           * All deposits are subject to our security policy.
                        </p>
                      </div>
                   </div>
                 )}
              </section>
           </div>

        </div>
      </div>
    </Shell>
  );
}

function MethodButton({ onClick, active, icon, label, desc, color }: any) {
  const colorMap: any = {
    green: 'text-green',
    blue: 'text-blue',
    gold: 'text-gold',
    'bg-green': 'bg-green/10 border-green',
    'bg-blue': 'bg-blue/10 border-blue',
    'bg-gold': 'bg-gold/10 border-gold',
  };

  return (
    <button 
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden ${
        active 
          ? `${colorMap['bg-' + color]} shadow-2xl shadow-${color}/10` 
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
      }`}
    >
       <div className="flex justify-between items-start relative z-10">
          <div className={`w-14 h-14 rounded-2xl bg-navy flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
             <span className={`material-icons-outlined text-3xl ${active ? colorMap[color] : 'text-soft-grey'}`}>{icon}</span>
          </div>
          {active && <span className={`material-icons-outlined ${colorMap[color]} text-2xl`}>verified</span>}
       </div>
       <div className="mt-6 relative z-10">
          <p className="text-lg font-black text-white italic">{label}</p>
          <p className="text-[10px] text-soft-grey font-black uppercase tracking-widest mt-1 opacity-60">{desc}</p>
       </div>
    </button>
  );
}

function InstructionLine({ label, value }: any) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-4">
       <span className="text-[9px] font-black text-soft-grey uppercase tracking-widest">{label}</span>
       <span className="text-xs font-mono font-bold text-white group cursor-pointer hover:text-green transition-colors">
          {value} <span className="material-icons-outlined text-[10px] ml-2 opacity-0 group-hover:opacity-100">content_copy</span>
       </span>
    </div>
  );
}
