'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';
import MerchantLockBanner from '@/components/MerchantLockBanner';

export default function MerchantPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [merchant, setMerchant] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [revealKey, setRevealKey] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    try {
      const activeId = localStorage.getItem('activeMerchantId');
      if (!activeId) return;

      const [mRes, sRes, tRes] = await Promise.all([
        api.get('/merchant/my-businesses'),
        api.get('/merchant/analytics'),
        api.get('/merchant/transactions')
      ]);
      
      const active = mRes.data.find((m: any) => m.id === activeId);
      setMerchant(active);
      setStats(sRes.data);
      setAnalytics(sRes.data);
      setTransactions(tRes.data);
    } catch (err) {
      console.error('Failed to fetch merchant data', err);
    } finally {
      setFetching(false);
      setDataLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/merchant/transactions/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'merchant_transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-4 gap-6">
            <div className="flex flex-col gap-2">
               <h1 className="text-4xl font-black italic tracking-tighter text-white">Merchant Central</h1>
               <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Business Operations & Atomic Settlement Node</p>
                  {merchant && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <p className="text-[10px] font-black text-green uppercase tracking-[0.3em] bg-green/10 px-3 py-1 rounded-md border border-green/20">ID: {merchant.gencom_merchant_id}</p>
                    </>
                  )}
               </div>
            </div>
           <div className="flex gap-4">
              <button 
                onClick={() => router.push('/merchant/settings')}
                className="bg-white/5 border border-white/10 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest"
              >
                 <span className="material-icons-outlined text-sm">settings</span> Configure Portal
              </button>
              <button 
                onClick={() => router.push('/merchant/developer')}
                className="btn-primary py-4 px-8 text-[10px]"
              >
                 <span className="material-icons-outlined text-sm">add</span> New Integration
              </button>
           </div>
        </div>

        {merchant && merchant.status !== 'VERIFIED' && (
          <MerchantLockBanner status={merchant.status} />
        )}

        <div className={merchant?.status !== 'VERIFIED' ? 'locked-content' : ''}>
           {/* Top Analytics Bar */}
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <AnalyticsCard 
                label="Gross Volume" 
                value={formatCurrency(analytics?.overview?.totalVolume || 0)} 
                trend={analytics?.overview?.totalVolume > 0 ? "+0.0%" : "No Data"} 
                icon="payments" 
                color="green" 
              />
              <AnalyticsCard 
                label="Avg Order Value" 
                value={formatCurrency(analytics?.overview?.avgOrderValue || 0)} 
                trend="Stable" 
                icon="account_balance" 
                color="blue" 
              />
              <AnalyticsCard 
                label="Success Rate" 
                value={analytics?.overview?.successRate || '0%'} 
                trend="Live" 
                icon="verified" 
                color="green" 
              />
              <AnalyticsCard 
                label="Transactions" 
                value={analytics?.overview?.transactionCount || 0} 
                trend="Real-time" 
                icon="bolt" 
                color="gold" 
              />
           </div>

           {/* Branch Overwatch for HQ */}
           {merchant?.business_type === 'HEADQUARTERS' && (
             <section className="mt-20 px-4 space-y-10 animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="flex justify-between items-end">
                   <div>
                      <h3 className="text-2xl font-black italic">Franchise Oversight</h3>
                      <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] mt-2">Aggregated performance across all branches</p>
                   </div>
                   <button onClick={() => router.push('/merchant/select')} className="text-[10px] font-black text-green hover:underline uppercase tracking-widest">Switch Context</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-4">
                      <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest">Active Branches</p>
                      <p className="text-4xl font-black italic text-white tracking-tighter">12</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-4">
                      <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest">Aggregate Volume (24h)</p>
                      <p className="text-4xl font-black italic text-white tracking-tighter">$142,900.00</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-4">
                      <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest">System Health</p>
                      <p className="text-4xl font-black italic text-green tracking-tighter">OPTIMAL</p>
                   </div>
                </div>
             </section>
           )}

           {/* Main Grid Layout */}
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 px-4 mt-20">
              
              {/* Left/Main Column: Developer tools & Table */}
              <div className="xl:col-span-8 space-y-10">
                 
                 {/* API Credentials Card */}
                 <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="flex justify-between items-center relative z-10">
                       <h3 className="text-2xl font-black italic">Developer Tools</h3>
                       <div className="flex gap-2">
                          <span className="px-4 py-1.5 rounded-full bg-green/10 text-green border border-green/20 text-[9px] font-black uppercase tracking-widest">Live Mode</span>
                          <span className="material-icons-outlined text-soft-grey">terminal</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                       <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                             <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Secret API Key</label>
                             <button onClick={() => setRevealKey(!revealKey)} className="text-[10px] font-black text-green uppercase tracking-widest hover:underline">
                                {revealKey ? 'Hide Secret' : 'Reveal Secret'}
                             </button>
                          </div>
                          <div className="bg-navy/60 border border-white/10 rounded-2xl p-6 font-mono text-xs text-white/40 break-all flex items-center justify-between">
                             <span>{revealKey ? (merchant?.api_keys?.[0]?.client_secret || 'sk_live_...') : '••••••••••••••••••••••••••••••••'}</span>
                             <span className="material-icons-outlined text-xs text-soft-grey hover:text-white cursor-pointer">content_copy</span>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                             <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Public API Key</label>
                             <button 
                               onClick={() => router.push('/merchant/developer')}
                               className="text-[10px] font-black text-soft-grey uppercase tracking-widest hover:underline"
                             >
                                Manage Keys
                             </button>
                          </div>
                          <div className="bg-navy/60 border border-white/10 rounded-2xl p-6 font-mono text-xs text-white/40 break-all flex items-center justify-between">
                             <span>{merchant?.api_keys?.[0]?.client_id || 'pk_live_...'}</span>
                             <span className="material-icons-outlined text-xs text-soft-grey hover:text-white cursor-pointer">content_copy</span>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* Transaction Logs - Full Table */}
                 <section className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 space-y-10 shadow-2xl">
                    <div className="flex justify-between items-center">
                       <h3 className="text-2xl font-black italic">Payments Received</h3>
                       <button 
                         onClick={handleExport}
                         className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 text-white"
                       >
                          <span className="material-icons-outlined text-sm">download</span> Export CSV
                       </button>
                    </div>
                    
                    <div className="overflow-x-auto min-h-[300px]">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] border-b border-white/5 pb-6">
                                <th className="pb-8">Order ID</th>
                                <th className="pb-8">Timestamp</th>
                                <th className="pb-8">Reference</th>
                                <th className="pb-8">Amount</th>
                                <th className="pb-8 text-right pr-4">Status</th>
                             </tr>
                          </thead>
                          <tbody className="text-xs">
                             {dataLoading ? (
                                <tr>
                                  <td colSpan={5} className="py-20 text-center text-soft-grey uppercase font-black tracking-widest text-[10px]">Updating Payments...</td>
                                </tr>
                             ) : transactions.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="py-20 text-center text-soft-grey uppercase font-black tracking-widest text-[10px]">No payments found</td>
                                </tr>
                             ) : (
                                transactions.map((tx, idx) => (
                                  <MerchantRow 
                                    key={tx.id || idx}
                                    id={`#${tx.id.slice(0, 8)}`} 
                                    customer={tx.metadata?.customer_name || 'Private Customer'}
                                    timestamp={new Date(tx.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    method={tx.description || 'Payment'} 
                                    amount={formatCurrency(tx.amount)} 
                                    status="SUCCESS" 
                                    color="green" 
                                  />
                                ))
                             )}
                          </tbody>
                       </table>
                    </div>
                 </section>
              </div>

              {/* Right Column: Health & SDKs */}
              <div className="xl:col-span-4 space-y-8">
                 
                 {/* Webhook Health Gauge */}
                 <section className="bg-[#0F3D3A]/20 backdrop-blur-xl border border-green/20 rounded-[3rem] p-10 flex flex-col items-center text-center space-y-8 shadow-2xl">
                    <div className="flex justify-between items-center w-full">
                       <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Network Health</p>
                       <span className="w-2 h-2 bg-green rounded-full animate-pulse shadow-[0_0_10px_#16C66E]"></span>
                    </div>
                    <div className="relative w-48 h-48">
                       <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(22, 198, 110, 0.1)" strokeWidth="6" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#16C66E" strokeWidth="6" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black italic tracking-tighter text-white">100%</span>
                          <span className="text-[9px] font-black text-green uppercase tracking-widest mt-2">UPTIME RELIABILITY</span>
                       </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-4">
                       <div className="bg-navy/40 p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-soft-grey uppercase tracking-widest mb-1">Endpoints</p>
                          <p className="text-xs font-black text-white italic">OPERATIONAL</p>
                       </div>
                       <div className="bg-navy/40 p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-soft-grey uppercase tracking-widest mb-1">Latency</p>
                          <p className="text-xs font-black text-white">OPTIONAL</p>
                       </div>
                    </div>
                 </section>

                 {/* Developer SDKs Grid */}
                 <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                    <h3 className="text-xl font-black italic">Integration SDKs</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <SDKLink icon="code" label="Node.js" color="green" />
                       <SDKLink icon="terminal" label="Python" color="blue" />
                       <SDKLink icon="javascript" label="React" color="sky" />
                       <SDKLink icon="settings_remote" label="Webhooks" color="gold" />
                    </div>
                    <button className="w-full py-4 text-[10px] font-black text-soft-grey hover:text-white transition-all uppercase tracking-widest border border-white/5 rounded-2xl">
                       View Full API Docs
                    </button>
                 </section>
              </div>

           </div>
        </div>
      </div>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </Shell>
  );
}

function AnalyticsCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/10 transition-all cursor-pointer group shadow-xl">
       <div className="flex justify-between items-center">
          <div className={`w-12 h-12 rounded-2xl bg-navy border border-white/5 flex items-center justify-center group-hover:rotate-6 transition-transform`}>
             <span className={`material-icons-outlined text-xl text-${color}`}>{icon}</span>
          </div>
          <span className={`text-[10px] font-black tracking-widest text-${color}`}>{trend}</span>
       </div>
       <div>
          <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest mb-2">{label}</p>
          <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
       </div>
    </div>
  );
}

function MerchantRow({ id, customer, timestamp, method, amount, status, color }: any) {
  return (
    <tr className="group hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 last:border-0">
       <td className="py-8 pl-4">
          <p className="text-sm font-black text-white italic">{id}</p>
          <p className="text-[9px] text-soft-grey uppercase tracking-widest mt-1">{timestamp}</p>
       </td>
       <td className="py-8">
          <p className="text-xs font-black italic text-white">{customer}</p>
          <p className="text-[9px] text-soft-grey uppercase tracking-widest mt-1">Verified Sender</p>
       </td>
       <td className="py-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center border border-white/5 group-hover:text-green">
                <span className="material-icons-outlined text-sm">receipt_long</span>
             </div>
             <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">{method}</span>
          </div>
       </td>
       <td className="py-8">
          <p className="text-sm font-black text-white italic">{amount}</p>
       </td>
       <td className="py-8 text-right pr-4">
          <span className={`inline-block px-4 py-1.5 rounded-full text-[8px] font-black tracking-[0.2em] border bg-green/10 text-green border-green/20`}>
             {status}
          </span>
       </td>
    </tr>
  );
}

function SDKLink({ icon, label, color }: any) {
  return (
    <button className="flex flex-col items-center gap-3 py-6 bg-navy/40 border border-white/5 rounded-2xl hover:bg-green/5 hover:border-green/20 transition-all group">
       <span className={`material-icons-outlined text-xl text-soft-grey group-hover:text-${color}`}>{icon}</span>
       <span className="text-[8px] font-black uppercase tracking-widest text-soft-grey group-hover:text-white">{label}</span>
    </button>
  );
}
