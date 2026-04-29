'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:  { label: 'Pending',  color: 'text-gold  bg-gold/10  border-gold/20',  icon: 'hourglass_top' },
  APPROVED: { label: 'Approved', color: 'text-green bg-green/10 border-green/20', icon: 'verified' },
  REJECTED: { label: 'Rejected / Suspended', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: 'block' },
};

const ID_TYPE_ICONS: Record<string, string> = {
  PASSPORT: 'flight_takeoff',
  NATIONAL_ID: 'badge',
  DRIVERS_LICENSE: 'directions_car',
};

export default function AdminKYC() {
  const [records, setRecords]           = useState<any[]>([]);
  const [total, setTotal]               = useState(0);
  const [pages, setPages]               = useState(1);
  const [loading, setLoading]           = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [rejectModal, setRejectModal]   = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { showNotification } = useNotification();

  // ─── Filter State ────────────────────────────────────────────────────────
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [idType, setIdType]   = useState('');
  const [page, setPage]       = useState(1);
  const LIMIT = 15;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (idType) params.set('idType', idType);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));

      const res = await api.get(`/kyc/admin/all?${params}`);
      setRecords(res.data.data || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      showNotification('Failed to fetch KYC records', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, idType, page]);

  useEffect(() => {
    const t = setTimeout(fetchRecords, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchRecords]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'suspend') => {
    setActionLoading(true);
    try {
      if (action === 'reject') {
        await api.post(`/kyc/${id}/reject`, { reason: rejectReason || 'Document unclear or insufficient' });
        setRejectModal(null);
        setRejectReason('');
      } else {
        await api.post(`/kyc/${id}/${action}`);
      }
      showNotification(`KYC ${action === 'approve' ? 'Approved' : action === 'suspend' ? 'Suspended' : 'Rejected'}`, 'success');
      setSelectedRecord(null);
      fetchRecords();
    } catch {
      showNotification('Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount  = records.filter(r => r.status === 'PENDING').length;
  const approvedCount = records.filter(r => r.status === 'APPROVED').length;

  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">

        {/* Header */}
        <div className="px-4 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter">KYC Verification</h1>
            <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Audit Identity Documents & Compliance Nodes</p>
          </div>
          <div className="flex gap-6">
            <KPIBadge label="Total Records" value={total} color="text-white" />
            <KPIBadge label="Pending" value={pendingCount} color="text-gold" />
            <KPIBadge label="Approved" value={approvedCount} color="text-green" />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[260px] relative">
            <span className="material-icons-outlined absolute left-5 top-1/2 -translate-y-1/2 text-soft-grey text-lg">search</span>
            <input
              type="text"
              placeholder="Search by name, email, ID number, nationality..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-soft-grey outline-none focus:border-green transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest text-soft-grey outline-none focus:border-green transition-all"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected / Suspended</option>
          </select>

          {/* Doc type filter */}
          <select
            value={idType}
            onChange={e => { setIdType(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest text-soft-grey outline-none focus:border-green transition-all"
          >
            <option value="">All ID Types</option>
            <option value="PASSPORT">Passport</option>
            <option value="NATIONAL_ID">National ID</option>
            <option value="DRIVERS_LICENSE">Driver's License</option>
          </select>

          <button
            onClick={() => { setSearch(''); setStatus(''); setIdType(''); setPage(1); }}
            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-soft-grey hover:text-white transition-all"
          >
            Clear
          </button>
        </div>

        {/* Main Table */}
        <section className="bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-2 border-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-soft-grey text-[10px] font-black uppercase tracking-widest">Scanning Ledger...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-20 text-center">
              <span className="material-icons-outlined text-4xl text-soft-grey/30 mb-4 block">manage_search</span>
              <p className="text-soft-grey font-black uppercase tracking-widest text-[10px]">No records match the current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/3">
                    <th className="text-[9px] font-black text-soft-grey uppercase tracking-[0.4em] py-6 pl-8">Identity</th>
                    <th className="text-[9px] font-black text-soft-grey uppercase tracking-[0.4em] py-6">Status</th>
                    <th className="text-[9px] font-black text-soft-grey uppercase tracking-[0.4em] py-6">Document</th>
                    <th className="text-[9px] font-black text-soft-grey uppercase tracking-[0.4em] py-6">ID Number</th>
                    <th className="text-[9px] font-black text-soft-grey uppercase tracking-[0.4em] py-6">Nationality</th>
                    <th className="text-[9px] font-black text-soft-grey uppercase tracking-[0.4em] py-6">Submitted</th>
                    <th className="text-[9px] font-black text-soft-grey uppercase tracking-[0.4em] py-6 pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => {
                    const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.PENDING;
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="group border-b border-white/5 last:border-0 hover:bg-white/5 transition-all cursor-pointer"
                      >
                        {/* Identity */}
                        <td className="py-6 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-navy rounded-2xl border border-white/5 flex items-center justify-center shrink-0">
                              <span className="material-icons-outlined text-sm text-soft-grey">person</span>
                            </div>
                            <div>
                              <p className="text-sm font-black text-white italic">{record.user?.full_name || 'Unknown'}</p>
                              <p className="text-[9px] text-soft-grey font-bold mt-0.5">{record.user?.email || `...${record.user_id?.slice(-8)}`}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${cfg.color}`}>
                            <span className="material-icons-outlined text-[11px]">{cfg.icon}</span>
                            {cfg.label}
                          </span>
                        </td>

                        {/* Doc type */}
                        <td className="py-6">
                          <div className="flex items-center gap-2">
                            <span className="material-icons-outlined text-xs text-blue">{ID_TYPE_ICONS[record.id_type] || 'badge'}</span>
                            <span className="text-[9px] font-black text-soft-grey uppercase tracking-widest">{record.id_type?.replace('_', ' ')}</span>
                          </div>
                        </td>

                        {/* ID Number */}
                        <td className="py-6 font-mono text-xs text-white/60">{record.id_number}</td>

                        {/* Nationality */}
                        <td className="py-6 text-[10px] text-soft-grey font-bold">
                          {record.extracted_data?.nationality || record.searchable_text?.split(' ').find((w: string) => w.length > 4) || '—'}
                        </td>

                        {/* Date */}
                        <td className="py-6 text-[10px] text-soft-grey font-bold">
                          {new Date(record.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Quick actions */}
                        <td className="py-6 pr-8 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            {record.status === 'PENDING' && (
                              <>
                                <ActionBtn color="green" icon="check" title="Approve" onClick={() => handleAction(record.id, 'approve')} />
                                <ActionBtn color="red" icon="close" title="Reject" onClick={() => setRejectModal({ id: record.id })} />
                              </>
                            )}
                            {record.status === 'APPROVED' && (
                              <ActionBtn color="orange" icon="lock" title="Suspend" onClick={() => handleAction(record.id, 'suspend')} />
                            )}
                            <ActionBtn color="blue" icon="open_in_new" title="View Details" onClick={() => setSelectedRecord(record)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div className="flex items-center justify-between px-8 py-6 border-t border-white/5">
              <p className="text-[10px] text-soft-grey font-bold uppercase tracking-widest">
                Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total} records
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  <span className="material-icons-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === p ? 'bg-green text-navy' : 'bg-white/5 border border-white/10 text-soft-grey hover:text-white'}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  <span className="material-icons-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Detail Modal ── */}
        {selectedRecord && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-navy/90 backdrop-blur-md" onClick={() => setSelectedRecord(null)} />
            <div className="bg-[#121A2E] border border-white/10 rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col z-10">

              {/* Modal Header */}
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black italic">Oversight Analysis</h2>
                  {(() => {
                    const cfg = STATUS_CONFIG[selectedRecord.status] || STATUS_CONFIG.PENDING;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.color}`}>
                        <span className="material-icons-outlined text-sm">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
                <button onClick={() => setSelectedRecord(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">
                  <span className="material-icons-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                  {/* Left: Extracted Data */}
                  <div className="space-y-10">
                    <section className="space-y-6">
                      <h3 className="text-[10px] font-black text-green uppercase tracking-[0.4em]">OCR Extracted Identity</h3>
                      <div className="grid grid-cols-1 gap-5">
                        <DetailLine label="Full Legal Name" value={selectedRecord.user?.full_name} />
                        <DetailLine label="Email Address" value={selectedRecord.user?.email} />
                        <DetailLine label="Document Type" value={selectedRecord.id_type?.replace('_', ' ')} />
                        <DetailLine label="ID Number" value={selectedRecord.id_number} />
                        <DetailLine label="Nationality" value={selectedRecord.extracted_data?.nationality} />
                        <DetailLine label="Date of Birth" value={selectedRecord.extracted_data?.date_of_birth} />
                        <DetailLine label="Gender" value={selectedRecord.extracted_data?.gender} />
                        <DetailLine label="Expiry Date" value={selectedRecord.extracted_data?.expiry_date} />
                        {selectedRecord.rejection_reason && (
                          <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl">
                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">Rejection / Suspension Reason</p>
                            <p className="text-sm text-white">{selectedRecord.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Document images if any stored */}
                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                      <h4 className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Submitted Documents</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedRecord.document_metadata?.documents || []).map((doc: any, i: number) => (
                          <div key={i} className={`p-4 rounded-2xl border ${doc.scanned ? 'bg-green/5 border-green/20' : 'bg-white/5 border-white/5'}`}>
                            <p className="text-[8px] font-black uppercase tracking-widest text-soft-grey">{doc.type?.replace('_', ' ')}</p>
                            <p className={`text-[9px] font-black mt-1 ${doc.scanned ? 'text-green' : 'text-soft-grey'}`}>{doc.scanned ? '✓ Scanned' : 'Not scanned'}</p>
                          </div>
                        ))}
                        {(!selectedRecord.document_metadata?.documents || selectedRecord.document_metadata.documents.length === 0) && (
                          <div className="col-span-2 text-[9px] text-soft-grey text-center py-4 opacity-50 uppercase tracking-widest">No document metadata stored</div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Right: OCR text & Decision */}
                  <div className="space-y-10">
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-blue uppercase tracking-[0.4em]">Raw OCR Buffer</h3>
                      <div className="bg-navy/40 border border-white/5 rounded-[2rem] p-8 h-64 overflow-y-auto text-[10px] font-mono leading-relaxed text-soft-grey uppercase">
                        {selectedRecord.searchable_text || 'No OCR data recorded.'}
                      </div>
                    </section>

                    {/* Decision Panel */}
                    {selectedRecord.status === 'PENDING' && (
                      <section className="p-8 bg-green/5 border border-green/10 rounded-[2.5rem] space-y-6">
                        <h4 className="text-lg font-black italic">Protocol Finalization</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleAction(selectedRecord.id, 'approve')}
                            className="w-full bg-green text-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                          >
                            {actionLoading ? '...' : '✓ Verify Participant'}
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => setRejectModal({ id: selectedRecord.id })}
                            className="w-full bg-red-400 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-400/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                          >
                            ✗ Flag & Reject
                          </button>
                        </div>
                      </section>
                    )}
                    {selectedRecord.status === 'APPROVED' && (
                      <section className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] space-y-4">
                        <h4 className="text-sm font-black italic text-orange-400">Suspend Participant</h4>
                        <p className="text-[10px] text-soft-grey uppercase tracking-widest">This will lock the account and prevent all transactions.</p>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAction(selectedRecord.id, 'suspend')}
                          className="w-full bg-orange-500/20 border border-orange-500/30 text-orange-400 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500/30 transition-all"
                        >
                          <span className="material-icons-outlined text-sm mr-2 align-middle">lock</span>
                          Suspend & Lock Account
                        </button>
                      </section>
                    )}

                    {/* Meta timestamps */}
                    <div className="grid grid-cols-2 gap-4">
                      <DetailLine label="Submitted" value={new Date(selectedRecord.created_at).toLocaleString()} />
                      {selectedRecord.verified_at && <DetailLine label="Verified At" value={new Date(selectedRecord.verified_at).toLocaleString()} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Reject Reason Modal ── */}
        {rejectModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-navy/95 backdrop-blur-md" onClick={() => setRejectModal(null)} />
            <div className="bg-[#121A2E] border border-white/10 rounded-[3rem] w-full max-w-xl p-12 relative z-10 space-y-8 shadow-2xl">
              <h3 className="text-2xl font-black italic">Flag & Reject</h3>
              <p className="text-[10px] text-soft-grey uppercase tracking-widest font-bold">Provide a clear reason that will be sent to the applicant.</p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={4}
                placeholder="e.g. Document is blurry or expired. Please resubmit a clear, valid government-issued ID..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-red-400 transition-all resize-none"
              />
              <div className="flex gap-4">
                <button onClick={() => setRejectModal(null)} className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction(rejectModal.id, 'reject')}
                  className="flex-[2] bg-red-400 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminShell>
  );
}

// ─── Micro-components ─────────────────────────────────────────────────────────
function KPIBadge({ label, value, color }: any) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-black italic ${color}`}>{value}</p>
      <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function ActionBtn({ color, icon, title, onClick }: any) {
  const colors: Record<string, string> = {
    green:  'bg-green/10 border-green/20 text-green hover:bg-green/20',
    red:    'bg-red-400/10 border-red-400/20 text-red-400 hover:bg-red-400/20',
    blue:   'bg-blue/10 border-blue/20 text-blue hover:bg-blue/20',
    orange: 'bg-orange-400/10 border-orange-400/20 text-orange-400 hover:bg-orange-400/20',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${colors[color] || colors.blue}`}
    >
      <span className="material-icons-outlined text-sm">{icon}</span>
    </button>
  );
}

function DetailLine({ label, value }: any) {
  return (
    <div className="flex flex-col gap-1.5 pb-4 border-b border-white/5">
      <span className="text-[9px] font-black text-soft-grey uppercase tracking-[0.3em]">{label}</span>
      <span className="text-sm font-black text-white italic">{value || <span className="text-white/20 font-normal not-italic text-xs">NOT DETECTED</span>}</span>
    </div>
  );
}
