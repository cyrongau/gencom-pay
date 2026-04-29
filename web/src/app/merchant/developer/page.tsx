'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

export default function MerchantDeveloperPortal() {
  const { showNotification } = useNotification();
  const [keys, setKeys] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [revealKeyId, setRevealKeyId] = useState<string | null>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchDeveloperConfigs();
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll logs
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/merchant/webhooks/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const fetchDeveloperConfigs = async () => {
    try {
      const [keysRes, hookRes] = await Promise.all([
        api.get('/merchant/profile').then(res => res.data.api_keys || []),
        api.get('/merchant/webhooks')
      ]);
      setKeys(keysRes);
      setWebhookUrl(hookRes.data?.url || '');
    } catch (err) {
      console.error('Failed to fetch dev configs', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewKey = async () => {
    const label = prompt('Enter a label for this key (e.g. Production Mobile App):');
    if (!label) return;
    try {
      await api.post('/merchant/keys', { name: label });
      showNotification('New API key protocol generated', 'success');
      fetchDeveloperConfigs();
    } catch (err) {
      showNotification('Key generation failed', 'error');
    }
  };

  const saveWebhook = async () => {
    try {
      await api.post('/merchant/webhooks', { url: webhookUrl, events: ['payment.success', 'settlement.completed'] });
      showNotification('Webhook endpoint authorized', 'success');
    } catch (err) {
      showNotification('Webhook configuration failed', 'error');
    }
  };

  const sendTestEvent = async (eventType: string) => {
    setSimulating(true);
    try {
      await api.post('/merchant/webhooks/test', { eventType });
      showNotification(`Simulation: ${eventType} dispatched`, 'success');
      setTimeout(fetchLogs, 1000);
    } catch (err) {
      showNotification('Simulation failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        <div className="px-4">
           <h1 className="text-5xl font-black text-white italic tracking-tighter">Developer Portal</h1>
           <p className="text-sm font-medium text-soft-grey uppercase tracking-[0.2em] mt-2">API Integration & Webhook Oversight</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mx-4">
           
           {/* API Keys Management */}
           <div className="lg:col-span-7 space-y-8">
              <div className="flex justify-between items-end">
                 <h3 className="text-2xl font-black italic">Security Protocols</h3>
                 <button 
                   onClick={generateNewKey}
                   className="bg-green text-navy px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                 >
                    + Generate New Key
                 </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                       <tr className="text-[10px] font-black text-soft-grey uppercase tracking-widest">
                          <th className="p-8">Key Label</th>
                          <th className="p-8">Token Preview</th>
                          <th className="p-8 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {keys.map((key) => (
                          <tr key={key.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                             <td className="p-8">
                                <span className="font-black text-white italic">{key.key_name || key.label}</span>
                             </td>
                             <td className="p-8 font-mono text-xs text-white/40">
                                {revealKeyId === key.id ? key.client_id : '••••••••••••••••'}
                             </td>
                             <td className="p-8 text-right">
                                <button 
                                  onClick={() => setRevealKeyId(revealKeyId === key.id ? null : key.id)}
                                  className="text-green text-[10px] font-black uppercase tracking-widest hover:underline mr-4"
                                >
                                   {revealKeyId === key.id ? 'Hide' : 'Reveal'}
                                </button>
                                <button className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:underline">Revoke</button>
                             </td>
                          </tr>
                       ))}
                       {keys.length === 0 && (
                         <tr>
                            <td colSpan={3} className="p-20 text-center text-soft-grey italic text-xs uppercase tracking-widest opacity-30">No active API keys found</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>

              {/* Webhook Logs */}
              <div className="space-y-8 mt-12">
                 <h3 className="text-2xl font-black italic">Recent Deliveries</h3>
                 <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-white/5 border-b border-white/5">
                          <tr className="text-[10px] font-black text-soft-grey uppercase tracking-widest">
                             <th className="p-8">Event Type</th>
                             <th className="p-8">Destination</th>
                             <th className="p-8">Status</th>
                             <th className="p-8 text-right">Time</th>
                          </tr>
                       </thead>
                       <tbody className="text-sm">
                          {logs.map((log) => (
                             <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                                <td className="p-8">
                                   <span className="font-mono text-xs text-green">{log.event_type}</span>
                                </td>
                                <td className="p-8 font-mono text-[10px] text-white/40 truncate max-w-[150px]">
                                   {webhookUrl}
                                </td>
                                <td className="p-8">
                                   <span className={`text-[9px] font-black px-3 py-1 rounded-full ${log.delivery_status === 'SUCCESS' ? 'bg-green/10 text-green' : 'bg-red-400/10 text-red-400'}`}>
                                      {log.delivery_status} ({log.response_status})
                                   </span>
                                </td>
                                <td className="p-8 text-right text-soft-grey text-[10px]">
                                   {new Date(log.created_at).toLocaleTimeString()}
                                </td>
                             </tr>
                          ))}
                          {logs.length === 0 && (
                             <tr>
                                <td colSpan={4} className="p-20 text-center text-soft-grey italic text-xs uppercase tracking-widest opacity-30">No webhook delivery logs recorded</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Webhook Configuration & Sandbox */}
           <div className="lg:col-span-5 space-y-12">
              <div className="space-y-8">
                 <h3 className="text-2xl font-black italic">Webhook Bridge</h3>
                 <div className="bg-[#0F3D3A]/20 border border-green/20 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Payload Destination URL</label>
                       <input 
                         type="url" 
                         value={webhookUrl}
                         onChange={(e) => setWebhookUrl(e.target.value)}
                         placeholder="https://api.yourdomain.com/webhooks/gencom"
                         className="w-full bg-navy/60 border border-white/10 rounded-2xl p-5 text-white font-mono text-xs"
                       />
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest">Subscribed Events</p>
                       <div className="grid grid-cols-1 gap-3">
                          <EventToggle label="payment.success" checked={true} />
                          <EventToggle label="payment.failed" checked={true} />
                          <EventToggle label="settlement.completed" checked={true} />
                       </div>
                    </div>

                    <button 
                      onClick={saveWebhook}
                      className="w-full bg-green text-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-green/20 hover:scale-[1.02] transition-all"
                    >
                       AUTHORIZE ENDPOINT
                    </button>
                 </div>
              </div>

              {/* Webhook Simulator (Sandbox) */}
              <div className="space-y-8">
                 <h3 className="text-2xl font-black italic">Webhook Simulator</h3>
                 <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                    <p className="text-xs text-soft-grey leading-relaxed">Trigger mock events to verify your integration's handling of the Gencom protocol. These payloads include secure HMAC signatures.</p>
                    
                    <div className="space-y-4">
                       <button 
                         disabled={simulating}
                         onClick={() => sendTestEvent('payment.succeeded')}
                         className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-2xl font-bold text-xs flex justify-between items-center hover:bg-white/10 transition-all"
                       >
                          <span>Simulate `payment.succeeded`</span>
                          <span className="material-icons-outlined text-sm text-green">bolt</span>
                       </button>
                       <button 
                         disabled={simulating}
                         onClick={() => sendTestEvent('kyc.verified')}
                         className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-2xl font-bold text-xs flex justify-between items-center hover:bg-white/10 transition-all"
                       >
                          <span>Simulate `kyc.verified`</span>
                          <span className="material-icons-outlined text-sm text-green">verified_user</span>
                       </button>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </Shell>
  );
}

function EventToggle({ label, checked }: any) {
  return (
    <div className="flex justify-between items-center bg-navy/40 border border-white/5 p-4 rounded-xl">
       <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
       <div className={`w-10 h-5 rounded-full relative transition-all ${checked ? 'bg-green' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'right-1' : 'left-1'}`}></div>
       </div>
    </div>
  );
}
