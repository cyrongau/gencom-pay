'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/Shell';
import api from '@/lib/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function MerchantAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/merchant/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center h-screen"><span className="animate-spin material-icons-outlined text-4xl text-green">refresh</span></div></Shell>;

  const COLORS = ['#16C66E', '#3B82F6', '#FACC15', '#F87171'];

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Business Intelligence</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Cashflow Visualization & Growth Metrics</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mx-4">
           <KPICard label="Total Volume" value={`$${data.overview.totalVolume}`} trend="+12.5%" icon={<DollarSign className="text-green" />} />
           <KPICard label="Avg Order Value" value={`$${data.overview.avgOrderValue}`} trend="+3.2%" icon={<TrendingUp className="text-blue-400" />} />
           <KPICard label="Transactions" value={data.overview.transactionCount} trend="+18%" icon={<Activity className="text-gold" />} />
           <KPICard label="Success Rate" value={data.overview.successRate} trend="STABLE" icon={<Users className="text-sky-400" />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 mx-4">
           
           {/* Revenue Trend Chart */}
           <div className="xl:col-span-8 bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black italic tracking-tight">Revenue Trajectory</h3>
                 <div className="flex gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-green/10 text-green text-[9px] font-black uppercase tracking-widest border border-green/20">7-Day Protocol</span>
                 </div>
              </div>
              
              <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData}>
                       <defs>
                          <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#16C66E" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#16C66E" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} dy={10} />
                       <YAxis hide />
                       <Tooltip 
                         contentStyle={{backgroundColor: '#0A192F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', color: 'white'}}
                         itemStyle={{color: '#16C66E', fontWeight: 900}}
                       />
                       <Area type="monotone" dataKey="volume" stroke="#16C66E" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Payment Method Breakdown */}
           <div className="xl:col-span-4 bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl">
              <h3 className="text-2xl font-black italic tracking-tight text-center">Settlement Mix</h3>
              
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={data.methodBreakdown}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={100}
                         paddingAngle={8}
                         dataKey="value"
                       >
                         {data.methodBreakdown.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                 {data.methodBreakdown.map((item: any, index: number) => (
                    <div key={item.name} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{item.name}</span>
                       </div>
                       <span className="text-sm font-black text-white italic">{item.value}%</span>
                    </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Bottom Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mx-4">
           <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
              <h3 className="text-2xl font-black italic tracking-tight">Merchant Liquidity</h3>
              <div className="space-y-6">
                 {[
                   { label: 'Available for Payout', value: `$${data.overview.totalVolume}`, status: 'Settled' },
                   { label: 'Pending Batch', value: '$12,450.00', status: 'Processing' },
                   { label: 'Network Reserve', value: '$2,500.00', status: 'Locked' }
                 ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-6 last:border-0 last:pb-0">
                       <div>
                          <p className="text-sm font-black text-white italic">{row.label}</p>
                          <p className="text-[10px] text-soft-grey uppercase font-bold tracking-widest mt-1">{row.status}</p>
                       </div>
                       <p className="text-xl font-black text-white">{row.value}</p>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-[#16C66E]/5 border border-green/20 rounded-[3rem] p-10 flex flex-col justify-center space-y-6">
              <div className="w-16 h-16 bg-green/20 rounded-2xl flex items-center justify-center">
                 <Activity className="text-green w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-white italic leading-tight">Protocol efficiency is <br/><span className="text-green">optimized at 99.98%</span></h3>
              <p className="text-sm text-soft-grey leading-relaxed max-w-sm">Your merchant account is performing above the 90th percentile of network nodes. No action is required for liquidity management.</p>
           </div>
        </div>

      </div>
    </Shell>
  );
}

function KPICard({ label, value, trend, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/10 transition-all shadow-xl group">
       <div className="flex justify-between items-center">
          <div className="w-12 h-12 bg-navy rounded-2xl border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <span className="text-[10px] font-black text-green tracking-widest bg-green/10 px-3 py-1 rounded-full">{trend}</span>
       </div>
       <div>
          <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest mb-2">{label}</p>
          <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
