'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/Shell';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', icon: 'monetization_on' },
  { code: 'KSH', name: 'Kenyan Shilling', icon: 'payments' },
  { code: 'SLS', name: 'Somaliland Shilling', icon: 'account_balance' },
  { code: 'BTC', name: 'Bitcoin', icon: 'currency_bitcoin' },
  { code: 'ETH', name: 'Ethereum', icon: 'token' },
];

export default function ProfilePage() {
  const { user, fetchProfile } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchWallets();
  }, [user]);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data);
    } catch (err) {
      console.error('Failed to fetch wallets', err);
    }
  };

  const createWallet = async (currency: string) => {
    setCreating(true);
    try {
      await api.post('/wallets', { currency });
      fetchWallets();
      showNotification(`${currency} Account created!`, 'success');
      setShowCurrencyModal(false);
    } catch (err) {
      showNotification('Failed to create account', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    showNotification('Uploading avatar...', 'info');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await api.post('/user/profile/avatar', { avatar: base64String });
        await fetchProfile();
        showNotification('Avatar updated successfully!', 'success');
      } catch (err) {
        showNotification('Upload failed. Please check file size.', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Wallet ID copied!', 'success');
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Header Section */}
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">My Identity</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Manage Personal Assets & Security Protocols</p>
        </div>

        {/* Profile Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           
           {/* Left Column: Avatar & Summary */}
           <div className="xl:col-span-4 space-y-10">
              <section className="bg-gradient-dashboard rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -mr-40 -mt-40"></div>
                 
                 <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    <div className="relative">
                       <div className="w-40 h-40 rounded-[3rem] border-4 border-white/10 p-1.5 bg-gradient-signature overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                          <img 
                            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=16C66E&color=fff`} 
                            className="w-full h-full rounded-[2.5rem] object-cover border-4 border-navy"
                            alt="Profile" 
                          />
                       </div>
                       <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-green rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 transition-all border-8 border-navy group/camera">
                          <span className="material-icons-outlined text-navy text-xl">camera_alt</span>
                          <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                       </label>
                    </div>

                    <div>
                       <h2 className="text-4xl font-black italic text-white tracking-tighter">{user?.full_name}</h2>
                       <p className="text-sm font-medium text-white/60 tracking-widest uppercase mt-2">{user?.email}</p>
                    </div>

                    <div className="flex gap-4">
                       <StatusBadge label={user?.status || 'UNVERIFIED'} active={user?.status === 'VERIFIED' || user?.status === 'ACTIVE'} />
                       <StatusBadge label={`${user?.role || 'USER'} ACCESS`} active />
                    </div>
                 </div>
              </section>

              {/* Security Summary Panel */}
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                 <h3 className="text-xl font-black italic px-2">Account Security</h3>
                 <div className="space-y-8">
                    <SecurityItem icon="shield" label="2FA Protocol" status={user?.is_2fa_enabled ? 'SECURED' : 'UNPROTECTED'} color={user?.is_2fa_enabled ? 'green' : 'orange-400'} />
                    <SecurityItem icon="history" label="Activity Tracking" status="ENABLED" color="green" />
                    <SecurityItem icon="devices" label="Linked Nodes" status="01 ACTIVE" color="blue" />
                 </div>
                 <button onClick={() => router.push('/settings')} className="w-full bg-white/5 border border-white/10 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest shadow-xl">
                    Configure Security Settings
                 </button>
              </section>
           </div>

           {/* Right Column: Wallets & History */}
           <div className="xl:col-span-8 space-y-10">
              <section className="space-y-8">
                 <div className="flex justify-between items-center px-6">
                    <h3 className="text-2xl font-black italic">Consolidated Wallets</h3>
                    <button onClick={() => setShowCurrencyModal(true)} className="text-[10px] font-black text-green uppercase tracking-widest hover:underline shadow-2xl shadow-green/10">+ Open New Account</button>
                 </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {wallets.map((w, i) => {
                        const isUSD = w.currency === 'USD';
                        const isKSH = w.currency === 'KSH';
                        const isSLS = w.currency === 'SLS';
                        const isBTC = w.currency === 'BTC';
                        const watermark = isUSD ? '$' : isKSH ? 'KSh' : isSLS ? 'SLS' : '₿';

                        return (
                           <div 
                             key={i} 
                             className={`relative rounded-[3rem] glass-financial overflow-hidden p-10 flex flex-col justify-between group hover:scale-[1.02] transition-all shadow-2xl card-glow-${isUSD || isBTC ? 'green' : 'blue'} min-h-[280px]`}
                           >
                              <div className="card-shine"></div>
                              <div className={`absolute top-0 right-0 w-[300px] h-[300px] ${isUSD || isBTC ? 'bg-green/10' : 'bg-blue/10'} rounded-full blur-[80px] -mr-32 -mt-32 opacity-30`}></div>
                              <div className="watermark-text">{watermark}</div>
                              
                              <div className="relative z-10 flex justify-between items-start">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                                       <img 
                                         src={`https://flagcdn.com/w80/${isUSD ? 'us' : isKSH ? 'ke' : isSLS ? 'so' : 'us'}.png`} 
                                         className="w-8 h-auto rounded-sm opacity-80"
                                         alt={w.currency}
                                       />
                                    </div>
                                    <div>
                                       <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Institutional Vault</p>
                                       <div className="flex items-center gap-2">
                                          <h4 className="text-xs font-black text-white italic tracking-widest">{user?.full_name}</h4>
                                          <span className="material-icons-outlined text-[10px] text-green">verified</span>
                                       </div>
                                    </div>
                                 </div>
                                 <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">{w.currency} PRIMARY</span>
                              </div>
                              
                              <div className="relative z-10 space-y-6">
                                 <div className="space-y-2">
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">Node Identifier</p>
                                    <p className="text-xl sm:text-2xl font-mono text-white tracking-widest break-all pr-4">{w.id.slice(0, 8)}...{w.id.slice(-8)}</p>
                                 </div>
                                 <div className="flex justify-between items-center border-t border-white/5 pt-6">
                                    <p className="text-lg font-black text-white italic tracking-tighter">Bal: {parseFloat(w.balance || '0').toFixed(w.currency === 'BTC' ? 8 : 2)} <span className="text-green text-sm">{w.currency}</span></p>
                                    <button 
                                      onClick={() => copyToClipboard(w.id)}
                                      className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-green hover:text-navy transition-all shadow-2xl group/copy"
                                    >
                                       <span className="material-icons-outlined text-sm group-hover/copy:scale-110 transition-transform">content_copy</span>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                    {wallets.length === 0 && (
                       <div className="col-span-2 text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                          <span className="material-icons-outlined text-soft-grey text-6xl mb-6 animate-pulse">account_balance_wallet</span>
                          <p className="text-lg text-soft-grey font-black uppercase tracking-widest">No Active Accounts Found</p>
                       </div>
                    )}
                 </div>
              </section>

              {/* Account Data Table */}
              <section className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
                 <h3 className="text-xl font-black italic">Account Metadata</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <DataField label="Unique User Identifier" value={user?.id || '---'} />
                    <DataField label="Registered IP Address" value="192.168.0.200" />
                    <DataField label="Membership Level" value="Premium (v3.2)" />
                    <DataField label="Last Active Session" value="Today, 3:12 PM" />
                 </div>
              </section>
           </div>

        </div>
      </div>

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-navy/90 backdrop-blur-xl" onClick={() => setShowCurrencyModal(false)}></div>
           <div className="relative bg-[#0B1225] border border-white/10 w-full max-w-lg rounded-[4rem] p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl font-black italic text-white tracking-tighter">Open New Account</h2>
                 <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.4em]">Select currency protocol</p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                 {CURRENCIES.map((c) => (
                   <button 
                     key={c.code}
                     onClick={() => createWallet(c.code)}
                     disabled={creating}
                     className="flex items-center gap-6 p-6 bg-navy/60 border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-green/40 transition-all group text-left"
                   >
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-green/10 transition-all shadow-inner">
                         <span className="material-icons-outlined text-soft-grey group-hover:text-green">{c.icon}</span>
                      </div>
                      <div>
                         <p className="text-lg font-black text-white italic">{c.name}</p>
                         <p className="text-[10px] text-soft-grey font-black uppercase tracking-widest mt-1 opacity-60">{c.code} Asset Node</p>
                      </div>
                      <span className="material-icons-outlined text-soft-grey text-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                   </button>
                 ))}
              </div>

              <button 
                onClick={() => setShowCurrencyModal(false)}
                className="w-full py-6 text-[10px] font-black text-soft-grey uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel Process
              </button>
           </div>
        </div>
      )}
    </Shell>
  );
}

function StatusBadge({ label, active }: any) {
  return (
    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
      active ? 'bg-green/10 text-green border-green/20 shadow-lg shadow-green/10' : 'bg-white/5 text-soft-grey border-white/10'
    }`}>
       {label}
    </span>
  );
}

function SecurityItem({ icon, label, status, color }: any) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-navy border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-all shadow-xl">
             <span className="material-icons-outlined text-soft-grey group-hover:text-white">{icon}</span>
          </div>
          <div>
             <p className="text-sm font-black text-white">{label}</p>
             <p className="text-[9px] text-soft-grey uppercase tracking-widest mt-1 opacity-60 italic">Compliance Check</p>
          </div>
       </div>
       <span className={`text-[10px] font-black uppercase tracking-widest text-${color} px-3 py-1 bg-${color}/10 rounded-lg border border-${color}/20`}>
          {status}
       </span>
    </div>
  );
}

function DataField({ label, value }: any) {
  return (
    <div className="space-y-2 pb-6 border-b border-white/5">
       <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">{label}</p>
       <p className="text-sm font-bold text-white font-mono">{value}</p>
    </div>
  );
}
