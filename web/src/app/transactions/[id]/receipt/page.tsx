'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';
import { QRCodeSVG } from 'qr-code-svg';

export default function TransactionReceipt() {
  const { id } = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const res = await api.get(`/ledger/transactions/${id}/receipt`);
      setReceipt(res.data);
    } catch (err) {
      console.error('Failed to fetch receipt', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center h-96"><span className="animate-spin material-icons-outlined text-4xl text-green">refresh</span></div></Shell>;
  if (!receipt) return <Shell><div className="text-center py-20 text-soft-grey">Receipt Not Found</div></Shell>;

  return (
    <Shell>
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Actions */}
        <div className="flex justify-between items-center mb-8 no-print">
           <button onClick={() => router.back()} className="text-soft-grey hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <span className="material-icons-outlined text-sm">arrow_back</span> Return
           </button>
           <button onClick={() => window.print()} className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 flex items-center gap-2">
              <span className="material-icons-outlined text-sm">print</span> Print PDF
           </button>
        </div>

        {/* The Receipt Paper */}
        <div className="bg-white text-navy rounded-[3rem] p-12 shadow-2xl relative overflow-hidden receipt-card">
           {/* Decorative Top Bar */}
           <div 
             className="absolute top-0 left-0 w-full h-3" 
             style={{ backgroundColor: receipt.merchant?.color || '#16C66E' }}
           ></div>

           {/* Header */}
           <div className="flex flex-col items-center text-center space-y-6 mb-12">
              <div className="w-20 h-20 bg-navy/5 rounded-2xl flex items-center justify-center p-4">
                 {receipt.merchant?.logo ? (
                    <img src={receipt.merchant.logo} className="w-full h-full object-contain" />
                 ) : (
                    <span className="material-icons-outlined text-4xl text-navy/20">payments</span>
                 )}
              </div>
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter">{receipt.merchant?.name || 'GENCOM PAY'}</h2>
                 <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.3em] mt-1">Official Settlement Record</p>
              </div>
           </div>

           {/* Amount Hero */}
           <div className="bg-navy/5 rounded-3xl p-10 flex flex-col items-center text-center mb-12">
              <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Total Amount Settled</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black italic">{receipt.amount}</span>
                 <span className="text-sm font-black italic">{receipt.currency}</span>
              </div>
           </div>

           {/* Details Grid */}
           <div className="space-y-6 border-y border-navy/5 py-10 mb-12">
              <ReceiptRow label="Receipt ID" value={receipt.receipt_id} mono />
              <ReceiptRow label="Status" value={receipt.status} success />
              <ReceiptRow label="Timestamp" value={new Date(receipt.timestamp).toLocaleString()} />
              <ReceiptRow label="Network Node" value={receipt.network_node} />
              <ReceiptRow label="Merchant ID" value={id.substring(0, 16).toUpperCase()} mono />
           </div>

           {/* QR Verification */}
           <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-white border border-navy/10 rounded-2xl shadow-sm">
                 {/* Simplified QR Placeholder */}
                 <div className="w-32 h-32 bg-navy/5 rounded-lg flex items-center justify-center overflow-hidden">
                    <span className="material-icons-outlined text-navy/10 text-6xl">qr_code_2</span>
                 </div>
              </div>
              <div className="text-center">
                 <p className="text-[9px] font-black text-navy/40 uppercase tracking-widest leading-loose">
                    Scan to verify this protocol on the <br/> 
                    <span className="text-navy">Gencom Public Ledger</span>
                 </p>
              </div>
           </div>

           {/* Footer */}
           <div className="mt-12 pt-8 border-t border-dashed border-navy/10 text-center">
              <p className="text-[9px] font-medium text-navy/30 italic">Thank you for using the Gencom Pay financial protocol.</p>
           </div>
        </div>

      </div>
      
      <style jsx>{`
        @media print {
          .no-print { display: none; }
          body { background: white !important; }
          .receipt-card { box-shadow: none !important; border: 1px solid #eee; }
        }
      `}</style>
    </Shell>
  );
}

function ReceiptRow({ label, value, mono, success }: any) {
  return (
    <div className="flex justify-between items-center text-xs">
       <span className="font-bold text-navy/40 uppercase tracking-widest text-[9px]">{label}</span>
       <span className={`font-black ${mono ? 'font-mono text-[10px]' : ''} ${success ? 'text-green' : ''}`}>
          {value}
       </span>
    </div>
  );
}
