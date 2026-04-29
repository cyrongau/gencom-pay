'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';

// ─── Document Configuration ────────────────────────────────────────────────
const REQUIRED_DOCS = [
  { key: 'tax', backendType: 'TAX_CERTIFICATE', label: 'TAX / ITAX Certificate', icon: 'account_balance', required: true, aiPrompt: 'Extract: tax_id, business_name, issue_date, expiry_date, issuing_authority from this tax document.' },
  { key: 'registration', backendType: 'BUSINESS_REGISTRATION', label: 'Business Registration Certificate', icon: 'assignment', required: true, aiPrompt: 'Extract: registration_number, company_name, registration_date, business_type, registered_country from this registration certificate.' },
  { key: 'owner_id', backendType: 'OWNER_ID', label: 'Owner / Director Identification', icon: 'badge', required: true, aiPrompt: 'Extract: full_name, id_number, id_type (PASSPORT or NATIONAL_ID), date_of_birth, nationality, expiry_date, gender from this government ID.' },
  { key: 'licence', backendType: 'BUSINESS_LICENSE', label: 'Operating Licence (Optional)', icon: 'description', required: false, aiPrompt: 'Extract: licence_number, business_type, issuing_authority, validity_period from this operating licence.' },
];

type DocState = {
  file: File | null;
  preview: string | null;
  scanning: boolean;
  scanned: boolean;
  extracted: Record<string, string>;
  error: string | null;
};

const emptyDoc = (): DocState => ({ file: null, preview: null, scanning: false, scanned: false, extracted: {}, error: null });

