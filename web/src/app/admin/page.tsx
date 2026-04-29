'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in duration-700">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 italic">System Overview</h1>
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-green animate-pulse"></span>
              <span className="text-[10px] font-black text-green uppercase tracking-[0.2em]">Live Systems Operational</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-soft-grey">
             <span className="material-icons-outlined text-sm">calendar_today</span>
             <span className="text-[10px] font-bold uppercase tracking-widest">Last 24 Hours</span>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Liquidity" value="$42,904,112.00" change="+4.2%" icon="account_balance_wallet" color="green" href="/admin/liquidity" />
          <StatCard title="24h Volume" value="$1,245,800.00" change="+12.8%" icon="bar_chart" color="blue" href="/admin/volume" />
          <StatCard title="Active Merchants" value="2,841" change="+82" icon="storefront" color="green" href="/admin" />
          <StatCard title="System Health" value="99.98%" change="Optimal" icon="dns" color="green" href="/admin/settings" />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Volume Chart Placeholder */}
           <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col h-[400px]">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-xl font-bold mb-1">Volume Growth</h3>
                    <p className="text-[10px] font-medium text-soft-grey uppercase tracking-widest">Transaction flow over the last 30 days</p>
                 </div>
                 <select className="bg-navy border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                 </select>
              </div>
              <div className="flex-1 flex items-end justify-between gap-4 px-4">
                 {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer">
                       <div className="w-full bg-white/5 rounded-t-xl relative overflow-hidden h-64">
                          <div 
                            style={{ height: `${h}%` }} 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-signature rounded-t-xl group-hover:opacity-80 transition-all duration-700"
                          ></div>
                       </div>
                       <span className="text-[9px] font-black text-soft-grey uppercase tracking-widest">Week {i + 1}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Distribution Placeholder */}
           <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col">
              <h3 className="text-xl font-bold mb-1">Merchant Distribution</h3>
              <p className="text-[10px] font-medium text-soft-grey uppercase tracking-widest mb-10">Volume by sector</p>

              <div className="space-y-8 flex-1">
                 <DistributionItem label="E-Commerce" value="54%" color="green" />
                 <DistributionItem label="SaaS & Tech" value="29%" color="blue" />
                 <DistributionItem label="Retail" value="17%" color="soft-grey" />
              </div>

              <button className="mt-auto w-full flex items-center justify-center gap-2 py-4 text-green text-[10px] font-black uppercase tracking-[0.2em] hover:gap-4 transition-all border-t border-white/5 pt-6">
                 View Detailed Analytics <span className="material-icons-outlined text-sm">arrow_forward</span>
              </button>
           </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold">Recent Large Transactions</h3>
              <button className="text-green text-[10px] font-black uppercase tracking-[0.2em] hover:underline transition-all">View All Transactions</button>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-soft-grey uppercase tracking-[0.2em] border-b border-white/5 pb-4">
                       <th className="pb-6">Transaction ID</th>
                       <th className="pb-6">Merchant</th>
                       <th className="pb-6">Amount</th>
                       <th className="pb-6">Status</th>
                       <th className="pb-6">Timestamp</th>
                       <th className="pb-6 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs">
                    <TransactionRow id="#TXN-84920-A" merchant="Global Store Inc." amount="$12,450.00" status="Success" time="2 mins ago" icon="shopping_bag" />
                    <TransactionRow id="#TXN-84919-B" merchant="Nebula Cloud" amount="$4,200.00" status="Pending" time="12 mins ago" icon="cloud" />
                    <TransactionRow id="#TXN-84918-C" merchant="Iron Bank Ltd" amount="$25,000.00" status="Held" time="45 mins ago" icon="account_balance" />
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ title, value, change, icon, color, href }: any) {
  const content = (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all group h-full">
      <div className="flex justify-between items-start mb-6">
         <div className={`w-12 h-12 rounded-2xl bg-navy border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <span className={`material-icons-outlined text-xl text-${color}`}>{icon}</span>
         </div>
         <span className={`text-[10px] font-black px-2 py-1 rounded-md ${change.startsWith('+') ? 'bg-green/10 text-green' : 'bg-blue/10 text-blue'}`}>
            {change}
         </span>
      </div>
      <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

function DistributionItem({ label, value, color }: any) {
  return (
    <div className="space-y-3">
       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
          <span>{label}</span>
          <span className={`text-${color}`}>{value}</span>
       </div>
       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div style={{ width: value }} className={`h-full bg-${color} rounded-full`}></div>
       </div>
    </div>
  );
}

function TransactionRow({ id, merchant, amount, status, time, icon }: any) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
       <td className="py-6 font-bold text-soft-grey">{id}</td>
       <td className="py-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center border border-white/10">
                <span className="material-icons-outlined text-sm text-soft-grey">{icon}</span>
             </div>
             <span className="font-bold">{merchant}</span>
          </div>
       </td>
       <td className="py-6 font-black text-white text-sm">{amount}</td>
       <td className="py-6">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            status === 'Success' ? 'bg-green/10 text-green border-green/20' : 
            status === 'Pending' ? 'bg-blue/10 text-blue border-blue/20' : 
            'bg-orange-400/10 text-orange-400 border-orange-400/20'
          }`}>
             <span className="inline-block w-1 h-1 rounded-full bg-current mr-1.5 mb-0.5"></span>
             {status}
          </span>
       </td>
       <td className="py-6 text-soft-grey font-medium">{time}</td>
       <td className="py-6 text-right">
          <button className="text-soft-grey hover:text-white transition-colors">
             <span className="material-icons-outlined">more_vert</span>
          </button>
       </td>
    </tr>
  );
}
