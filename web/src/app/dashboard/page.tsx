'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';
import PayMerchantModal from '@/components/PayMerchantModal';
import ReceiptModal from '@/components/ReceiptModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [frequentRecipients, setFrequentRecipients] = useState<any[]>([]);
  const [showQuickTransfer, setShowQuickTransfer] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isVerified, setIsVerified] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const EXCHANGE_RATES: Record<string, number> = {
    'USD': 1.0,
    'KSH': 0.00745, // 1/134.20
    'SLS': 0.0000833, // 1/12000
    'BTC': 64231.0,
    'ETH': 2450.12,
    'EUR': 1.08,
    'GBP': 1.25
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Wallet ID copied to clipboard!', 'success');
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchFrequentRecipients();
      fetchMerchantData();
    }
  }, [user]);

  const fetchMerchantData = async () => {
    try {
      const res = await api.get('/merchant/my-businesses');
      setMerchants(res.data);
    } catch (err) {
      console.error('Failed to fetch merchant data', err);
    }
  };

  const fetchFrequentRecipients = async () => {
    try {
      const res = await api.get('/transactions/frequent-recipients');
      setFrequentRecipients(res.data);
    } catch (err) {
      console.error('Failed to fetch frequent recipients', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const walletsRes = await api.get('/wallets');
      const walletsData = walletsRes.data;
      setWallets(walletsData);
      
      // Calculate consolidated total in USD
      const totalInUSD = walletsData.reduce((acc: number, w: any) => {
        const balance = parseFloat(w.balance || '0');
        const rate = EXCHANGE_RATES[w.currency] || 1.0;
        return acc + (balance * rate);
      }, 0);
      
      setTotalBalance(totalInUSD.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));

      if (walletsData.length > 0) {
        const txRes = await api.get(`/transactions/wallet/${walletsData[0].id}`);
        setTransactions(txRes.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  const handleQuickTransfer = async () => {
    if (!transferAmount || !selectedRecipient || wallets.length === 0) return;
    setIsSending(true);
    try {
      await api.post('/wallets/transfer', {
        fromWalletId: wallets[0].id, // Default to primary wallet
        toWalletId: selectedRecipient.wallet_id,
        amount: transferAmount,
        description: `Quick Transfer to ${selectedRecipient.name}`,
      });
      showNotification(`Successfully sent $${transferAmount} to ${selectedRecipient.name}`, 'success');
      setShowQuickTransfer(false);
      setTransferAmount('');
      fetchDashboardData();
      fetchFrequentRecipients();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Transfer failed', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const createWallet = async (currency: string = 'USD') => {
    try {
      await api.post('/wallets', { currency });
      fetchDashboardData();
      showNotification(`${currency} Account created!`, 'success');
    } catch (err) {
      showNotification('Failed to create account', 'error');
      console.error('Failed to create account', err);
    }
  };

  return (
    <Shell>
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Merchant CTA / Onboarding */}
        {merchants.length === 0 && (
          <section className="bg-gradient-to-r from-green/10 via-blue/5 to-transparent border border-white/10 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-green/10 transition-all"></div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                   <div className="inline-flex items-center gap-3 px-4 py-2 bg-green/10 border border-green/20 rounded-full">
                      <span className="w-2 h-2 bg-green rounded-full animate-pulse"></span>
                      <p className="text-[9px] font-black text-green uppercase tracking-widest">Expansion Opportunity</p>
                   </div>
                   <h2 className="text-4xl font-black italic tracking-tighter text-white leading-tight">Start Accepting Payments with Gencom Pay</h2>
                   <p className="text-soft-grey text-sm font-medium leading-relaxed max-w-md">Unlock specialized merchant accounts, virtual terminals, and real-time settlement protocols. Join thousands of businesses in the Generex ecosystem.</p>
                   <Link href="/merchant/register" className="inline-flex items-center gap-4 bg-green text-navy font-black italic text-xs px-10 py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                      Initialize Merchant Node
                      <span className="material-icons-outlined text-sm">rocket_launch</span>
                   </Link>
                </div>
                <div className="hidden lg:grid grid-cols-2 gap-6 opacity-40 group-hover:opacity-100 transition-all duration-700">
                   <div className="space-y-6">
                      <div className="h-32 bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between">
                         <span className="material-icons-outlined text-green">point_of_sale</span>
                         <p className="text-[8px] font-black uppercase tracking-widest">Virtual POS</p>
                      </div>
                      <div className="h-32 bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between">
                         <span className="material-icons-outlined text-blue">analytics</span>
                         <p className="text-[8px] font-black uppercase tracking-widest">Advanced Analytics</p>
                      </div>
                   </div>
                   <div className="space-y-6 mt-12">
                      <div className="h-32 bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between">
                         <span className="material-icons-outlined text-gold">qr_code_2</span>
                         <p className="text-[8px] font-black uppercase tracking-widest">Dynamic QR IDs</p>
                      </div>
                      <div className="h-32 bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between">
                         <span className="material-icons-outlined text-green">groups</span>
                         <p className="text-[8px] font-black uppercase tracking-widest">Team Management</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        )}

        {/* Top Section: Balance & Primary Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <section className="lg:col-span-8 bg-gradient-dashboard rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
              
              <div className="relative z-10 space-y-12">
                 {/* Balance Header */}
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Total Consolidated Balance (USD)</p>
                       <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
                          <span className="text-[8px] font-black text-green uppercase tracking-widest">Live Valuation</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-6xl xl:text-9xl font-black text-white tracking-tighter italic leading-none">${totalBalance}</h2>
                       <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20 shadow-xl w-fit">
                          <span className="material-icons-outlined text-green text-sm">trending_up</span>
                          <span className="text-xs font-black text-green tracking-widest">+4.28%</span>
                       </div>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                       Secure network verification active <br className="hidden xl:block" />
                       Instant transfers enabled.
                    </p>
                 </div>

                 {/* Shortcut Action Cards */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ActionButton onClick={() => router.push('/deposit')} icon="add" label="Deposit" primary />
                    <ActionButton onClick={() => router.push('/transfers')} icon="send" label="Send" disabled={!isVerified} />
                    <ActionButton onClick={() => router.push('/exchange')} icon="currency_exchange" label="Convert" disabled={!isVerified} />
                    <ActionButton onClick={() => router.push('/cards')} icon="credit_card" label="Cards" disabled={!isVerified} />
                 </div>
              </div>
           </section>

           <section className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[4rem] p-12 flex flex-col justify-between shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-10">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black italic">Secure Payments</h3>
                    <span className="material-icons-outlined text-gold">verified_user</span>
                 </div>
                 <div className="p-8 bg-navy/60 border border-white/5 rounded-[2.5rem] space-y-6">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Active Holds</span>
                       <span className="text-3xl font-black text-white italic">02</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="w-1/2 h-full bg-gold shadow-[0_0_15px_rgba(255,193,7,0.4)]"></div>
                    </div>
                    <p className="text-[9px] font-black text-soft-grey uppercase tracking-[0.2em]">Cross-border settlement active</p>
                 </div>
                 <button onClick={() => router.push('/escrow')} className="w-full py-5 text-[10px] font-black text-green border border-green/20 rounded-2xl hover:bg-green/10 transition-all uppercase tracking-[0.3em] shadow-xl">
                    Manage Secure Payments
                 </button>
              </div>
           </section>
        </div>

        {/* Middle Section: Assets & Quick Transfer & Market */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Assets Column */}
           <section className="lg:col-span-12 space-y-10">
              <div className="flex justify-between items-center px-8">
                 <h3 className="text-3xl font-black italic tracking-tighter">My Liquid Assets</h3>
                 <div className="flex gap-6">
                    <button 
                      onClick={() => setShowPayModal(true)}
                      className="text-[10px] font-black text-green uppercase tracking-widest bg-green/5 border border-green/20 px-6 py-3 rounded-xl hover:bg-green/10 transition-all shadow-lg"
                    >
                      Pay Merchant
                    </button>
                    <button className="text-[10px] font-black text-soft-grey uppercase tracking-widest hover:text-white transition-colors">Global Market</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                 {wallets.length > 0 ? (
                   wallets.map(w => (
                     <WalletCard 
                       key={w.id} 
                       wallet={w}
                       onClick={() => {}}
                       onCopy={() => copyToClipboard(w.id)}
                       showId={false}
                     />
                   ))
                 ) : (
                   <div className="col-span-full bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center space-y-6">
                     <span className="material-icons-outlined text-6xl text-soft-grey opacity-20">account_balance_wallet</span>
                     <p className="text-sm text-soft-grey uppercase tracking-[0.4em] font-black">No Active Accounts Detected</p>
                     <button onClick={() => createWallet('USD')} className="btn-primary">Initialize Primary USD Account</button>
                   </div>
                 )}
                 
                 {/* Open New Account CTA */}
                 <button 
                   onClick={() => createWallet('SLS')}
                   className="group border-2 border-dashed border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 hover:border-green/20 hover:bg-green/5 transition-all opacity-40 hover:opacity-100"
                 >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green group-hover:text-navy transition-all">
                       <span className="material-icons-outlined text-3xl">add</span>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest">Open SLS Account</p>
                       <p className="text-[9px] text-soft-grey mt-2 font-medium">Somaliland Shilling Settlement</p>
                    </div>
                 </button>
              </div>
           </section>

           {/* Quick Transfer Column */}
           <section className="lg:col-span-12 space-y-8">
              <div className="flex justify-between items-center px-8">
                 <h3 className="text-3xl font-black italic tracking-tighter">Fast Execution</h3>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 flex flex-col lg:flex-row gap-12 shadow-2xl">
                 <div className="lg:w-1/2 flex items-center gap-8 overflow-x-auto pb-4 scrollbar-hide">
                    <button onClick={() => router.push('/transfers')} className="flex flex-col items-center gap-4 group shrink-0">
                       <div className="w-20 h-20 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-green group-hover:bg-green/5 transition-all shadow-xl">
                          <span className="material-icons-outlined text-soft-grey group-hover:text-green text-3xl">add</span>
                       </div>
                       <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">New Recipient</span>
                    </button>
                    {frequentRecipients.map((r) => (
                      <button 
                        key={r.wallet_id} 
                        onClick={() => {
                          setSelectedRecipient(r);
                          setShowQuickTransfer(true);
                        }}
                        className="flex flex-col items-center gap-4 group shrink-0"
                      >
                         <div className="w-20 h-20 rounded-[2rem] border-2 border-white/10 p-1 group-hover:border-green transition-all overflow-hidden shadow-2xl">
                            <img 
                              src={r.avatar_url || `https://ui-avatars.com/api/?name=${r.name}&background=16C66E&color=fff`} 
                              className="w-full h-full rounded-[1.6rem] object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-100" 
                              alt={r.name} 
                            />
                         </div>
                         <span className="text-[11px] font-black text-soft-grey uppercase tracking-widest group-hover:text-white">{r.name.split(' ')[0]}</span>
                      </button>
                    ))}
                 </div>

                 <div className="space-y-6">
                    <div className="bg-navy/60 border border-white/10 rounded-3xl p-8 flex justify-between items-center shadow-inner">
                       <span className="text-[11px] font-black text-soft-grey uppercase tracking-[0.2em]">Transfer Volume</span>
                       <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-white/20 italic">$</span>
                          <input type="text" placeholder="0.00" className="bg-transparent text-right text-4xl font-black text-white focus:outline-none w-48 italic tracking-tighter" />
                       </div>
                    </div>
                     <button onClick={() => router.push('/transfers')} className="btn-primary w-full py-7 text-sm shadow-2xl">Send Funds Now</button>
                 </div>
              </div>
           </section>

         </div>

        {/* Quick Transfer Modal */}
        {showQuickTransfer && selectedRecipient && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
             <div className="absolute inset-0 bg-navy/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setShowQuickTransfer(false)}></div>
             <div className="relative bg-[#0B1225] border border-white/10 w-full max-w-xl rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                
                {/* Close Button */}
                <button 
                  onClick={() => setShowQuickTransfer(false)}
                  className="absolute top-8 right-8 text-soft-grey hover:text-white transition-colors"
                >
                   <span className="material-icons-outlined">close</span>
                </button>

                <div className="text-center space-y-4">
                   <div className="w-24 h-24 rounded-[2rem] border-4 border-white/5 p-1 mx-auto overflow-hidden shadow-2xl relative group">
                      <img 
                        src={selectedRecipient.avatar_url?.startsWith('/') ? `${api.defaults.baseURL}${selectedRecipient.avatar_url}` : selectedRecipient.avatar_url || `https://ui-avatars.com/api/?name=${selectedRecipient.name}&background=16C66E&color=fff`} 
                        className="w-full h-full rounded-[1.8rem] object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={selectedRecipient.name} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-green uppercase tracking-[0.4em]">Protocol Authorization</p>
                      <h2 className="text-3xl font-black italic text-white tracking-tighter">{selectedRecipient.name}</h2>
                      <p className="text-[9px] font-mono text-soft-grey tracking-widest opacity-30">{selectedRecipient.wallet_id}</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-navy/40 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center gap-2 shadow-inner">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Execution Amount</p>
                      <div className="flex items-center gap-3">
                         <span className="text-4xl font-black italic text-green tracking-tighter">$</span>
                         <input 
                           type="number" 
                           autoFocus
                           value={transferAmount}
                           onChange={(e) => setTransferAmount(e.target.value)}
                           className="bg-transparent text-center text-6xl font-black text-white focus:outline-none w-full italic tracking-tighter placeholder:text-white/5" 
                           placeholder="0.00"
                         />
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <button 
                        onClick={() => setShowQuickTransfer(false)} 
                        className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-soft-grey hover:bg-white/10 transition-all"
                      >
                        Abort
                      </button>
                      <button 
                        onClick={handleQuickTransfer}
                        disabled={isSending || !transferAmount || parseFloat(transferAmount) <= 0}
                        className="flex-1 py-5 bg-green text-navy rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-navy"></div>
                        ) : (
                          <>
                             <span className="material-icons-outlined text-sm">bolt</span>
                             Execute Now
                          </>
                        )}
                      </button>
                   </div>
                </div>

                <div className="flex items-center justify-center gap-3 opacity-30">
                   <div className="h-px w-8 bg-white/20"></div>
                   <p className="text-[8px] font-black text-white uppercase tracking-[0.3em]">Institutional Grade Settlement</p>
                   <div className="h-px w-8 bg-white/20"></div>
                </div>
             </div>
          </div>
        )}

        <section className="space-y-10">
           <div className="flex justify-between items-center px-8">
               <h3 className="text-3xl font-black italic tracking-tighter">Recent Activity</h3>
              <div className="flex gap-6">
                 <button className="text-[11px] font-black text-soft-grey uppercase tracking-widest hover:text-white transition-colors">Export .CSV</button>
                 <span className="text-white/10">|</span>
                 <button className="text-[11px] font-black text-green uppercase tracking-widest hover:underline">Full Transaction History</button>
              </div>
           </div>
           
           <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 overflow-x-auto shadow-2xl transition-all">
              <table className="w-full text-left min-w-[800px]">
                 <thead>
                     <tr className="text-[11px] font-black text-soft-grey uppercase tracking-[0.4em] border-b border-white/5 pb-10">
                        <th className="pb-10 pl-6 italic">Payment Details</th>
                        <th className="pb-10 italic">Type</th>
                        <th className="pb-10 italic">Timestamp</th>
                        <th className="pb-10 italic">Amount</th>
                        <th className="pb-10 text-right pr-6 italic">Status</th>
                     </tr>
                 </thead>
                 <tbody className="text-sm">
                    {transactions.length > 0 ? (
                      transactions.map(tx => (
                        <TransactionRow 
                          key={tx.id} 
                          icon={tx.entry_type === 'CREDIT' ? 'account_balance' : 'send'} 
                          name={tx.transaction?.description || (tx.entry_type === 'CREDIT' ? 'Funds Received' : 'Funds Sent')} 
                          category={tx.transaction?.description?.includes('Deposit') ? 'DEPOSIT' : 'TRANSFER'} 
                          time={new Date(tx.created_at).toLocaleString()} 
                          amount={`${tx.entry_type === 'CREDIT' ? '+' : '-'}$${parseFloat(tx.amount).toFixed(2)}`} 
                          status="COMPLETED" 
                          color={tx.entry_type === 'CREDIT' ? 'green' : 'blue'} 
                          onClick={() => {
                            setSelectedTx(tx);
                            setShowReceipt(true);
                          }}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-soft-grey uppercase tracking-widest font-black text-xs">
                          No recent activity recorded
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </section>
      </div>

      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        transaction={selectedTx} 
      />

      <PayMerchantModal 
        isOpen={showPayModal} 
        onClose={() => setShowPayModal(false)} 
        wallets={wallets}
        onPaymentSuccess={fetchDashboardData}
      />
    </Shell>
  );
}

function ActionButton({ icon, label, onClick, primary = false, disabled = false }: any) {
  return (
    <button 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-4 py-8 rounded-[2.5rem] transition-all relative overflow-hidden ${
        disabled 
          ? 'bg-navy/40 text-soft-grey/40 border-white/5 cursor-not-allowed' 
          : 'hover:scale-[1.05] active:scale-95 shadow-2xl border group'
      } ${
        !disabled && primary 
          ? 'bg-gradient-signature text-white border-green/20 shadow-green/10' 
          : !disabled ? 'bg-navy/60 text-white border-white/10 hover:bg-white/10 shadow-black/40 backdrop-blur-xl' : ''
      }`}
    >
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-all ${
         disabled ? 'bg-white/5' : primary ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
       }`}>
          <span className={`material-icons-outlined text-2xl ${!disabled && 'group-hover:rotate-12 transition-transform'}`}>{icon}</span>
       </div>
       <span className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</span>
       
       {!disabled && (
         <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
           primary ? 'bg-gradient-to-br from-white/10 to-transparent' : 'bg-gradient-to-br from-green/5 to-transparent'
         }`}></div>
       )}

       {disabled && (
          <div className="absolute top-4 right-4">
             <span className="material-icons-outlined text-[10px] text-gold opacity-40">lock</span>
          </div>
       )}
    </button>
  );
}

function WalletCard({ wallet, onClick, onCopy, showId = true }: any) {
  const isUSD = wallet.currency === 'USD';
  const isKSH = wallet.currency === 'KSH';
  const isSLS = wallet.currency === 'SLS';
  const isBTC = wallet.currency === 'BTC';
  const fullName = wallet.user?.full_name || 'Asset Node';
  const watermark = isUSD ? '$' : isKSH ? 'KSh' : isSLS ? 'SLS' : '₿';

  return (
    <div 
      onClick={onClick}
      className={`relative aspect-[1.6/1] rounded-[2.5rem] glass-financial overflow-hidden p-10 flex flex-col justify-between group hover:scale-[1.02] transition-all cursor-pointer card-glow-${isUSD || isBTC ? 'green' : 'blue'}`}
    >
       <div className="card-shine"></div>
       <div className={`absolute top-0 right-0 w-[300px] h-[300px] ${isUSD || isBTC ? 'bg-green/10' : 'bg-blue/10'} rounded-full blur-[80px] -mr-32 -mt-32 opacity-30`}></div>
       <div className="watermark-text">{watermark}</div>
       
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
          <h3 className="text-6xl font-black italic tracking-tighter">GENCOM PAY</h3>
       </div>

       <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                <img 
                  src={`https://flagcdn.com/w80/${isUSD ? 'us' : isKSH ? 'ke' : isSLS ? 'so' : 'us'}.png`} 
                  className="w-8 h-auto rounded-sm opacity-80"
                  alt={wallet.currency}
                />
             </div>
             <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Institutional Vault</p>
                <div className="flex items-center gap-2">
                   <h4 className="text-xs font-black text-white italic tracking-widest">{fullName}</h4>
                   <span className="material-icons-outlined text-[10px] text-green">verified</span>
                </div>
             </div>
          </div>
          <div className="flex gap-2">
             {onCopy && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onCopy(); }}
                 className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-green hover:text-navy transition-all"
               >
                  <span className="material-icons-outlined text-sm">content_copy</span>
               </button>
             )}
             <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <span className="material-icons-outlined text-sm text-soft-grey group-hover:text-white transition-colors">account_balance</span>
             </div>
          </div>
       </div>

       <div className="relative z-10 space-y-2">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Available Liquidity</p>
          <div className="flex items-baseline gap-4">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">
                {parseFloat(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: isBTC ? 8 : 2 })}
             </h2>
             <span className="text-xl font-black text-green italic">{wallet.currency}</span>
          </div>
       </div>

       <div className="relative z-10 flex justify-between items-end pt-6 border-t border-white/5">
          {showId ? (
             <div className="flex flex-col gap-1">
                <p className="text-[7px] font-black text-soft-grey uppercase tracking-[0.2em]">Node ID</p>
                <p className="text-[9px] font-mono text-white/60 tracking-widest">GCP-{wallet.id.substring(0, 8).toUpperCase()}</p>
             </div>
          ) : (
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
                <p className="text-[7px] font-black text-green uppercase tracking-widest">Protocol Active</p>
             </div>
          )}
          <div className="flex items-center gap-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-xl">
             <span className="material-icons-outlined text-[10px] text-green">lock</span>
             <p className="text-[7px] font-black text-soft-grey uppercase tracking-widest">Secured Node Protocol</p>
          </div>
       </div>
    </div>
  );
}

function RateItem({ from, to, rate, trend }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-navy/60 rounded-[2rem] border border-white/5 shadow-inner group hover:bg-white/5 transition-colors">
       <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-green animate-pulse"></div>
          <span className="text-[11px] font-black text-white italic tracking-widest">{from}/{to}</span>
       </div>
       <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-white font-bold tracking-tighter">{rate}</span>
          <span className={`material-icons-outlined text-lg ${trend === 'up' ? 'text-green' : 'text-red-400'}`}>
             {trend === 'up' ? 'trending_up' : 'trending_down'}
          </span>
       </div>
    </div>
  );
}

