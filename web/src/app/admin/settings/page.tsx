'use client';

import React, { useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

const TABS = [
  { id: 'integrations', label: 'Integrations', icon: 'extension' },
  { id: 'branding', label: 'System Branding', icon: 'palette' },
  { id: 'security', label: 'Admin Security', icon: 'security' },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('integrations');
  const { showNotification } = useNotification();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const [integrations, setIntegrations] = useState({
    openRouterKey: '',
    aiModel: 'google/gemini-2.0-flash-001',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFromName: 'Gencom Pay',
    smtpFromEmail: 'noreply@gencom.io',
    smsProvider: 'TWILIO',
    smsApiKey: '',
  });

  const [branding, setBranding] = useState({
    appName: 'Gencom Pay',
    appDescription: 'High-fidelity atomic settlement protocol.',
    primaryColor: '#16C66E',
    supportEmail: 'support@gencom.io',
    logoFull: '',
    logoSquare: '',
    logoLandscape: '',
    appIcon: '',
    splashIcon: '',
  });

  React.useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/kyc/settings');
      const data = res.data;
      setIntegrations(prev => ({
        ...prev,
        openRouterKey: data.OPEN_ROUTER_API_KEY || '',
        aiModel: data.AI_MODEL || 'google/gemini-2.0-flash-001',
        smtpHost: data.SMTP_HOST || '',
        smtpPort: data.SMTP_PORT || '587',
        smtpUser: data.SMTP_USER || '',
        smtpPass: data.SMTP_PASS || '',
        smtpFromName: data.SMTP_FROM_NAME || 'Gencom Pay',
        smtpFromEmail: data.SMTP_FROM_EMAIL || 'noreply@gencom.io',
        smsProvider: data.SMS_PROVIDER || 'TWILIO',
        smsApiKey: data.SMS_API_KEY || '',
      }));
      setBranding(prev => ({
        ...prev,
        appName: data.APP_NAME || 'Gencom Pay',
        appDescription: data.APP_DESCRIPTION || 'High-fidelity atomic settlement protocol.',
        primaryColor: data.PRIMARY_COLOR || '#16C66E',
        supportEmail: data.SUPPORT_EMAIL || 'support@gencom.io',
        logoFull: data.LOGO_FULL || '',
        logoSquare: data.LOGO_SQUARE || '',
        logoLandscape: data.LOGO_LANDSCAPE || '',
        appIcon: data.APP_ICON || '',
        splashIcon: data.SPLASH_ICON || '',
      }));
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/kyc/settings', {
        OPEN_ROUTER_API_KEY: integrations.openRouterKey,
        AI_MODEL: integrations.aiModel,
        SMTP_HOST: integrations.smtpHost,
        SMTP_PORT: integrations.smtpPort,
        SMTP_USER: integrations.smtpUser,
        SMTP_PASS: integrations.smtpPass,
        SMTP_FROM_NAME: integrations.smtpFromName,
        SMTP_FROM_EMAIL: integrations.smtpFromEmail,
        SMS_PROVIDER: integrations.smsProvider,
        SMS_API_KEY: integrations.smsApiKey,
        APP_NAME: branding.appName,
        APP_DESCRIPTION: branding.appDescription,
        PRIMARY_COLOR: branding.primaryColor,
        SUPPORT_EMAIL: branding.supportEmail,
        LOGO_FULL: branding.logoFull,
        LOGO_SQUARE: branding.logoSquare,
        LOGO_LANDSCAPE: branding.logoLandscape,
        APP_ICON: branding.appIcon,
        SPLASH_ICON: branding.splashIcon,
      });
      showNotification('Global Settings Synchronized', 'success');
    } catch {
      showNotification('Synchronization Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/email/test', {
        host: integrations.smtpHost,
        port: parseInt(integrations.smtpPort),
        user: integrations.smtpUser,
        pass: integrations.smtpPass,
        fromName: integrations.smtpFromName,
        fromEmail: integrations.smtpFromEmail,
      });
      setTestResult(res.data);
      if (res.data.success) {
        showNotification('Test email dispatched successfully!', 'success');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Request failed. Check the API is running.';
      setTestResult({ success: false, error: errMsg });
    } finally {
      setTesting(false);
    }
  };

  const set = (field: string, value: string) =>
    setIntegrations(prev => ({ ...prev, [field]: value }));

  return (
    <AdminShell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">

        {/* Header */}
        <div className="flex justify-between items-end px-4">
          <div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter">Oversight Config</h1>
            <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">Manage System Nodes, Identity & Integrations</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary py-5 px-12 text-sm shadow-2xl">
            {saving ? 'SYNCING PROTOCOL...' : 'SAVE ALL CHANGES'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/10 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${
                activeTab === tab.id ? 'bg-white/10 text-green shadow-xl border border-white/5' : 'text-soft-grey hover:text-white'
              }`}
            >
              <span className="material-icons-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

          {/* Main Settings Form */}
          <div className="xl:col-span-8 space-y-10">
            {activeTab === 'integrations' && (
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-12 shadow-2xl relative overflow-hidden animate-in slide-in-from-left-4 duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="space-y-10">
                  {/* AI Integration */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green/10 rounded-xl flex items-center justify-center border border-green/20">
                        <span className="material-icons-outlined text-green">auto_awesome</span>
                      </div>
                      <h3 className="text-xl font-black italic">Intelligence Node (AI)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">OpenRouter API Key</label>
                        <input type="password" value={integrations.openRouterKey} onChange={e => set('openRouterKey', e.target.value)} className="glass-input w-full" placeholder="sk-or-v1-..." />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Preferred AI Model</label>
                        <select value={integrations.aiModel} onChange={e => set('aiModel', e.target.value)} className="glass-input w-full">
                          <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                          <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                          <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[9px] text-soft-grey px-2 italic uppercase tracking-widest opacity-60">Used for Gencom Vision identity extraction and fraud analysis.</p>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* SMTP Section */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue/10 rounded-xl flex items-center justify-center border border-blue/20">
                          <span className="material-icons-outlined text-blue">alternate_email</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black italic">Communications Protocol (SMTP)</h3>
                          <p className="text-[10px] text-soft-grey uppercase tracking-widest font-bold mt-1">Transactional email gateway</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">SMTP Host</label>
                        <input type="text" value={integrations.smtpHost} onChange={e => set('smtpHost', e.target.value)} className="glass-input w-full" placeholder="smtp.gmail.com" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">SMTP Port</label>
                        <select value={integrations.smtpPort} onChange={e => set('smtpPort', e.target.value)} className="glass-input w-full">
                          <option value="587">587 — TLS (Recommended)</option>
                          <option value="465">465 — SSL</option>
                          <option value="25">25 — Plain (Not Recommended)</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Username / Email</label>
                        <input type="text" value={integrations.smtpUser} onChange={e => set('smtpUser', e.target.value)} className="glass-input w-full" placeholder="you@domain.com" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Password / App Password</label>
                        <input type="password" value={integrations.smtpPass} onChange={e => set('smtpPass', e.target.value)} className="glass-input w-full" placeholder="••••••••••••" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">From Name</label>
                        <input type="text" value={integrations.smtpFromName} onChange={e => set('smtpFromName', e.target.value)} className="glass-input w-full" placeholder="Gencom Pay" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">From Email Address</label>
                        <input type="email" value={integrations.smtpFromEmail} onChange={e => set('smtpFromEmail', e.target.value)} className="glass-input w-full" placeholder="noreply@gencom.io" />
                      </div>
                    </div>

                    {/* Test Connection Block */}
                    <div className="bg-navy/40 border border-white/5 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-white italic">Connection Test</p>
                          <p className="text-[10px] text-soft-grey uppercase tracking-widest font-bold mt-1">
                            Sends a real test email to <span className="text-white">{integrations.smtpUser || 'your address'}</span>
                          </p>
                        </div>
                        <button
                          onClick={handleTestSmtp}
                          disabled={testing || !integrations.smtpHost || !integrations.smtpUser}
                          className="flex items-center gap-3 bg-blue/10 border border-blue/20 text-blue px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className={`material-icons-outlined text-sm ${testing ? 'animate-spin' : ''}`}>
                            {testing ? 'refresh' : 'send'}
                          </span>
                          {testing ? 'Dispatching...' : 'Send Test Email'}
                        </button>
                      </div>

                      {/* Test Result Feedback */}
                      {testResult !== null && (
                        <div className={`rounded-2xl p-6 border flex items-start gap-4 animate-in fade-in duration-300 ${
                          testResult.success
                            ? 'bg-green/5 border-green/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}>
                          <span className={`material-icons-outlined text-2xl mt-0.5 ${testResult.success ? 'text-green' : 'text-red-400'}`}>
                            {testResult.success ? 'check_circle' : 'error_outline'}
                          </span>
                          <div>
                            <p className={`text-sm font-black italic ${testResult.success ? 'text-green' : 'text-red-400'}`}>
                              {testResult.success ? 'Mail Gateway Verified — Check your inbox!' : 'Connection Failed'}
                            </p>
                            {testResult.error && (
                              <p className="text-[11px] text-soft-grey mt-2 leading-relaxed font-mono">{testResult.error}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* SMS Integration */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                        <span className="material-icons-outlined text-gold">sms</span>
                      </div>
                      <h3 className="text-xl font-black italic">OTP Gateway (SMS)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Provider</label>
                        <select value={integrations.smsProvider} onChange={e => set('smsProvider', e.target.value)} className="glass-input w-full">
                          <option value="TWILIO">Twilio</option>
                          <option value="AFRICASTALKING">AfricasTalking</option>
                          <option value="INFOBIP">Infobip</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">API Secret / Key</label>
                        <input type="password" value={integrations.smsApiKey} onChange={e => set('smsApiKey', e.target.value)} className="glass-input w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'branding' && (
              <section className="bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-12 shadow-2xl relative overflow-hidden animate-in slide-in-from-left-4 duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="space-y-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                        <span className="material-icons-outlined text-white">branding_watermark</span>
                      </div>
                      <h3 className="text-xl font-black italic">Platform Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">Application Name</label>
                        <input type="text" value={branding.appName} onChange={e => setBranding({ ...branding, appName: e.target.value })} className="glass-input w-full" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">System Description</label>
                        <textarea value={branding.appDescription} onChange={e => setBranding({ ...branding, appDescription: e.target.value })} className="glass-input w-full h-32 resize-none" />
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                        <span className="material-icons-outlined text-white">image</span>
                      </div>
                      <h3 className="text-xl font-black italic">System Assets (High-Fidelity)</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <AssetUpload 
                        label="App Icon" 
                        desc="1024x1024 PNG" 
                        value={branding.appIcon}
                        onUpload={(url: string) => setBranding({...branding, appIcon: url})}
                      />
                      <AssetUpload 
                        label="Splash Screen Icon" 
                        desc="512x512 PNG (Transparent)" 
                        value={branding.splashIcon}
                        onUpload={(url: string) => setBranding({...branding, splashIcon: url})}
                      />
                      <AssetUpload 
                        label="Full Sidebar Logo" 
                        desc="300x100 SVG/PNG" 
                        value={branding.logoFull}
                        onUpload={(url: string) => setBranding({...branding, logoFull: url})}
                      />
                      <AssetUpload 
                        label="Collapsed Sidebar (Square)" 
                        desc="128x128 SVG/PNG" 
                        value={branding.logoSquare}
                        onUpload={(url: string) => setBranding({...branding, logoSquare: url})}
                      />
                      <div className="md:col-span-2">
                        <AssetUpload 
                          label="Landscape Branding (Landing Page)" 
                          desc="1200x400 SVG/PNG" 
                          value={branding.logoLandscape}
                          onUpload={(url: string) => setBranding({...branding, logoLandscape: url})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Status & Tips */}
          <div className="xl:col-span-4 space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
              <h3 className="text-xl font-black italic">Protocol Status</h3>
              <div className="space-y-6">
                <StatusLine label="AI Vision Node" active={!!integrations.openRouterKey} />
                <StatusLine label="Mail Gateway" active={!!integrations.smtpHost && !!integrations.smtpUser} />
                <StatusLine label="From Identity" active={!!integrations.smtpFromName && !!integrations.smtpFromEmail} />
                <StatusLine label="SMS Gateway" active={!!integrations.smsApiKey} />
              </div>
            </section>

            {/* SMTP Quick Guide */}
            <section className="bg-blue/10 border border-blue/20 rounded-[3rem] p-10 space-y-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <span className="material-icons-outlined text-blue">info</span>
                <h4 className="text-sm font-black uppercase tracking-widest">SMTP Quick Guide</h4>
              </div>
              <div className="space-y-4 text-[10px] text-soft-grey leading-relaxed uppercase tracking-wider font-bold">
                <p>🔷 <span className="text-white">Gmail:</span> Enable 2FA → Generate App Password at myaccount.google.com/apppasswords</p>
                <p>🔷 <span className="text-white">Outlook:</span> Use smtp-mail.outlook.com, Port 587</p>
                <p>🔷 <span className="text-white">Port 587</span> = TLS (Recommended for most providers)</p>
                <p>🔷 <span className="text-white">Port 465</span> = SSL (Legacy, some providers only)</p>
              </div>
            </section>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}

function AssetUpload({ label, desc, value, onUpload }: any) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/merchant/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpload(res.data.url);
    } catch (err) {
      console.error('Asset upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-soft-grey uppercase tracking-[0.3em] px-2">{label}</label>
      <div className="relative group">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="w-full h-40 bg-navy/60 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 group-hover:border-green/40 transition-all overflow-hidden relative">
          {value ? (
            <>
              <img src={`${api.defaults.baseURL}${value}`} className="w-full h-full object-contain p-4" alt={label} />
              <div className="absolute inset-0 bg-navy/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-black uppercase text-white tracking-widest">Replace Asset</span>
              </div>
            </>
          ) : (
            <>
              <span className={`material-icons-outlined ${uploading ? 'animate-spin' : 'text-soft-grey group-hover:text-green'}`}>
                {uploading ? 'refresh' : 'cloud_upload'}
              </span>
              <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">{desc}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusLine({ label, active }: any) {
  return (
    <div className="flex justify-between items-center px-2 pb-4 border-b border-white/5">
      <span className="text-[11px] font-black text-soft-grey uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${active ? 'bg-green animate-pulse' : 'bg-red-400'}`} />
        <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-green' : 'text-red-400'}`}>
          {active ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>
    </div>
  );
}
