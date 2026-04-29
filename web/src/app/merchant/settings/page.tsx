'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/Shell';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';

export default function MerchantSettingsPage() {
  const { showNotification } = useNotification();
  const [merchant, setMerchant] = useState<any>(null);
  const [formData, setFormData] = useState({
    business_name: '',
    website: '',
    branding_color: '#16C66E',
    business_type: 'INDEPENDENT',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMerchant();
  }, []);

  const fetchMerchant = async () => {
    try {
      const res = await api.get('/merchant/profile');
      setMerchant(res.data);
      setFormData({
        business_name: res.data.business_name,
        website: res.data.website || '',
        branding_color: res.data.branding_color || '#16C66E',
        business_type: res.data.business_type || 'INDEPENDENT',
      });
    } catch (err) {
      console.error('Failed to fetch merchant', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/merchant/profile', formData);
      showNotification('Merchant branding updated!', 'success');
    } catch (err) {
      showNotification('Update failed', 'error');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await api.post('/merchant/branding/logo', { logo: base64String });
        showNotification('Business logo updated!', 'success');
        fetchMerchant();
      } catch (err) {
        showNotification('Upload failed', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-3xl font-black italic">Merchant Branding</h3>
          <span className="bg-blue/10 text-blue text-[10px] font-bold px-4 py-2 rounded-lg border border-blue/20 uppercase tracking-widest">
            Merchant ID: {merchant?.id?.substring(0, 8)}...
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Branding Form */}
          <div className="md:col-span-7 bg-teal/20 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
                <div className="relative group">
                  <div className="w-40 h-40 bg-navy/40 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                    {merchant?.logo_url ? (
                      <img src={merchant.logo_url} className="w-full h-full object-contain p-4" />
                    ) : (
                      <span className="material-icons-outlined text-soft-grey text-4xl">storefront</span>
                    )}
                  </div>
                  <label className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-all border-4 border-navy">
                    <span className="material-icons-outlined text-white text-sm">upload_file</span>
                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  </label>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold text-white">Business Logo</h4>
                  <p className="text-xs text-soft-grey">Recommended size: 512x512px. SVG or PNG preferred.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-soft-grey uppercase tracking-widest block mb-3">Business Name</label>
                  <input 
                    type="text" 
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full bg-navy/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-soft-grey uppercase tracking-widest block mb-3">Official Website</label>
                  <input 
                    type="url" 
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourbusiness.com"
                    className="w-full bg-navy/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-soft-grey uppercase tracking-widest block mb-3">Branding Color</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={formData.branding_color}
                      onChange={(e) => setFormData({ ...formData, branding_color: e.target.value })}
                      className="w-16 h-16 bg-transparent border-none cursor-pointer rounded-xl"
                    />
                    <input 
                      type="text" 
                      value={formData.branding_color}
                      onChange={(e) => setFormData({ ...formData, branding_color: e.target.value })}
                      className="flex-1 bg-navy/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue text-white font-black py-5 rounded-2xl shadow-xl shadow-blue/20 hover:scale-[1.02] transition-all"
              >
                SAVE BRANDING PROFILE
              </button>
            </form>

            {/* Business Structure Upgrade */}
            <div className="mt-12 pt-12 border-t border-white/5 space-y-8">
               <div className="flex justify-between items-start">
                  <div>
                     <h4 className="font-bold text-white italic">Business Structure</h4>
                     <p className="text-[10px] text-soft-grey uppercase tracking-widest mt-1">Current: {formData.business_type}</p>
                  </div>
                  {formData.business_type === 'INDEPENDENT' && (
                    <button 
                      onClick={() => setFormData({ ...formData, business_type: 'HEADQUARTERS' })}
                      className="text-[9px] font-black text-green border border-green/20 bg-green/5 px-4 py-2 rounded-xl hover:bg-green/10 transition-all uppercase tracking-widest"
                    >
                       Upgrade to HQ
                    </button>
                  )}
               </div>
               
               <div className="bg-navy/40 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-soft-grey leading-relaxed">
                    {formData.business_type === 'HEADQUARTERS' 
                      ? 'This business is registered as a HEADQUARTERS. You can create branches and manage team permissions at scale.' 
                      : 'Independent businesses operate as single entities. Upgrade to HEADQUARTERS to enable multi-branch support and aggregated oversight.'}
                  </p>
               </div>
            </div>
          </div>

          {/* Preview / Live View */}
          <div className="md:col-span-5 space-y-8">
            <h4 className="text-sm font-bold text-soft-grey uppercase tracking-widest px-2">Checkout Preview</h4>
            <div className="bg-white rounded-[2.5rem] p-8 text-navy shadow-2xl relative">
              <div 
                className="absolute top-0 left-0 w-full h-2 rounded-t-[2.5rem]" 
                style={{ backgroundColor: formData.branding_color }}
              ></div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center">
                  {merchant?.logo_url ? (
                    <img src={merchant.logo_url} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="material-icons-outlined text-navy/40 text-sm">storefront</span>
                  )}
                </div>
                <span className="font-bold text-sm">{formData.business_name || 'Your Business'}</span>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xs font-bold opacity-60">
                  <span>Product Total</span>
                  <span>$1,250.00</span>
                </div>
                <div className="flex justify-between text-lg font-black italic">
                  <span>Pay with Generex</span>
                  <span>$1,250.00</span>
                </div>
              </div>
              <button 
                className="w-full py-4 rounded-xl text-white font-black text-sm shadow-xl"
                style={{ backgroundColor: formData.branding_color }}
              >
                CONFIRM PAYMENT
              </button>
            </div>

            <div className="bg-blue/10 border border-blue/20 rounded-3xl p-8">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-icons-outlined text-blue">verified</span>
                Verified Merchant
              </h4>
              <p className="text-[10px] text-soft-grey leading-relaxed">Your branding will be visible on all hosted checkout pages and payment receipts.</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