export default function MerchantKYC() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [merchant, setMerchant] = useState<any>(null);
  const [kyc, setKyc] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [docs, setDocs] = useState<Record<string, DocState>>({
    tax: emptyDoc(), registration: emptyDoc(), owner_id: emptyDoc(), licence: emptyDoc(),
  });

  const [formData, setFormData] = useState({
    legal_business_name: '',
    business_type: 'LLC',
    nature_of_business: 'eCommerce',
    business_address: '',
    settlement_preference: 'DAILY',
    terms_accepted: false,
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else fetchMerchantAndKYC();
  }, [user, loading]);

  const fetchMerchantAndKYC = async () => {
    try {
      const mRes = await api.get('/merchant/profile');
      setMerchant(mRes.data);
      setFormData(prev => ({ ...prev, legal_business_name: mRes.data.business_name }));
      
      const kRes = await api.get('/merchant/kyc');
      if (kRes.data) {
        setKyc(kRes.data);
        
        // Populate docs state from existing documents
        if (kRes.data.documents && Array.isArray(kRes.data.documents)) {
          const newDocs = { ...docs };
          kRes.data.documents.forEach((doc: any) => {
            const config = REQUIRED_DOCS.find(d => d.backendType === doc.type);
            if (config) {
              newDocs[config.key] = {
                ...emptyDoc(),
                preview: doc.url,
                scanned: true, // Mark as scanned if it exists in DB
                extracted: doc.extracted || {},
              };
            }
          });
          setDocs(newDocs);
        }

        if (kRes.data.status === 'VERIFIED') router.push('/merchant');
      }
    } catch (e) { 
      console.error('Error fetching KYC', e);
    }
  };

  // ─── Per-document AI OCR scan ────────────────────────────────────────────
  const handleUpload = useCallback(async (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocs(prev => ({ ...prev, [docKey]: { ...prev[docKey], file, scanning: true, scanned: false, error: null } }));

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call AI OCR endpoint
      const res = await api.post('/kyc/analyze', { base64Image: base64 });
      const extracted: Record<string, string> = res.data || {};

      // Auto-populate form with owner_id data
      if (docKey === 'owner_id' && extracted.full_name) {
        setFormData(prev => ({ ...prev, legal_business_name: prev.legal_business_name || '' }));
      }
      if (docKey === 'registration' && extracted.company_name) {
        setFormData(prev => ({ ...prev, legal_business_name: extracted.company_name, business_type: extracted.business_type || prev.business_type }));
      }

      setDocs(prev => ({
        ...prev,
        [docKey]: { ...prev[docKey], scanning: false, scanned: true, extracted, preview: base64, error: null }
      }));
    } catch (err: any) {
      setDocs(prev => ({
        ...prev,
        [docKey]: { ...prev[docKey], scanning: false, scanned: false, error: err?.response?.data?.message || 'Scan failed. Please try again.' }
      }));
    }
  }, []);

  // ─── Gating: 3 required docs must be scanned ─────────────────────────────
  const requiredScanned = REQUIRED_DOCS.filter(d => d.required).every(d => docs[d.key].scanned);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ownerExtracted = docs.owner_id.extracted;
      await api.post('/merchant/kyc', {
        ...formData,
        documents: REQUIRED_DOCS.map(d => ({
          type: d.backendType,
          fileName: docs[d.key].file?.name || (docs[d.key].preview ? 'existing_file' : null),
          url: docs[d.key].preview, // Store preview as URL for now
          extracted: docs[d.key].extracted,
          scanned: docs[d.key].scanned,
        })),
        extracted_data: ownerExtracted,
      });
      await fetchMerchantAndKYC();
      setStep(5);
    } catch (err) {
      console.error('KYC Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (kyc?.status === 'PENDING') {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center">
            <span className="material-icons-outlined text-4xl text-gold animate-pulse">hourglass_top</span>
          </div>
          <h1 className="text-4xl font-black italic">KYC Under Review</h1>
          <p className="text-soft-grey text-center max-w-md uppercase tracking-widest text-[10px] leading-loose">
            Our compliance neural network is validating your business protocols.<br/>This typically takes 2–4 business hours.
          </p>
          <button onClick={() => router.push('/merchant')} className="btn-primary py-4 px-10 rounded-2xl">Return to Portal</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">

        {/* Step Indicator */}
        <div className="flex justify-between items-center px-4">
          {['Entity', 'Documents', 'Settlement', 'Review'].map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex flex-col items-center gap-2`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic transition-all ${
                    step === s ? 'bg-green text-navy scale-110 shadow-lg shadow-green/20' :
                    step > s ? 'bg-green/20 text-green border border-green/20' : 'bg-white/5 text-soft-grey border border-white/5'
                  }`}>
                    {step > s ? <span className="material-icons-outlined text-sm">check</span> : s}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-soft-grey hidden md:block">{label}</span>
                </div>
                {s < 4 && <div className={`w-16 h-px mb-6 ${step > s ? 'bg-green' : 'bg-white/5'}`} />}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Business Details ── */}
        {step === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <header>
              <h2 className="text-5xl font-black italic tracking-tighter">Entity Identity</h2>
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-2">Establish your business core metadata</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field label="Legal Business Name">
                <input type="text" value={formData.legal_business_name} onChange={e => setFormData({...formData, legal_business_name: e.target.value})} className="glass-input w-full" />
              </Field>
              <Field label="Business Type">
                <select value={formData.business_type} onChange={e => setFormData({...formData, business_type: e.target.value})} className="glass-input w-full">
                  <option value="LLC">Limited Liability Company (LLC)</option>
                  <option value="SOLE">Sole Proprietorship</option>
                  <option value="CORP">Corporation</option>
                  <option value="NGO">Non-Profit Organization</option>
                </select>
              </Field>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-1">Nature of Business</label>
                <textarea rows={3} value={formData.nature_of_business} onChange={e => setFormData({...formData, nature_of_business: e.target.value})} className="glass-input w-full" />
              </div>
              <Field label="Business Address">
                <input type="text" value={formData.business_address} onChange={e => setFormData({...formData, business_address: e.target.value})} className="glass-input w-full" placeholder="123 Business Blvd, City, Country" />
              </Field>
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Proceed to Documentation →</button>
          </div>
        )}

        {/* ── Step 2: Documents & AI Scanning ── */}
        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <header>
              <h2 className="text-5xl font-black italic tracking-tighter">Legal Documentation</h2>
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-2">
                Upload regulatory documents · AI OCR scans each document individually · 3 of 4 required
              </p>
            </header>

            {/* Progress indicator */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <span className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Documents Scanned</span>
              <div className="flex items-center gap-3">
                {REQUIRED_DOCS.map(d => (
                  <div key={d.key} className={`w-3 h-3 rounded-full transition-all ${
                    docs[d.key].scanning ? 'bg-gold animate-pulse' :
                    docs[d.key].scanned ? 'bg-green' :
                    docs[d.key].error ? 'bg-red-400' :
                    'bg-white/10'
                  }`} title={d.label} />
                ))}
                <span className="text-sm font-black italic ml-2">
                  {REQUIRED_DOCS.filter(d => d.required && docs[d.key].scanned).length} / 3 Required
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {REQUIRED_DOCS.map(docDef => (
                <DocumentUploadCard
                  key={docDef.key}
                  docKey={docDef.key}
                  label={docDef.label}
                  icon={docDef.icon}
                  required={docDef.required}
                  state={docs[docDef.key]}
                  onUpload={handleUpload}
                />
              ))}
            </div>

            {!requiredScanned && (
              <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5 flex items-center gap-4">
                <span className="material-icons-outlined text-gold">info</span>
                <p className="text-[10px] font-black text-gold uppercase tracking-widest">
                  Upload & scan the TAX Certificate, Business Registration, and Owner ID to proceed.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!requiredScanned}
                className="flex-[2] btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {requiredScanned ? 'Continue to Settlement →' : 'Scan Required Documents First'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Settlement Prefs ── */}
        {step === 3 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <header>
              <h2 className="text-5xl font-black italic tracking-tighter">Settlement Protocol</h2>
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-2">Configure automated funds dispersion</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { value: 'DAILY', label: 'Daily Batch', desc: 'Settled every 24h at 00:00 UTC' },
                { value: 'WEEKLY', label: 'Weekly Cycle', desc: 'Every Monday morning' },
                { value: 'INSTANT', label: 'Instant Bridge', desc: 'Immediate settlement (2% fee)' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({...formData, settlement_preference: opt.value})}
                  className={`p-8 rounded-[2rem] border text-left transition-all ${
                    formData.settlement_preference === opt.value
                      ? 'bg-green/10 border-green/40 shadow-lg shadow-green/10'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${formData.settlement_preference === opt.value ? 'text-green' : 'text-soft-grey'}`}>{opt.label}</p>
                  <p className="text-xs font-bold text-white mb-4">{opt.desc}</p>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.settlement_preference === opt.value ? 'border-green bg-green' : 'border-white/10'}`}>
                    {formData.settlement_preference === opt.value && <span className="material-icons-outlined text-navy text-sm">check</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Back</button>
              <button onClick={() => setStep(4)} className="flex-[2] btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Review & Accept →</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Terms ── */}
        {step === 4 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <header>
              <h2 className="text-5xl font-black italic tracking-tighter">Compliance Audit</h2>
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest mt-2">Final Review & Regulatory Acceptance</p>
            </header>

            {/* Scanned Documents Summary */}
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-6">
              <h4 className="text-[10px] font-black text-green uppercase tracking-widest">Verified Documents</h4>
              <div className="grid grid-cols-2 gap-4">
                {REQUIRED_DOCS.map(d => (
                  <div key={d.key} className={`flex items-center gap-3 p-4 rounded-2xl border ${docs[d.key].scanned ? 'bg-green/5 border-green/20' : 'bg-white/5 border-white/5 opacity-40'}`}>
                    <span className={`material-icons-outlined text-sm ${docs[d.key].scanned ? 'text-green' : 'text-soft-grey'}`}>
                      {docs[d.key].scanned ? 'verified' : 'radio_button_unchecked'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
              <div className="max-h-48 overflow-y-auto pr-4 space-y-4 text-sm text-soft-grey">
                <p className="font-bold text-white">Merchant Service Agreement v1.4</p>
                <ul className="list-disc pl-6 space-y-3 text-xs">
                  <li>You will not use Gencom Pay to process prohibited items.</li>
                  <li>Settlement schedules are subject to fraud risk checks.</li>
                  <li>Chargeback disputes are handled via the unified arbitration bridge.</li>
                  <li>Withdrawal terms depend on the selected settlement preference.</li>
                </ul>
              </div>
              <div className="flex items-center gap-4 p-6 bg-navy/40 rounded-2xl border border-white/5">
                <input type="checkbox" checked={formData.terms_accepted} onChange={e => setFormData({...formData, terms_accepted: e.target.checked})} className="w-6 h-6 rounded-lg" />
                <p className="text-[10px] font-black uppercase tracking-widest">I accept the Merchant Protocols & Compliance Terms</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Back</button>
              <button onClick={handleSubmit} disabled={!formData.terms_accepted || isSubmitting} className="flex-[2] btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30">
                {isSubmitting ? 'Transmitting...' : 'Submit Business KYC'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Success ── */}
        {step === 5 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-10 animate-in zoom-in-95 duration-700">
            <div className="w-32 h-32 bg-green/10 border border-green/20 rounded-[2rem] flex items-center justify-center">
              <span className="material-icons-outlined text-6xl text-green">rocket_launch</span>
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black italic tracking-tighter text-white">Application Transmitted</h2>
              <p className="text-soft-grey text-xs uppercase tracking-widest leading-loose max-w-md mx-auto">
                Your {REQUIRED_DOCS.filter(d => docs[d.key].scanned).length} documents have been submitted for manual audit.
              </p>
            </div>
            <button onClick={() => router.push('/merchant')} className="btn-primary py-4 px-12 rounded-2xl font-black text-xs">Return to Dashboard</button>
          </div>
        )}

      </div>
    </Shell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-1">{label}</label>
      {children}
    </div>
  );
}

function DocumentUploadCard({ docKey, label, icon, required, state, onUpload }: {
  docKey: string; label: string; icon: string; required: boolean;
  state: DocState; onUpload: (key: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={`relative rounded-[2.5rem] border transition-all overflow-hidden ${
      state.scanned ? 'border-green/40 bg-green/5' :
      state.error ? 'border-red-400/40 bg-red-400/5' :
      state.scanning ? 'border-gold/30 bg-gold/5 animate-pulse' :
      'border-white/10 bg-white/5 hover:bg-white/10'
    }`}>
      <input
        type="file"
        accept="image/*,.pdf"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={e => onUpload(docKey, e)}
        disabled={state.scanning}
      />

      {/* Preview */}
      {state.preview && (
        <div className="relative h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.preview} alt="document" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>
      )}

      <div className="p-8 space-y-4">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            state.scanned ? 'bg-green/20 border border-green/30' : 'bg-navy border border-white/5'
          }`}>
            <span className={`material-icons-outlined text-2xl ${state.scanned ? 'text-green' : state.scanning ? 'text-gold animate-spin' : 'text-soft-grey'}`}>
              {state.scanning ? 'refresh' : state.scanned ? 'verified' : icon}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {required && <span className="text-[8px] font-black uppercase tracking-widest text-red-400 border border-red-400/30 bg-red-400/10 px-2 py-1 rounded-full">Required</span>}
            {state.scanned && <span className="text-[8px] font-black uppercase tracking-widest text-green border border-green/30 bg-green/10 px-2 py-1 rounded-full">Scanned ✓</span>}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
          {state.scanning && <p className="text-[9px] text-gold mt-1 font-bold">AI scanning document...</p>}
          {state.error && <p className="text-[9px] text-red-400 mt-1 font-bold">{state.error}</p>}
          {!state.file && !state.scanning && <p className="text-[9px] text-soft-grey mt-1">Click to upload · JPG, PNG or PDF</p>}
        </div>

        {/* Extracted data preview */}
        {state.scanned && Object.keys(state.extracted).length > 0 && (
          <div className="bg-navy/60 border border-green/10 rounded-2xl p-4 space-y-2">
            {Object.entries(state.extracted).slice(0, 4).map(([k, v]) => v && (
              <div key={k} className="flex justify-between items-center">
                <span className="text-[8px] font-black text-soft-grey uppercase tracking-widest">{k.replace(/_/g, ' ')}</span>
                <span className="text-[9px] font-bold text-white max-w-[55%] text-right truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
