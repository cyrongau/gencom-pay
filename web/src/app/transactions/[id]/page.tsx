'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const res = await api.get(`/transactions/${id}`);
      setTx(res.data);
    } catch (err) {
      showNotification('Failed to load transaction details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
        </div>
      </Shell>
    );
  }

  if (!tx) {
    return (
      <Shell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-black italic">Transaction Not Found</h2>
          <button onClick={() => router.back()} className="mt-6 text-green font-black uppercase tracking-widest text-xs">Go Back</button>
        </div>
      </Shell>
    );
  }

  const debitEntry = tx.entries?.find((e: any) => e.entry_type === 'DEBIT');
  const creditEntry = tx.entries?.find((e: any) => e.entry_type === 'CREDIT');

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
                    <span className="material-icons-outlined text-sm">arrow_back</span>
                 </button>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Transaction Details</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter">
                 {tx.description || 'Global Transfer'}
              </h1>
           </div>
           <div className="flex gap-4">
              <button onClick={() => setShowReceipt(true)} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                 <span className="material-icons-outlined text-sm">receipt_long</span>
                 View Receipt
              </button>
              <button onClick={downloadReceipt} className="bg-green text-navy px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green/20 hover:scale-105 transition-all flex items-center gap-3">
                 <span className="material-icons-outlined text-sm">download</span>
                 Download PDF
              </button>
           </div>
        </div>

        {/* Transaction Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[3.5rem] p-12 space-y-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-[100px] group-hover:bg-green/10 transition-all"></div>
              
              <div className="grid grid-cols-2 gap-12 relative z-10">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Amount Settled</p>
                    <p className="text-5xl font-black italic text-white">${parseFloat(debitEntry?.amount || '0').toFixed(2)}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Status</p>
                    <div className="flex items-center gap-3">
                       <span className="w-3 h-3 rounded-full bg-green animate-pulse"></span>
                       <span className="text-xl font-black italic text-green uppercase tracking-tighter">{tx.status}</span>
                    </div>
                 </div>
              </div>

              <div className="h-px w-full bg-white/5"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-navy/60 border border-white/10 flex items-center justify-center">
                          <span className="material-icons-outlined text-soft-grey">upload</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sender Wallet</p>
                          <p className="text-sm font-black italic">{debitEntry?.account_id}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-navy/60 border border-white/10 flex items-center justify-center">
                          <span className="material-icons-outlined text-green">download</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Recipient Wallet</p>
                          <p className="text-sm font-black italic text-green">{creditEntry?.account_id}</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-navy/60 border border-white/10 flex items-center justify-center">
                          <span className="material-icons-outlined text-soft-grey">event</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Settlement Date</p>
                          <p className="text-sm font-black italic">{new Date(tx.created_at).toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-navy/60 border border-white/10 flex items-center justify-center">
                          <span className="material-icons-outlined text-soft-grey">fingerprint</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Transaction Hash</p>
                          <p className="text-[10px] font-mono opacity-60 break-all">{tx.id}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-navy/40 border border-white/10 rounded-[3.5rem] p-12 space-y-10 flex flex-col justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-outlined text-4xl text-white">verified</span>
                 </div>
                 <h3 className="text-2xl font-black italic">Immutable <br />Proof</h3>
                 <p className="text-xs text-soft-grey leading-relaxed">
                    This transaction has been cryptographically signed and recorded on the Generex High-Integrity Ledger.
                 </p>
                 <div className="pt-6">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${tx.id}&bgcolor=0B1225&color=16C66E`} 
                      alt="Verification QR" 
                      className="w-32 h-32 mx-auto rounded-2xl border-4 border-white/5"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Audit Log / Additional Entries */}
        <div className="space-y-8">
           <h3 className="text-2xl font-black italic px-4">Ledger Audit Trail</h3>
           <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] border-b border-white/5">
                       <th className="p-8 italic">Node ID</th>
                       <th className="p-8 italic">Type</th>
                       <th className="p-8 italic">Currency</th>
                       <th className="p-8 text-right pr-12 italic">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs">
                    {tx.entries?.map((entry: any) => (
                       <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                          <td className="p-8 font-mono opacity-60">{entry.account_id}</td>
                          <td className="p-8">
                             <span className={`px-4 py-1.5 rounded-lg font-black uppercase tracking-widest text-[9px] border ${
                               entry.entry_type === 'CREDIT' ? 'bg-green/10 text-green border-green/20' : 'bg-red-400/10 text-red-400 border-red-400/20'
                             }`}>
                                {entry.entry_type}
                             </span>
                          </td>
                          <td className="p-8 font-black">{entry.currency}</td>
                          <td className="p-8 text-right pr-12 font-black italic text-base">
                             {entry.entry_type === 'CREDIT' ? '+' : '-'}{parseFloat(entry.amount).toFixed(2)}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-navy/90 backdrop-blur-xl" onClick={() => setShowReceipt(false)}></div>
              <div className="relative bg-white text-navy w-full max-w-lg rounded-[3rem] p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-300 print:shadow-none print:m-0 print:p-8">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center shadow-2xl">
                          <span className="text-2xl font-black italic text-white">G</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-2xl font-black italic tracking-tighter">Generex</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Financial Network</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Official Receipt</p>
                       <p className="text-xs font-black italic">#{tx.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                 </div>

                 <div className="space-y-8 py-12 border-y-2 border-navy/5">
                    <div className="text-center space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Amount Paid</p>
                       <p className="text-6xl font-black italic tracking-tighter">${parseFloat(debitEntry?.amount || '0').toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-8">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">From Account</p>
                          <p className="text-xs font-bold font-mono">{debitEntry?.account_id.slice(0, 16)}...</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">To Account</p>
                          <p className="text-xs font-bold font-mono">{creditEntry?.account_id.slice(0, 16)}...</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Date</p>
                          <p className="text-xs font-bold">{new Date(tx.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Time</p>
                          <p className="text-xs font-bold">{new Date(tx.created_at).toLocaleTimeString()}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Verification Seal</p>
                       <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${tx.id}&bgcolor=FFFFFF&color=0B1225`} 
                          alt="Verification QR" 
                          className="w-20 h-20"
                       />
                    </div>
                    <div className="text-right space-y-4">
                       <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed opacity-60">
                          GENCOM PAY ECOSYSTEM <br />
                          ATOMIC SETTLEMENT V3.2 <br />
                          SECURED BY GENEREX
                       </p>
                       <div className="flex gap-4 justify-end print:hidden">
                          <button onClick={() => setShowReceipt(false)} className="px-6 py-3 bg-navy/5 rounded-xl text-[10px] font-black uppercase tracking-widest">Close</button>
                          <button onClick={downloadReceipt} className="px-6 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Print</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          nav, aside, footer, button:not(.print-only) {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .Shell_main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </Shell>
  );
}
