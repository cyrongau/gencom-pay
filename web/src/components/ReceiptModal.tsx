'use client';

import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export default function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const isCredit = transaction.entry_type === 'CREDIT';
  const amount = parseFloat(transaction.amount).toFixed(2);
  const date = new Date(transaction.created_at).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    
    const canvas = await html2canvas(receiptRef.current, {
      backgroundColor: '#0B1225',
      scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Gencom_Receipt_${transaction.transaction_id.substring(0, 8)}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-navy/90 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-300">
        <div 
          ref={receiptRef}
          className="bg-[#0B1225] border border-white/10 rounded-[4rem] p-12 sm:p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative"
        >
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
            <h3 className="text-9xl font-black italic tracking-tighter whitespace-nowrap">GENCOM PAY</h3>
          </div>

          <div className="relative z-10 space-y-12">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green rounded-xl flex items-center justify-center shadow-lg shadow-green/20">
                    <span className="material-icons-outlined text-navy text-xl">account_balance</span>
                  </div>
                  <h2 className="text-2xl font-black italic text-white tracking-tighter">GENCOM PAY</h2>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Official Transaction Receipt</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-green/10 px-4 py-2 rounded-full border border-green/20">
                  <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
                  <span className="text-[10px] font-black text-green uppercase tracking-widest">Successful</span>
                </div>
              </div>
            </div>

            {/* Amount Section */}
            <div className="text-center py-10 bg-white/5 rounded-[3rem] border border-white/5">
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.4em] mb-4">Total Amount Settled</p>
              <div className="flex items-baseline justify-center gap-4">
                <h1 className="text-7xl font-black text-white italic tracking-tighter">
                  {isCredit ? '+' : '-'}{amount}
                </h1>
                <span className="text-2xl font-black text-green italic">{transaction.currency}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-y border-white/5 py-12">
              <DetailItem label="Transaction ID" value={transaction.transaction_id.toUpperCase()} mono />
              <DetailItem label="Timestamp" value={date} />
              <DetailItem label="Service Type" value={transaction.transaction?.description || 'Funds Transfer'} />
              <DetailItem label="Status Protocol" value="Secured Node Settlement" />
              <DetailItem label="From Entity" value={isCredit ? 'External Account' : 'Institutional Vault'} />
              <DetailItem label="Recipient" value={isCredit ? 'Institutional Vault' : 'External Account'} />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-soft-grey/40">
                  <span className="material-icons-outlined text-sm">verified_user</span>
                  <p className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted Node</p>
                </div>
                <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                  This document serves as proof of settlement on the Gencom Pay protocol. 
                  Digital ID: {transaction.id}
                </p>
              </div>
              <div className="w-24 h-24 bg-white p-2 rounded-2xl opacity-80">
                {/* Simplified QR Placeholder */}
                <div className="w-full h-full bg-navy flex items-center justify-center rounded-lg">
                  <span className="material-icons-outlined text-white text-3xl">qr_code_2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-10 flex gap-6">
          <button 
            onClick={downloadPDF}
            className="flex-1 py-6 bg-green text-navy rounded-[2.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-green/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <span className="material-icons-outlined text-sm">download</span>
            Download PDF
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, mono = false }: { label: string, value: string, mono?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</p>
      <p className={`text-xs font-bold text-white ${mono ? 'font-mono tracking-tighter' : 'italic'}`}>{value}</p>
    </div>
  );
}
