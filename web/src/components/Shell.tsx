'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';
import api from '@/lib/api';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading, branding } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { activity, unreadCount, markAsRead, deleteActivity, clearAllActivity } = useNotification();
  const [ensuredWallet, setEnsuredWallet] = useState(false);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [activeMerchant, setActiveMerchant] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Collapsible Sidebar state

  const ensureWallet = async () => {
    if (ensuredWallet) return;
    try {
      const { data: wallets } = await api.get('/wallets');
      if (wallets.length === 0) {
        await api.post('/wallets', { currency: 'USD' });
      }
      setEnsuredWallet(true);
    } catch (err) {
      console.error('Failed to ensure default wallet', err);
    }
  };

  React.useEffect(() => {
    if (user && !ensuredWallet) {
      ensureWallet();
      fetchMerchants();
    }
  }, [user, ensuredWallet]);

  const fetchMerchants = async () => {
    try {
      const { data } = await api.get('/merchant/my-businesses');
      setMerchants(data);
      
      const storedId = localStorage.getItem('activeMerchantId');
      if (storedId) {
        const active = data.find((m: any) => m.id === storedId);
        if (active) setActiveMerchant(active);
      } else if (data.length > 0) {
        setActiveMerchant(data[0]);
        localStorage.setItem('activeMerchantId', data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch merchants', err);
    }
  };

  React.useEffect(() => {
    if (!user && !loading && pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
      router.push('/login');
    }
    
    // Redirect to merchant select if trying to access merchant portal without active selection
    // But check localStorage first to prevent loop during initial fetch
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('activeMerchantId') : null;
    if (user && pathname.startsWith('/merchant') && pathname !== '/merchant/select' && pathname !== '/merchant/register' && !activeMerchant && !storedId) {
      router.push('/merchant/select');
    }
  }, [user, loading, pathname, router, activeMerchant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1225] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  // If on a public page, or not loading and no user, we either render children or the redirect useEffect will handle it
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return <>{children}</>; 
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1225] flex flex-col items-center justify-center gap-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
        <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.4em]">Securing Connection...</p>
      </div>
    );
  }

  const isVerified = user.status === 'VERIFIED' || user.status === 'ACTIVE';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1225] text-white selection:bg-green/30 font-sans">
      
      {/* Desktop Sidebar - Robust Web App Style */}
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-24' : 'w-80'} bg-[#0F3D3A]/10 backdrop-blur-3xl border-r border-white/5 flex-col sticky top-0 z-[100] shadow-2xl transition-all duration-300 ease-in-out`}>
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} border-b border-white/5 relative group`}>
           {isCollapsed ? (
             <div className="shrink-0 w-10 h-10 animate-in fade-in zoom-in duration-300">
                {branding?.LOGO_SQUARE ? (
                  <img src={`${api.defaults.baseURL}${branding.LOGO_SQUARE}`} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <div className="w-full h-full bg-gradient-signature rounded-xl flex items-center justify-center shadow-2xl shadow-green/20">
                    <span className="material-icons-outlined text-white text-xl">shield</span>
                  </div>
                )}
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
                {branding?.LOGO_LANDSCAPE ? (
                  <img src={`${api.defaults.baseURL}${branding.LOGO_LANDSCAPE}`} className="h-10 object-contain" alt={branding?.APP_NAME || 'Generex'} />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-signature rounded-lg flex items-center justify-center">
                      <span className="material-icons-outlined text-white text-sm">shield</span>
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tighter leading-none">{branding?.APP_NAME || 'Generex'}</h1>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group/wallet" onClick={() => {
                  navigator.clipboard.writeText(user?.id || '');
                  showNotification('Account ID copied to clipboard!', 'success');
                }}>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]">ACCOUNT ID: {user?.id?.slice(0, 8).toUpperCase()}</p>
                  <span className="material-icons-outlined text-[10px] group-hover/wallet:scale-125 transition-transform">content_copy</span>
                </div>
             </div>
           )}
           
           {/* Collapse Toggle */}
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-green text-navy rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50`}
           >
              <span className="material-icons-outlined text-sm">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide space-y-8">
           <nav className="space-y-1">
              {!isCollapsed && <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4 mb-4 animate-in fade-in duration-300">Core Platform</p>}
              <SidebarLink icon="grid_view" label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} collapsed={isCollapsed} />
              <SidebarLink icon="swap_horiz" label="Transfers" href="/transfers" active={pathname === '/transfers'} collapsed={isCollapsed} />
              <SidebarLink icon="verified_user" label="Escrow Bridge" href="/escrow" active={pathname === '/escrow'} collapsed={isCollapsed} />
              <SidebarLink icon="currency_exchange" label="Exchange" href="/exchange" active={pathname === '/exchange'} collapsed={isCollapsed} />
           </nav>

           <nav className="space-y-1">
              {!isCollapsed && <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4 mb-4 animate-in fade-in duration-300">Financial Tools</p>}
              <SidebarLink icon="account_balance_wallet" label="Deposit Assets" href="/deposit" active={pathname === '/deposit'} collapsed={isCollapsed} />
              <SidebarLink icon="credit_card" label="Virtual Cards" href="/cards" active={pathname === '/cards'} collapsed={isCollapsed} />
              <SidebarLink icon="payments" label="Pay Bills" href="/pay-bills" active={pathname === '/pay-bills'} collapsed={isCollapsed} />
           </nav>

            {(merchants.length > 0 || pathname.startsWith('/merchant')) && (
              <nav className="space-y-1">
                 {!isCollapsed && (
                    <div className="flex justify-between items-center px-4 mb-4 animate-in fade-in duration-300">
                       <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">Business & Developer</p>
                       <Link href="/merchant/select" className="text-[8px] font-black text-green hover:underline uppercase tracking-widest">Switch</Link>
                    </div>
                 )}
                 {activeMerchant && pathname.startsWith('/merchant') && !isCollapsed && (
                   <div className="mx-2 mb-6 p-4 bg-green/5 border border-green/10 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-green/20">
                          <img 
                            src={activeMerchant.logo_url?.startsWith('/') 
                              ? `${api.defaults.baseURL}${activeMerchant.logo_url}` 
                              : activeMerchant.logo_url || `https://ui-avatars.com/api/?name=${activeMerchant.business_name}&background=16C66E&color=fff`
                            } 
                            className="w-full h-full object-cover" 
                          />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[9px] font-black text-white truncate italic">{activeMerchant.business_name}</p>
                         <p className={`text-[7px] font-black uppercase tracking-widest ${activeMerchant.userRole === 'OWNER' ? 'text-green' : 'text-blue'}`}>{activeMerchant.userRole}</p>
                      </div>
                   </div>
                 )}
                 <SidebarLink icon="storefront" label="Merchant Portal" href="/merchant" active={pathname === '/merchant'} collapsed={isCollapsed} />
                 <SidebarLink icon="analytics" label="Business Analytics" href="/merchant/analytics" active={pathname === '/merchant/analytics'} collapsed={isCollapsed} />
                 <SidebarLink icon="point_of_sale" label="Terminals" href="/merchant/terminals" active={pathname === '/merchant/terminals'} collapsed={isCollapsed} />
                 <SidebarLink icon="receipt_long" label="Settlements" href="/merchant/settlements" active={pathname === '/merchant/settlements'} collapsed={isCollapsed} />
                 <SidebarLink icon="groups" label="Merchant Teams" href="/merchant/team" active={pathname === '/merchant/team'} collapsed={isCollapsed} />
                 <SidebarLink icon="code" label="API Documentation" href="/docs/api" active={pathname === '/docs/api'} collapsed={isCollapsed} />
              </nav>
            )}
           
           {isAdmin && (
             <nav className="pt-6 border-t border-white/5 space-y-1">
                {!isCollapsed && <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-4 mb-4 animate-in fade-in duration-300">Oversight</p>}
                <SidebarLink icon="admin_panel_settings" label="Admin Portal" href="/admin" active={pathname === '/admin'} collapsed={isCollapsed} />
             </nav>
           )}
        </div>

        <div className="p-6 border-t border-white/5 space-y-4">
           <Link href="/settings" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} text-soft-grey hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] group`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <span className="material-icons-outlined text-lg">settings</span>
              </div>
              {!isCollapsed && <span>Settings</span>}
           </Link>
           <button onClick={logout} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} text-soft-grey hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-[0.2em] group w-full text-left`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-400/10 transition-colors">
                <span className="material-icons-outlined text-lg">logout</span>
              </div>
              {!isCollapsed && <span>Sign Out</span>}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Web App Top Header - Persistent & Functional */}
        <header className="h-24 bg-[#0B1225]/80 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-[90]">
           <div className="flex items-center gap-10">
              {/* Mobile Menu Trigger (Mobile only) */}
              <button className="lg:hidden text-white">
                 <span className="material-icons-outlined">menu</span>
              </button>

              {/* Page Identity */}
              <div className="hidden md:block space-y-1">
                 <h2 className="text-xl font-black italic tracking-tighter text-white">
                    {pathname === '/dashboard' ? 'Portfolio Overview' : pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1)}
                 </h2>
                 <p className="text-[9px] font-black text-soft-grey uppercase tracking-[0.3em]">Generex Financial Network v3.2</p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              {/* Global Search */}
              <div className="hidden xl:flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-2.5 w-[400px] focus-within:border-green/50 focus-within:bg-white/10 transition-all">
                 <span className="material-icons-outlined text-soft-grey text-sm">search</span>
                 <input type="text" placeholder="Search accounts, IDs, or assets..." className="bg-transparent border-none focus:outline-none text-xs w-full placeholder:text-soft-grey/40 font-medium" />
                 <span className="text-[9px] font-black text-soft-grey bg-white/5 px-2 py-1 rounded-md border border-white/10">⌘K</span>
              </div>

              <div className="flex items-center gap-4">
                  {/* Quick Actions / Notifications */}
                  <div className="relative">
                     <button 
                       onClick={() => setShowNotifications(!showNotifications)}
                       className="w-11 h-11 flex items-center justify-center text-soft-grey hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5 group relative"
                     >
                        <span className="material-icons-outlined text-xl">notifications</span>
                        {unreadCount > 0 && (
                          <span className="absolute top-3 right-3 w-2 h-2 bg-green rounded-full border-2 border-[#0B1225] animate-pulse"></span>
                        )}
                     </button>

                     {showNotifications && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                          <div className="absolute right-0 mt-4 w-[400px] bg-navy/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-2xl z-50 animate-in zoom-in-95 slide-in-from-top-2 flex flex-col max-h-[600px]">
                             <div className="flex justify-between items-center mb-8 px-2">
                                <h3 className="text-xl font-black italic">Recent Activity</h3>
                                <button onClick={clearAllActivity} className="text-[10px] font-black text-soft-grey hover:text-white uppercase tracking-widest transition-colors">Clear All</button>
                             </div>

                             <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                                {activity.length === 0 ? (
                                   <div className="py-12 text-center space-y-4 opacity-40">
                                      <span className="material-icons-outlined text-4xl">notifications_none</span>
                                      <p className="text-[10px] font-black uppercase tracking-widest">No new alerts</p>
                                   </div>
                                ) : (
                                   activity.map((a) => (
                                      <div 
                                        key={a.id} 
                                        onClick={() => {
                                          markAsRead(a.id);
                                          if (a.action_url) router.push(a.action_url);
                                          setShowNotifications(false);
                                        }}
                                        className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${
                                          a.is_read ? 'bg-white/5 border-transparent hover:bg-white/10' : 'bg-green/5 border-green/20 hover:bg-green/10'
                                        }`}
                                      >
                                         <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{a.title}</p>
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteActivity(a.id);
                                              }}
                                              className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
                                            >
                                               <span className="material-icons-outlined text-xs">close</span>
                                            </button>
                                         </div>
                                         <p className="text-xs font-bold text-white pr-4 leading-relaxed">{a.message}</p>
                                         <p className="text-[8px] font-black uppercase text-soft-grey mt-4 opacity-40">{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                         {!a.is_read && <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-green rounded-full shadow-lg shadow-green/20"></div>}
                                      </div>
                                   ))
                                )}
                             </div>

                             <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                                <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest opacity-40 italic">End of Activity Log</p>
                             </div>
                          </div>
                        </>
                     )}
                  </div>

                 <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                 {/* Profile Section */}
                 <div className="relative">
                    <button 
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-4 hover:bg-white/5 p-1.5 rounded-2xl transition-all border border-transparent hover:border-white/10"
                    >
                       <div className="text-right hidden md:block">
                          <p className="text-xs font-black italic">{user?.name}</p>
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                             <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-green' : 'bg-gold'}`}></span>
                             <p className={`text-[8px] font-black uppercase tracking-widest ${isVerified ? 'text-green' : 'text-gold'}`}>{isVerified ? 'Verified' : 'Action Required'}</p>
                          </div>
                       </div>
                       <div className="w-11 h-11 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl relative">
                          <img 
                             src={user?.avatar_url?.startsWith('/') 
                               ? `${api.defaults.baseURL}${user.avatar_url}` 
                               : user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=16C66E&color=fff`
                             } 
                            className="w-full h-full object-cover" 
                            alt="Avatar" 
                          />
                          {!isVerified && (
                             <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                                <span className="material-icons-outlined text-white text-xs">priority_high</span>
                             </div>
                          )}
                       </div>
                    </button>

                    {showDropdown && (
                       <>
                         <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                         <div className="absolute right-0 mt-4 w-80 bg-navy/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-2xl z-50 animate-in zoom-in-95 slide-in-from-top-2">
                             <div className="flex flex-col gap-5 p-6 bg-white/5 rounded-[2.5rem] mb-8 border border-white/5">
                                <div className="flex items-center gap-5">
                                   <div className="w-14 h-14 rounded-[1.2rem] border-2 border-green/30 p-1 shrink-0">
                                       <img 
                                         src={user?.avatar_url?.startsWith('/') 
                                           ? `${api.defaults.baseURL}${user.avatar_url}` 
                                           : user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=16C66E&color=fff`
                                         } 
                                         className="w-full h-full rounded-[1rem] object-cover" 
                                         alt="Avatar" 
                                       />
                                   </div>
                                   <p className="text-sm font-black italic text-white truncate">{user?.name}</p>
                                </div>
                                <div className="px-2 pt-2 border-t border-white/5">
                                   <p className="text-[9px] text-soft-grey uppercase tracking-widest break-all font-bold">{user?.email}</p>
                                </div>
                             </div>
                            <div className="space-y-1">
                                <DropdownItem icon="person" label="Profile" onClick={() => {router.push('/profile'); setShowDropdown(false);}} />
                               <DropdownItem icon="security" label="Security" onClick={() => {router.push('/settings'); setShowDropdown(false);}} />
                               <DropdownItem icon="account_balance" label="Billing" onClick={() => {router.push('/settings'); setShowDropdown(false);}} />
                               {isAdmin && <DropdownItem icon="admin_panel_settings" label="Admin Oversight" onClick={() => {router.push('/admin'); setShowDropdown(false);}} />}
                               <div className="h-px bg-white/5 my-6 mx-4"></div>
                               <DropdownItem icon="logout" label="Sign Out" color="text-red-400" onClick={logout} />
                            </div>
                         </div>
                       </>
                    )}
                 </div>
              </div>
           </div>
        </header>

        {/* Global Action Banner (e.g. KYC) */}
        {!isVerified && (
           <div className="bg-gradient-to-r from-orange-400/20 to-orange-400/5 border-b border-orange-400/20 px-10 py-4 flex justify-between items-center z-50 animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-orange-400/10 rounded-xl flex items-center justify-center border border-orange-400/20">
                    <span className="material-icons-outlined text-orange-400">gpp_maybe</span>
                 </div>
                 <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest leading-none">KYC COMPLIANCE REQUIRED</p>
                    <p className="text-[10px] text-soft-grey mt-1">Unlock your full transactional potential and daily off-ramp limits.</p>
                 </div>
              </div>
              <button onClick={() => router.push('/kyc')} className="bg-orange-400 text-navy text-[10px] font-black px-6 py-3 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all">START VERIFICATION</button>
           </div>
        )}

        {/* Main Content Area - Refined Padding & Layout */}
        <main className="flex-1 overflow-y-auto bg-[#0B1225] relative">
           <div className="max-w-[1400px] mx-auto p-10 md:p-16 lg:p-20 space-y-20 pb-40">
              {children}
           </div>

           {/* Web App Dashboard Footer */}
           <footer className="max-w-[1400px] mx-auto px-10 md:px-16 lg:px-20 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-[10px] font-black italic">G</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Gencom Pay Dashboard v3.2.0</p>
              </div>
              <p className="text-[10px] font-medium text-soft-grey">© 2026 Gencom Exchange Platform. All Rights Reserved.</p>
              <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-soft-grey">
                 <Link href="/docs" className="hover:text-green transition-colors">Documentation</Link>
                 <Link href="/support" className="hover:text-green transition-colors">Support</Link>
                 <Link href="/privacy" className="hover:text-green transition-colors">Compliance</Link>
              </div>
           </footer>
        </main>

        {/* Mobile Bottom Nav (Visible only on mobile) */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-navy/90 backdrop-blur-3xl border border-white/10 rounded-3xl flex items-center justify-around px-6 z-[100] shadow-2xl">
           <MobileNavItem icon="grid_view" label="Home" active={pathname === '/dashboard'} onClick={() => router.push('/dashboard')} />
           <MobileNavItem icon="swap_horiz" label="Transfer" active={pathname === '/transfers'} onClick={() => router.push('/transfers')} />
           <MobileNavItem icon="verified_user" label="Escrow" active={pathname === '/escrow'} onClick={() => router.push('/escrow')} />
           <MobileNavItem icon="currency_exchange" label="Exchange" active={pathname === '/exchange'} onClick={() => router.push('/exchange')} />
        </nav>
      </div>

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}

function SidebarLink({ icon, label, href, active, collapsed }: any) {
  return (
    <Link 
      href={href}
      title={collapsed ? label : ''}
      className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4 px-4'} py-3.5 rounded-2xl transition-all group relative ${
        active ? 'bg-white/10 text-white shadow-2xl border border-white/5' : 'text-soft-grey hover:bg-white/5 hover:text-white'
      }`}
    >
      {active && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${collapsed ? 'w-1 h-6' : 'w-1.5 h-8'} bg-green rounded-r-full shadow-[0_0_15px_rgba(22,198,110,0.6)]`}></div>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-green/10 text-green' : 'group-hover:bg-white/10'}`}>
         <span className={`material-icons-outlined text-lg ${active ? 'text-green' : 'group-hover:scale-110 transition-transform'}`}>{icon}</span>
      </div>
      {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.25em] animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>}
    </Link>
  );
}

function DropdownItem({ icon, label, onClick, color = 'text-soft-grey' }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all group ${color} hover:text-white`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        <span className="material-icons-outlined text-sm">{icon}</span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-green scale-110' : 'text-soft-grey'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-green/10' : ''}`}>
         <span className="material-icons-outlined text-2xl">{icon}</span>
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