function TransactionRow({ icon, name, category, time, amount, status, color, onClick }: any) {
  return (
    <tr onClick={onClick} className="group hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 last:border-0">
       <td className="py-10 pl-6">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-[1.2rem] bg-navy/60 border border-white/10 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-inner">
                <span className="material-icons-outlined text-soft-grey group-hover:text-green text-xl">{icon}</span>
             </div>
             <div>
                <p className="text-base font-black text-white italic">{name}</p>
                <p className="text-[10px] text-soft-grey uppercase tracking-widest mt-1 opacity-60">Verified Payment</p>
             </div>
          </div>
       </td>
       <td className="py-10">
          <span className="text-[11px] font-black text-soft-grey uppercase tracking-[0.3em]">{category}</span>
       </td>
       <td className="py-10 text-soft-grey font-medium text-xs">
          {time}
       </td>
       <td className="py-10 text-base font-black text-white italic tracking-tight">
          {amount}
       </td>
       <td className="py-10 text-right pr-6">
          <span className={`inline-block px-5 py-2 rounded-xl text-[10px] font-black tracking-[0.3em] shadow-xl border ${
            status === 'COMPLETED' ? 'bg-green/10 text-green border-green/20' : 'bg-gold/10 text-gold border border-gold/20'
          }`}>
             {status}
          </span>
       </td>
    </tr>
  );
}
