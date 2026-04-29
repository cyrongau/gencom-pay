'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout, branding } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { label: 'System Overview', icon: 'grid_view', path: '/admin' },
    { label: 'User Directory', icon: 'people', path: '/admin/users' },
    { label: 'KYC Verification', icon: 'verified_user', path: '/admin/kyc' },
    { label: 'Merchant Oversight', icon: 'storefront', path: '/admin/merchant-kyc' },
    { label: 'Asset Management', icon: 'account_balance_wallet', path: '/admin/liquidity' },
    { label: 'Growth Metrics', icon: 'bar_chart', path: '/admin/volume' },
    { label: 'Master Ledger', icon: 'receipt_long', path: '/admin/transactions' },
    { label: 'Oversight Config', icon: 'settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1225] text-white selection:bg-green/30 font-sans">
      
      {/* Admin Sidebar - Professional Oversight Console */}
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-24' : 'w-80'} bg-[#0F3D3A] flex-col sticky top-0 z-[100] shadow-2xl border-r border-white/5 transition-all duration-300 ease-in-out`}>
        <div className={`p-6 border-b border-white/5 relative group`}>
           <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} mb-4`}>
              {isCollapsed ? (
                <div className="shrink-0 animate-in fade-in zoom-in duration-300">
                   {branding?.LOGO_SQUARE ? (
                      <img src={`${api.defaults.baseURL}${branding.LOGO_SQUARE}`} className="w-10 h-10 object-contain" alt="Logo" />
                   ) : (
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                         <span className="material-icons-outlined text-green text-xl">admin_panel_settings</span>
                      </div>
                   )}
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
                   {branding?.LOGO_LANDSCAPE ? (
                      <img src={`${api.defaults.baseURL}${branding.LOGO_LANDSCAPE}`} className="h-10 object-contain" alt={branding?.APP_NAME || 'Admin Console'} />
                   ) : (
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                            <span className="material-icons-outlined text-green text-sm">admin_panel_settings</span>
                         </div>
                         <h1 className="text-xl font-black italic tracking-tighter leading-none">{branding?.APP_NAME || 'Admin Console'}</h1>
                      </div>
                   )}
                </div>
              )}
           </div>
           {!isCollapsed && <p className="text-[10px] font-black text-green uppercase tracking-[0.3em] animate-in fade-in duration-300">System Level Oversight</p>}
           
           {/* Collapse Toggle */}
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-green text-navy rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50`}
           >
              <span className="material-icons-outlined text-sm">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
           </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-4' : 'px-6'} py-10 scrollbar-hide space-y-2`}>
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                title={isCollapsed ? item.label : ''}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-6'} py-4 rounded-2xl transition-all group relative ${
                  active ? 'bg-white/10 text-white shadow-2xl border border-white/5' : 'text-soft-grey hover:bg-white/5 hover:text-white'
                }`}
              >
                {active && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${isCollapsed ? 'w-1 h-6' : 'w-1.5 h-8'} bg-green rounded-r-full shadow-[0_0_15px_rgba(22,198,110,0.6)]`}></div>
                )}
                <span className={`material-icons-outlined text-lg ${active ? 'text-green' : 'text-soft-grey group-hover:text-white group-hover:scale-110 transition-all'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className={`text-[10px] font-black uppercase tracking-[0.25em] animate-in fade-in slide-in-from-left-2 duration-300 ${active ? 'text-white' : 'text-soft-grey'}`}>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className={`p-6 border-t border-white/5 space-y-6`}>
           <Link 
             href="/dashboard"
             title={isCollapsed ? 'Exit Oversight' : ''}
             className={`w-full py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-soft-grey hover:text-white hover:bg-white/5 transition-all flex items-center justify-center ${isCollapsed ? '' : 'gap-3'}`}
           >
              <span className="material-icons-outlined text-sm">exit_to_app</span> 
              {!isCollapsed && <span>Exit Oversight</span>}
           </Link>
           {!isCollapsed && <div className="h-px bg-white/5"></div>}
           <button onClick={logout} title={isCollapsed ? 'Terminate Session' : ''} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} text-soft-grey hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-widest group w-full text-left`}>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-400/10 transition-colors">
                <span className="material-icons-outlined text-lg">logout</span>
              </div>
              {!isCollapsed && <span>Terminate Session</span>}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Admin Header */}
        <header className="h-24 bg-[#0B1225]/90 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-[90]">
           <div className="flex items-center gap-6">
              <div className="hidden md:block space-y-1">
                 <h2 className="text-xl font-black italic tracking-tighter text-white">
                    {navItems.find(i => i.path === pathname)?.label || 'Console Overview'}
                 </h2>
                 <p className="text-[9px] font-black text-green uppercase tracking-[0.3em]">Encryption Level 4 • Active Node</p>
              </div>
           </div>

           <div className="flex items-center gap-10">
              <div className="hidden xl:flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-2.5 w-[350px] focus-within:border-green/50 transition-all">
                 <span className="material-icons-outlined text-soft-grey text-sm">search</span>
                 <input type="text" placeholder="Scan system logs / audit records..." className="bg-transparent border-none focus:outline-none text-xs w-full placeholder:text-soft-grey/40 font-medium" />
              </div>

              <div className="flex items-center gap-6">
                 <button className="relative w-11 h-11 flex items-center justify-center text-soft-grey hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5">
                    <span className="material-icons-outlined text-xl">notifications</span>
                    <span className="absolute top-3 right-3 w-2 h-2 bg-green rounded-full border-2 border-[#0B1225]"></span>
                 </button>

                 <div className="h-10 w-px bg-white/10 mx-2 hidden md:block"></div>

                 <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                       <p className="text-xs font-black italic text-white">{user?.name || 'ADMIN'}</p>
                       <p className="text-[8px] font-black text-green uppercase tracking-[0.2em] mt-0.5">Master Authority</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl border-2 border-white/10 p-1 relative shadow-2xl">
                       <img 
                         src={user?.avatar_url?.startsWith('/') 
                           ? `${api.defaults.baseURL}${user.avatar_url}` 
                           : user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=16C66E&color=fff`
                         } 
                         className="w-full h-full rounded-xl object-cover" 
                         alt="Avatar" 
                       />
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green rounded-full border-2 border-[#0B1225] shadow-xl"></div>
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Admin Content Area - Optimized Padding */}
        <main className="flex-1 overflow-y-auto bg-[#0B1225]">
           <div className="max-w-[1400px] mx-auto p-12 md:p-16 lg:p-20 space-y-16 pb-40">
              {children}
           </div>

           {/* Admin Footer */}
           <footer className="max-w-[1400px] mx-auto px-12 md:px-16 lg:px-20 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest">Gencom Oversight Module v4.2.1</p>
              <p className="text-[10px] font-medium text-soft-grey">Restricted Internal Environment • Access Logged</p>
           </footer>
        </main>
      </div>

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
