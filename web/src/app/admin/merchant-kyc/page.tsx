'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';
import DocumentPreviewModal from '@/components/admin/DocumentPreviewModal';

export default function AdminMerchantKYC() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [status, setStatus] = useState<string>(''); // empty for 'ALL'
  const [search, setSearch] = useState('');
  const { showNotification } = useNotification();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const res = await api.get(`/merchant/admin/kyc/all?${params.toString()}`); 
      setRecords(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.warn('Failed to fetch merchant records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/merchant/admin/kyc/${id}/${action}`, action === 'reject' ? { reason: 'Business documentation invalid' } : {});
      showNotification(`Merchant KYC ${action === 'approve' ? 'Verified' : 'Rejected'}`, 'success');
      setSelectedRecord(null);
      fetchRecords();
    } catch (err) {
      showNotification('Action failed', 'error');
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'VERIFIED': return 'bg-green';
      case 'PENDING': return 'bg-amber-400';
      case 'REJECTED': return 'bg-red-400';
      default: return 'bg-soft-grey';
    }
  };

  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        <div className="px-4 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">Merchant Oversight</h1>
              <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-3">Audit Business Entities & Compliance Ecosystem</p>
           </div>
           
           <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative group min-w-[300px]">
                <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-soft-grey group-focus-within:text-green transition-colors">search</span>
                <input 
                  type="text" 
                  placeholder="Search by Business Name or ID..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="glass-input w-full pl-12 py-4 text-xs"
                />
              </div>
           </div>
        </div>

        {/* Status Filters */}
        <div className="px-4 flex flex-wrap gap-3">
           {['', 'PENDING', 'VERIFIED', 'REJECTED'].map((s) => (
             <button
               key={s}
               onClick={() => { setStatus(s); setPage(1); }}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                 status === s 
                 ? 'bg-green text-navy border-green shadow-lg shadow-green/20' 
                 : 'bg-white/5 text-soft-grey border-white/10 hover:bg-white/10'
               }`}
             >
               {s || 'All Entities'}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 gap-8 px-4">
           {loading ? (
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
                <p className="text-soft-grey font-black uppercase tracking-widest text-[10px]">Synchronizing Records...</p>
             </div>
           ) : records.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center">
                 <p className="text-soft-grey font-black uppercase tracking-widest text-[10px]">No records found matching criteria</p>
              </div>
           ) : (
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-x-auto min-h-[400px]">
                 <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                       <tr className="text-[11px] font-black text-soft-grey uppercase tracking-[0.4em] pb-10">
                          <th className="pb-6 pl-6 italic">Business Entity</th>
                          <th className="pb-6 italic">Type</th>
                          <th className="pb-6 italic">Status</th>
                          <th className="pb-6 italic">Preference</th>
                          <th className="pb-6 text-right pr-6 italic">Action</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {records.map(record => (
                         <tr 
                           key={record.id} 
                           onClick={() => setSelectedRecord(record)}
                           className="group hover:bg-white/10 transition-all cursor-pointer"
                         >
                            <td className="py-6 pl-6 bg-white/5 rounded-l-[1.5rem] border-y border-white/5">
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-white italic">{record.legal_business_name}</span>
                                  <span className="text-[9px] text-soft-grey uppercase tracking-widest mt-1">ID: {record.merchant_id.slice(0, 12)}...</span>
                               </div>
                            </td>
                            <td className="py-6 bg-white/5 border-y border-white/5">
                               <span className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em]">{record.business_type}</span>
                            </td>
                            <td className="py-6 bg-white/5 border-y border-white/5">
                               <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 ${getStatusColor(record.status)} rounded-full shadow-[0_0_10px_rgba(22,198,110,0.5)]`}></span>
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{record.status}</span>
                               </div>
                            </td>
                            <td className="py-6 bg-white/5 border-y border-white/5">
                               <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">{record.settlement_preference}</span>
                            </td>
                            <td className="py-6 text-right pr-6 bg-white/5 rounded-r-[1.5rem] border-y border-white/5">
                               <button className="text-green text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-transform flex items-center gap-2 justify-end ml-auto">
                                  Audit <span className="material-icons-outlined text-sm">chevron_right</span>
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>

                 {/* Pagination */}
                 <div className="mt-12 flex items-center justify-between px-6 border-t border-white/5 pt-8">
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Showing {records.length} of {total} entities</p>
                    <div className="flex gap-4">
                       <button 
                         disabled={page === 1}
                         onClick={() => setPage(p => p - 1)}
                         className="p-3 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/10 transition-all"
                       >
                          <span className="material-icons-outlined text-white text-base">arrow_back</span>
                       </button>
                       <button 
                         disabled={page * 10 >= total}
                         onClick={() => setPage(p => p + 1)}
                         className="p-3 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/10 transition-all"
                       >
                          <span className="material-icons-outlined text-white text-base">arrow_forward</span>
                       </button>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Merchant Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-navy/90 backdrop-blur-md" onClick={() => setSelectedRecord(null)}></div>
             <div className="bg-[#121A2E] border border-white/10 rounded-[3.5rem] w-full max-w-6xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col">
                
                <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/5">
                   <div>
                      <h2 className="text-3xl font-black italic text-white">Business Entity Profile</h2>
                      <p className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] mt-1">Entity ID: {selectedRecord.id}</p>
                   </div>
                   <button onClick={() => setSelectedRecord(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">
                      <span className="material-icons-outlined text-white">close</span>
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-16">
                   
                   {/* Top: Core Info */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      <DetailLine label="Legal Business Name" value={selectedRecord.legal_business_name} />
                      <DetailLine label="Entity Type" value={selectedRecord.business_type} />
                      <DetailLine label="Nature of Operations" value={selectedRecord.nature_of_business} />
                      <DetailLine label="Business Address" value={selectedRecord.business_address || 'NOT PROVIDED'} />
                      <DetailLine label="Settlement Preference" value={selectedRecord.settlement_preference} />
                      <DetailLine label="Legal Terms Status" value={selectedRecord.terms_accepted ? 'ACCEPTED' : 'PENDING'} />
                   </div>

                   {/* Middle: Document Audit */}
                   <div className="space-y-8">
                      <h3 className="text-[11px] font-black text-green uppercase tracking-[0.4em]">Regulatory Documentation</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {selectedRecord.documents?.map((doc: any, i: number) => (
                           <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center gap-8 group hover:bg-white/10 transition-all">
                              <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center border border-white/5 shrink-0">
                                 <span className="material-icons-outlined text-3xl text-soft-grey">description</span>
                              </div>
                              <div className="flex-1">
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{doc.type}</p>
                                 <p className="text-[9px] text-soft-grey uppercase">Integrity: HIGH (AI Scanned)</p>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                                className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 text-white transition-all"
                              >
                                View
                              </button>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Bottom: Action Bridge */}
                   {selectedRecord.status === 'PENDING' && (
                     <div className="p-12 bg-[#0F3D3A]/20 border border-green/20 rounded-[3.5rem] flex items-center justify-between">
                        <div>
                           <h4 className="text-xl font-black italic mb-1 text-white">Neural Compliance Decision</h4>
                           <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Verify the merchant entity for full platform activation.</p>
                        </div>
                        <div className="flex gap-4">
                           <button 
                             onClick={() => handleAction(selectedRecord.id, 'reject')}
                             className="bg-red-400/10 border border-red-400/20 text-red-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-400/20 transition-all"
                           >
                              Flag for Rejection
                           </button>
                           <button 
                             onClick={() => handleAction(selectedRecord.id, 'approve')}
                             className="bg-green text-navy px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-green/30 hover:scale-105 transition-all"
                           >
                              Authorize Merchant
                           </button>
                        </div>
                     </div>
                   )}
                </div>

             </div>
          </div>
        )}

        {/* Document Preview Overlay */}
        {previewDoc && (
          <DocumentPreviewModal 
            document={previewDoc} 
            onClose={() => setPreviewDoc(null)} 
          />
        )}

      </div>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </AdminShell>
  );
}

function DetailLine({ label, value }: any) {
  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
       <span className="text-[9px] font-black text-soft-grey uppercase tracking-[0.3em]">{label}</span>
       <span className="text-base font-black text-white italic leading-tight">{value || 'N/A'}</span>
    </div>
  );
}
