'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function MerchantSelectPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const [mRes, iRes] = await Promise.all([
        api.get('/merchant/my-businesses'),
        api.get('/merchant/invites')
      ]);
      setMerchants(mRes.data);
      setInvites(iRes.data);
    } catch (err) {
      console.error('Failed to fetch merchants', err);
    } finally {
      setLoading(false);
    }
  };

  const respondToInvite = async (merchantId: string, accept: boolean) => {
    try {
      await api.post(`/merchant/invites/${merchantId}/respond`, { accept });
      fetchMerchants();
    } catch (err) {
      console.error('Failed to respond to invite', err);
    }
  };

  const selectMerchant = (id: string) => {
    localStorage.setItem('activeMerchantId', id);
    router.push('/merchant');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1225] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1225] text-white p-10 md:p-24 selection:bg-green/30">
      <div className="max-w-6xl mx-auto space-y-16">
        
        <header className="space-y-6 text-center lg:text-left">
           <h1 className="text-6xl font-black italic tracking-tighter">Select Business</h1>
           <p className="text-soft-grey text-lg font-medium uppercase tracking-widest">Choose the entity you wish to manage today</p>
        </header>

         {invites.length > 0 && (
           <section className="space-y-8 animate-in slide-in-from-top-10 duration-700">
              <div className="flex items-center gap-4 px-4">
                 <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                    <span className="material-icons-outlined text-gold">handshake</span>
                 </div>
                 <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Pending Team Invitations</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {invites.map((invite) => (
                   <div key={invite.id} className="bg-gold/5 border border-gold/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                      <div className="flex items-center gap-6 relative z-10">
                         <div className="w-16 h-16 bg-navy rounded-2xl border border-gold/10 overflow-hidden">
                            <img 
                              src={invite.merchant.logo_url?.startsWith('/') 
                                ? `${api.defaults.baseURL}${invite.merchant.logo_url}` 
                                : invite.merchant.logo_url || `https://ui-avatars.com/api/?name=${invite.merchant.business_name}&background=EAB308&color=0B1225`
                              } 
                              className="w-full h-full object-cover" 
                            />
                         </div>
                         <div>
                            <p className="text-sm font-black italic text-white uppercase">{invite.merchant.business_name}</p>
                            <p className="text-[10px] font-black text-gold uppercase tracking-widest mt-1">Invited as {invite.role}</p>
                         </div>
                      </div>
                      <div className="flex gap-4 relative z-10 w-full md:w-auto">
                         <button 
                           onClick={() => respondToInvite(invite.merchant_id, true)}
                           className="flex-1 md:flex-none bg-gold text-navy px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                         >
                           Accept
                         </button>
                         <button 
                           onClick={() => respondToInvite(invite.merchant_id, false)}
                           className="flex-1 md:flex-none bg-white/5 border border-white/10 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-400/10 hover:text-red-400 transition-all"
                         >
                           Decline
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
         )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {merchants.map((m) => (
             <div 
               key={m.id} 
               onClick={() => selectMerchant(m.id)}
               className="group relative bg-white/5 border border-white/10 rounded-[3rem] p-10 cursor-pointer hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden"
             >
                {/* Branding Background */}
                <div 
                  className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] -mr-20 -mt-20 opacity-20 transition-colors"
                  style={{ backgroundColor: m.branding_color || '#16C66E' }}
                ></div>

                <div className="relative z-10 space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="w-20 h-20 bg-navy/60 rounded-3xl p-1 overflow-hidden border border-white/10 shadow-inner">
                         <img 
                           src={m.logo_url?.startsWith('/') 
                             ? `${api.defaults.baseURL}${m.logo_url}` 
                             : m.logo_url || `https://ui-avatars.com/api/?name=${m.business_name}&background=16C66E&color=fff`
                           } 
                           className="w-full h-full object-cover rounded-2xl" 
                           alt={m.business_name} 
                         />
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        m.userRole === 'OWNER' ? 'bg-green/10 text-green border-green/20' : 'bg-blue/10 text-blue border-blue/20'
                      }`}>
                        {m.userRole}
                      </span>
                   </div>

                   <div>
                      <h3 className="text-2xl font-black italic truncate">{m.business_name}</h3>
                      <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] mt-2 opacity-60">ID: {m.gencom_merchant_id}</p>
                   </div>

                   <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                      <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest">
                        {m.business_type === 'BRANCH' ? 'FRANCHISE BRANCH' : 'PRIMARY ENTITY'}
                      </p>
                      <span className="material-icons-outlined text-green group-hover:translate-x-2 transition-transform">arrow_forward</span>
                   </div>
                </div>
             </div>
           ))}

           {/* Add New Business CTA */}
           <Link 
             href="/merchant/register"
             className="group border-2 border-dashed border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 hover:border-green/40 hover:bg-green/5 transition-all"
           >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green group-hover:text-navy transition-all">
                 <span className="material-icons-outlined text-3xl">add</span>
              </div>
              <div className="text-center">
                 <p className="text-xs font-black uppercase tracking-widest">Register New Business</p>
                 <p className="text-[9px] text-soft-grey mt-2 font-medium">Add a branch or new franchise</p>
              </div>
           </Link>
        </div>

        <div className="pt-20 border-t border-white/5 flex justify-center">
           <Link href="/dashboard" className="text-[10px] font-black text-soft-grey hover:text-white uppercase tracking-[0.4em] transition-colors">
              Return to Personal Dashboard
           </Link>
        </div>
      </div>

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
