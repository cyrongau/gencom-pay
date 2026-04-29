'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';

export default function MerchantRegisterPage() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    businessType: 'INDEPENDENT'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/merchant/register', formData);
      showNotification('Business entity registered successfully!', 'success');
      localStorage.setItem('activeMerchantId', data.id);
      router.push('/merchant');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1225] text-white flex flex-col items-center justify-center p-6 md:p-24 selection:bg-green/30">
      <div className="max-w-xl w-full space-y-12">
        <header className="text-center space-y-4">
           <h1 className="text-5xl font-black italic tracking-tighter">Scale Your Vision</h1>
           <p className="text-soft-grey text-sm font-medium uppercase tracking-[0.3em]">Establish your merchant presence on Gencom Pay</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-16 space-y-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
           
           <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Legal Business Name</label>
              <input 
                type="text" 
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Acme Corporation Ltd"
                className="w-full bg-navy/60 border border-white/10 rounded-2xl p-6 text-white font-mono text-sm outline-none focus:border-green/40 transition-all"
              />
           </div>

           <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Website / Portfolio (Optional)</label>
              <input 
                type="url" 
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://acme.com"
                className="w-full bg-navy/60 border border-white/10 rounded-2xl p-6 text-white font-mono text-sm outline-none focus:border-green/40 transition-all"
              />
           </div>

           <div className="space-y-6 relative z-10">
              <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Business Structure</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setFormData({ ...formData, businessType: 'INDEPENDENT' })}
                   className={`p-6 rounded-2xl border-2 transition-all text-left space-y-2 ${
                     formData.businessType === 'INDEPENDENT' ? 'bg-green/10 border-green text-white' : 'bg-navy/40 border-white/5 text-soft-grey hover:border-white/10'
                   }`}
                 >
                    <p className="text-xs font-black uppercase tracking-widest">Single Entity</p>
                    <p className="text-[8px] font-medium leading-relaxed opacity-60">Ideal for independent shops, freelancers, or single-location ventures.</p>
                 </button>

                 <button 
                   type="button"
                   onClick={() => setFormData({ ...formData, businessType: 'HEADQUARTERS' })}
                   className={`p-6 rounded-2xl border-2 transition-all text-left space-y-2 ${
                     formData.businessType === 'HEADQUARTERS' ? 'bg-blue/10 border-blue text-white' : 'bg-navy/40 border-white/5 text-soft-grey hover:border-white/10'
                   }`}
                 >
                    <p className="text-xs font-black uppercase tracking-widest">Franchise / HQ</p>
                    <p className="text-[8px] font-medium leading-relaxed opacity-60">Establish a Multi-branch ecosystem with centralized overwatch & branch management.</p>
                 </button>
              </div>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-green text-navy py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-green/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
           >
              {loading ? 'DEPLOYING...' : 'REGISTER BUSINESS'}
           </button>
        </form>

        <div className="text-center">
           <Link href="/merchant/select" className="text-[10px] font-black text-soft-grey hover:text-white uppercase tracking-[0.4em] transition-colors">
              Return to Selection
           </Link>
        </div>
      </div>
    </div>
  );
}
