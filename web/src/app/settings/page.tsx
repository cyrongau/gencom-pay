'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/user/profile', formData);
      showNotification('Settings updated successfully!', 'success');
    } catch (err) {
      showNotification('Update failed', 'error');
    }
  };

  const toggle2FA = async (enabled: boolean) => {
    try {
      await api.post(`/user/2fa/${enabled ? 'enable' : 'disable'}`);
      showNotification(`2FA ${enabled ? 'Enabled' : 'Disabled'}!`, 'success');
    } catch (err) {
      showNotification('Failed to update 2FA status', 'error');
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Header */}
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">System Settings</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Configure Global Parameters & Security</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           
           {/* Main Settings Form */}
           <div className="xl:col-span-8 space-y-10">
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 
                 <h3 className="text-2xl font-black italic relative z-10">General Identity</h3>

                 <form onSubmit={handleUpdate} className="space-y-10 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Full Legal Name</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="glass-input w-full"
                            placeholder="John Doe"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Primary Email Node</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            disabled
                            className="glass-input w-full opacity-40 cursor-not-allowed"
                            placeholder="john@example.com"
                          />
                       </div>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    <div className="space-y-8">
                       <div className="flex items-center gap-3">
                          <span className="material-icons-outlined text-green">key</span>
                          <h4 className="text-sm font-black text-white uppercase tracking-widest">Authentication Secrets</h4>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Current Secret</label>
                             <input 
                               type="password" 
                               value={formData.currentPassword}
                               onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                               className="glass-input w-full"
                               placeholder="••••••••"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">New Secret Token</label>
                             <input 
                               type="password" 
                               value={formData.newPassword}
                               onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                               className="glass-input w-full"
                               placeholder="••••••••"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="flex justify-end">
                       <button 
                         type="submit"
                         className="btn-primary py-5 px-12 text-sm shadow-2xl"
                       >
                         Sync All Parameters
                       </button>
                    </div>
                 </form>
              </section>
           </div>

           {/* Security Toggles & Danger Zone */}
           <div className="xl:col-span-4 space-y-8">
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                 <h3 className="text-xl font-black italic">Security Protocols</h3>
                 <div className="space-y-8">
                    <ToggleItem 
                      label="Two-Factor Authentication" 
                      desc="Require a secure token for every login."
                      defaultChecked={user?.metadata?.twoFactorEnabled} 
                      onChange={toggle2FA}
                    />
                    <div className="h-px bg-white/5"></div>
                    <ToggleItem 
                      label="Real-time Notifications" 
                      desc="Alert me for all account activity."
                      defaultChecked 
                    />
                    <ToggleItem 
                      label="Merchant Webhooks" 
                      desc="Enable external checkout signals."
                    />
                 </div>
              </section>

              <section className="bg-red-400/5 border border-red-400/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                 <div className="flex items-center gap-3 text-red-400">
                    <span className="material-icons-outlined">warning</span>
                    <h3 className="text-xl font-black italic">Danger Zone</h3>
                 </div>
                 <p className="text-[10px] text-soft-grey uppercase tracking-widest leading-relaxed">
                    Permanent node termination. All assets must be off-ramped before deletion. This process is IRREVERSIBLE.
                 </p>
                 <button className="w-full py-4 bg-red-400/10 text-red-400 text-[10px] font-black rounded-2xl border border-red-400/20 hover:bg-red-400 hover:text-white transition-all shadow-xl">
                    TERMINATE ACCOUNT NODE
                 </button>
              </section>
           </div>

        </div>
      </div>
    </Shell>
  );
}

function ToggleItem({ label, desc, defaultChecked = false, onChange }: any) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between group">
       <div className="max-w-[70%]">
          <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[10px] text-soft-grey font-medium leading-tight">{desc}</p>
       </div>
       <button 
         onClick={() => {
           const next = !checked;
           setChecked(next);
           if (onChange) onChange(next);
         }}
         className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${checked ? 'bg-green' : 'bg-white/10'}`}
       >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-2xl transition-all duration-300 ${checked ? 'right-1' : 'left-1'}`}></div>
       </button>
    </div>
  );
}
