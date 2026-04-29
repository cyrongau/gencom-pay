'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Shell from '@/components/Shell';

const MODELS = [
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (Fast)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Accurate)' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
];

export default function KYCPage() {
  const { user, loading, fetchProfile } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [kycRecord, setKycRecord] = useState<any>(null);
  const [idNumber, setIdNumber] = useState('');
  const [idType, setIdType] = useState('PASSPORT');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  
  const [showAISettings, setShowAISettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    fetchKYCStatus();
    fetchAISettings();
  }, [user, loading, router]);

  const fetchKYCStatus = async () => {
    try {
      const res = await api.get('/kyc/status');
      setKycRecord(res.data);
      if (res.data) {
        setIdNumber(res.data.id_number);
        setIdType(res.data.id_type);
        
        // If approved but local user status is not yet updated, refresh profile
        if (res.data.status === 'APPROVED' && user?.status !== 'VERIFIED') {
           fetchProfile();
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch KYC status', err);
      }
    }
  };

  const fetchAISettings = async () => {
    try {
      const res = await api.get('/kyc/settings');
      setApiKey(res.data.apiKey || '');
      setSelectedModel(res.data.model || MODELS[0].id);
    } catch (err) {
      console.error('Failed to fetch AI settings', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post('/kyc/settings', { apiKey, model: selectedModel });
      showNotification('AI Configuration Saved', 'success');
      setShowAISettings(false);
    } catch (err) {
      showNotification('Failed to save settings', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    showNotification('AI Analyzing Document...', 'info');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await api.post('/kyc/analyze', { base64Image: base64 });
        const details = res.data;
        
        if (details.id_number) setIdNumber(details.id_number);
        if (details.full_name) setFullName(details.full_name);
        if (details.id_type) setIdType(details.id_type.includes('PASSPORT') ? 'PASSPORT' : 'NATIONAL_ID');
        
        setAiData(details);
        showNotification('AI successfully extracted document details!', 'success');
      } catch (err: any) {
        showNotification('AI Analysis failed. Please enter details manually.', 'error');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/kyc/submit', { 
        idNumber, 
        idType, 
        fullName,
        extractedData: aiData,
        searchableText: aiData?.searchable_text
      });
      showNotification('KYC submitted successfully. Review in progress.', 'success');
      await fetchProfile();
      fetchKYCStatus();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        
        {/* Page Header */}
        <div className="flex justify-between items-end px-4">
           <div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter">Identity Verification</h1>
              <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Unlock Unlimited Global Transaction Limits</p>
           </div>
           <button onClick={() => setShowAISettings(true)} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-soft-grey hover:text-white transition-colors">
              <span className="material-icons-outlined text-sm">settings</span>
           </button>
        </div>

        {kycRecord ? (
          <section className="bg-white/5 border border-white/10 rounded-[4rem] p-20 flex flex-col items-center text-center space-y-10 shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-green/5 to-transparent"></div>
             <div className={`relative z-10 w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-2xl ${
               kycRecord.status === 'APPROVED' ? 'bg-green/10 shadow-green/20' : 
               kycRecord.status === 'REJECTED' ? 'bg-red-400/10 shadow-red-400/20' : 
               'bg-gold/10 shadow-gold/20 animate-pulse'
             }`}>
                <span className={`material-icons-outlined text-6xl ${
                  kycRecord.status === 'APPROVED' ? 'text-green' : 
                  kycRecord.status === 'REJECTED' ? 'text-red-400' : 
                  'text-gold'
                }`}>
                   {kycRecord.status === 'APPROVED' ? 'verified' : kycRecord.status === 'REJECTED' ? 'report_problem' : 'hourglass_top'}
                </span>
             </div>
             
             <div className="relative z-10 max-w-2xl space-y-4">
                <h2 className="text-4xl font-black italic text-white tracking-tighter">
                   {kycRecord.status === 'APPROVED' ? 'Identity Verified Successfully' : 
                    kycRecord.status === 'REJECTED' ? 'Verification Rejected' : 
                    'KYC Under Active Review'}
                </h2>
                <p className="text-lg font-medium text-soft-grey leading-relaxed">
                   {kycRecord.status === 'APPROVED' ? 'Your account is now fully active with unthrottled access to global on-ramps.' : 
                    kycRecord.status === 'REJECTED' ? `Reason: ${kycRecord.rejection_reason || 'Inconsistent data.'}` : 
                    'Our compliance team is currently cross-referencing your documents. This typically takes 2-4 hours.'}
                </p>
             </div>

             <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <StatusCard label="ID Protocol" value={kycRecord.id_type} icon="badge" />
                <StatusCard label="Document ID" value={kycRecord.id_number} icon="fingerprint" />
                <StatusCard label="Submission Date" value={new Date(kycRecord.created_at).toLocaleDateString()} icon="event" />
             </div>

             {kycRecord.status === 'REJECTED' && (
                <button onClick={() => setKycRecord(null)} className="btn-primary py-6 px-12 text-sm relative z-10">Restart Verification Process</button>
             )}
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             
             {/* Left Column: Guidance */}
             <div className="lg:col-span-5 space-y-8">
                <section className="bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-10 shadow-2xl">
                   <h3 className="text-2xl font-black italic">Verification Guide</h3>
                   <div className="space-y-8">
                      <GuideItem step="01" label="Prepare Document" desc="Have your original Passport or National ID card ready. Digital copies should be clear and glare-free." />
                      <GuideItem step="02" label="AI Assisted Scan" desc="Upload your document below. Our Gencom Vision AI will instantly extract relevant data points." />
                      <GuideItem step="03" label="Confirm Details" desc="Verify the extracted information matches your official document before final submission." />
                   </div>
                   
                   <div className="p-8 bg-blue/10 border border-blue/20 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                         <span className="material-icons-outlined text-blue">lock</span>
                         <h4 className="text-xs font-black uppercase tracking-widest text-white">Security Protocol</h4>
                      </div>
                      <p className="text-[10px] text-soft-grey leading-relaxed uppercase tracking-wider">Your documents are encrypted and stored in an offline vault. We only retain the necessary metadata for compliance audits.</p>
                   </div>
                </section>
             </div>

             {/* Right Column: Upload & Form */}
             <div className="lg:col-span-7 space-y-10">
                {/* Upload Zone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`group bg-white/5 border-2 border-dashed rounded-[3rem] p-16 text-center transition-all cursor-pointer shadow-2xl ${
                    analyzing ? 'border-green bg-green/5' : 'border-white/10 hover:border-green hover:bg-white/10'
                  }`}
                >
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   <div className={`w-24 h-24 mx-auto rounded-[2rem] bg-navy border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl`}>
                      <span className={`material-icons-outlined text-5xl ${analyzing ? 'text-green animate-spin' : 'text-soft-grey group-hover:text-green'}`}>
                         {analyzing ? 'autorenew' : 'cloud_upload'}
                      </span>
                   </div>
                   <h3 className="text-2xl font-black mb-3 italic">Upload Identity Document</h3>
                   <p className="text-xs font-medium text-soft-grey uppercase tracking-[0.2em] px-10">PNG, JPG or PDF up to 10MB • AI Processing Enabled</p>
                </div>

                {/* Manual Confirmation Form */}
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-green/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                   <div className="flex items-center gap-3 relative z-10">
                      <span className="material-icons-outlined text-green text-xl">auto_awesome</span>
                      <p className="text-[11px] font-black text-green uppercase tracking-[0.3em]">AI Auto-Fill Synced</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <div className="md:col-span-2 space-y-3">
                         <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Full Legal Name (As shown on ID)</label>
                         <input 
                           type="text" 
                           value={fullName}
                           onChange={(e) => setFullName(e.target.value)}
                           placeholder="Full Name..."
                           className="glass-input w-full"
                           required
                         />
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Document Type</label>
                         <select 
                           value={idType} 
                           onChange={(e) => setIdType(e.target.value)} 
                           className="glass-input w-full appearance-none"
                         >
                            <option value="PASSPORT">International Passport</option>
                            <option value="NATIONAL_ID">National Identity Card</option>
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Identification Number</label>
                         <input 
                           type="text" 
                           value={idNumber}
                           onChange={(e) => setIdNumber(e.target.value)}
                           placeholder="ID Number..."
                           className="glass-input w-full"
                           required
                         />
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     disabled={submitting || analyzing}
                     className="btn-primary w-full py-6 text-sm relative z-10"
                   >
                      {submitting ? 'Authenticating...' : 'Confirm & Submit for Review'}
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>

      {/* AI Settings Overlay */}
      {showAISettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-navy/95 backdrop-blur-3xl" onClick={() => setShowAISettings(false)} />
           <div className="relative w-full max-w-md bg-navy border border-white/10 rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black mb-10 italic">Vision AI Config</h3>
              
              <div className="space-y-8 mb-12">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">OpenRouter API Access Key</label>
                    <input 
                      type="password" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="glass-input w-full"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest px-2">Preferred Vision Engine</label>
                    <div className="space-y-3">
                       {MODELS.map(m => (
                          <button 
                            key={m.id}
                            onClick={() => setSelectedModel(m.id)}
                            className={`w-full text-left p-5 rounded-2xl border transition-all text-xs font-bold ${
                              selectedModel === m.id ? 'bg-green/10 border-green text-white shadow-lg' : 'bg-white/5 border-white/5 text-soft-grey hover:border-white/20'
                            }`}
                          >
                             {m.name}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              <button onClick={handleSaveSettings} className="btn-primary w-full py-5">Sync Configuration</button>
           </div>
        </div>
      )}
    </Shell>
  );
}

function StatusCard({ label, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-white/10 transition-all group">
       <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
          <span className="material-icons-outlined text-soft-grey group-hover:text-green">{icon}</span>
       </div>
       <div className="text-center">
          <p className="text-[9px] font-black text-soft-grey uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-white">{value}</p>
       </div>
    </div>
  );
}

function GuideItem({ step, label, desc }: any) {
  return (
    <div className="flex gap-6 items-start">
       <span className="text-2xl font-black italic text-green opacity-40">{step}</span>
       <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{label}</h4>
          <p className="text-xs text-soft-grey leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
