'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CryptoPage() {
  const { user, loading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [selectedNetwork, setSelectedNetwork] = useState('MAINNET');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [generating, setGenerating] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [mockAmount, setMockAmount] = useState('0.05');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    fetchAddresses();
  }, [user, loading, router]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/crypto/addresses');
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const handleGenerateAddress = async () => {
    setGenerating(true);
    try {
      await api.post('/crypto/addresses', { 
        currency: selectedCurrency, 
        network: selectedNetwork 
      });
      fetchAddresses();
    } catch (err) {
      console.error('Failed to generate address', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleMockDeposit = async () => {
    setDepositing(true);
    try {
      await api.post('/crypto/deposit/mock', { 
        currency: selectedCurrency, 
        amount: mockAmount 
      });
      showNotification('Mock deposit successful! Check your wallet balance.', 'success');
    } catch (err) {
      console.error('Failed to process mock deposit', err);
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount) return;
    setWithdrawing(true);
    try {
      const res = await api.post('/crypto/withdraw', {
        currency: selectedCurrency,
        amount: withdrawAmount,
        toAddress: withdrawAddress,
        network: selectedNetwork
      });
      showNotification(`Withdrawal initiated! Transaction ID: ${res.data.transaction_id}`, 'success');
      setWithdrawAmount('');
      setWithdrawAddress('');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Withdrawal failed', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const currentAddress = addresses.find(a => a.currency === selectedCurrency && a.network === selectedNetwork);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-foreground selection:bg-green/30 pb-20">
      {/* Header */}
      <header className="bg-navy/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-soft-grey hover:text-white transition-colors">
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-signature">
              Crypto Assets
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue/10 px-3 py-1 rounded-full border border-blue/20">
              <span className="text-xs font-bold text-blue uppercase tracking-widest">Web3 Integrated</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Asset Selection */}
          <section className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-teal/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Select Asset</h2>
              <div className="space-y-3">
                {[
                  { name: 'Bitcoin', code: 'BTC', network: 'MAINNET', icon: 'currency_bitcoin', color: 'text-orange-400' },
                  { name: 'Tether', code: 'USDT', network: 'ERC20', icon: 'payments', color: 'text-green' },
                  { name: 'Ethereum', code: 'ETH', network: 'ERC20', icon: 'hub', color: 'text-blue' },
                ].map((asset) => (
                  <button
                    key={asset.code}
                    onClick={() => {
                      setSelectedCurrency(asset.code);
                      setSelectedNetwork(asset.network);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      selectedCurrency === asset.code 
                        ? 'bg-white/10 border-white/20' 
                        : 'bg-navy/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-icons-outlined ${asset.color}`}>{asset.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{asset.name}</p>
                        <p className="text-[10px] text-soft-grey">{asset.network}</p>
                      </div>
                    </div>
                    {selectedCurrency === asset.code && (
                      <span className="material-icons-outlined text-green text-sm">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Controls (Mock) */}
            <div className="bg-blue/10 border border-blue/20 rounded-[2rem] p-8">
              <h3 className="text-sm font-bold text-blue mb-4 flex items-center gap-2">
                <span className="material-icons-outlined text-sm">science</span>
                Simulate Deposit
              </h3>
              <div className="space-y-4">
                <input 
                  type="number" 
                  value={mockAmount}
                  onChange={(e) => setMockAmount(e.target.value)}
                  className="w-full bg-navy/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue transition-colors"
                  placeholder="Amount"
                />
                <button 
                  onClick={handleMockDeposit}
                  disabled={depositing || !currentAddress}
                  className="w-full bg-blue text-white text-xs font-bold py-3 rounded-xl hover:bg-blue/80 transition-all disabled:opacity-50"
                >
                  {depositing ? 'Processing...' : 'Simulate On-chain Deposit'}
                </button>
              </div>
            </div>
          </section>

          {/* Deposit / Withdrawal View */}
          <section className="col-span-12 lg:col-span-8">
            <div className="bg-teal/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-1 shadow-2xl h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="flex p-2 gap-2 border-b border-white/5">
                <button 
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'deposit' ? 'bg-white/10 text-white' : 'text-soft-grey hover:text-white'
                  }`}
                >
                  Deposit
                </button>
                <button 
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'withdraw' ? 'bg-white/10 text-white' : 'text-soft-grey hover:text-white'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              <div className="flex-1 p-10 flex flex-col justify-center items-center text-center">
                {activeTab === 'deposit' ? (
                  currentAddress ? (
                    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                      <div className="mb-8 p-6 bg-white rounded-3xl inline-block shadow-2xl shadow-white/5">
                        {/* Placeholder for QR Code */}
                        <div className="w-48 h-48 bg-navy flex items-center justify-center rounded-2xl">
                          <span className="material-icons-outlined text-white text-6xl">qr_code_2</span>
                        </div>
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-2">Your {selectedCurrency} Address</h2>
                      <p className="text-xs text-soft-grey mb-8 uppercase tracking-widest">Network: {selectedNetwork}</p>
                      
                      <div className="bg-navy/60 p-4 rounded-2xl border border-white/10 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all">
                        <code className="text-sm font-mono text-blue break-all text-left pr-4">
                          {currentAddress.address}
                        </code>
                        <button className="text-soft-grey group-hover:text-white transition-colors">
                          <span className="material-icons-outlined">content_copy</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <span className="material-icons-outlined text-soft-grey text-4xl">account_balance_wallet</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-4">No Deposit Address Yet</h2>
                      <button 
                        onClick={handleGenerateAddress}
                        disabled={generating}
                        className="bg-gradient-signature text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-green/20 hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {generating ? 'Generating...' : `Generate ${selectedCurrency} Address`}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500 text-left">
                    <h2 className="text-2xl font-bold mb-6">Send {selectedCurrency}</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-soft-grey uppercase tracking-widest block mb-2">Recipient Address</label>
                        <input 
                          type="text"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder={`Enter ${selectedCurrency} address`}
                          className="w-full bg-navy/40 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-blue transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-soft-grey uppercase tracking-widest block mb-2">Amount</label>
                        <div className="relative">
                          <input 
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-navy/40 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-blue transition-colors"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-soft-grey">{selectedCurrency}</span>
                        </div>
                        <p className="mt-2 text-[10px] text-soft-grey">Network Fee: {selectedCurrency === 'BTC' ? '0.0001 BTC' : '5 USDT'}</p>
                      </div>
                      <button 
                        onClick={handleWithdraw}
                        disabled={withdrawing || !withdrawAddress || !withdrawAmount}
                        className="w-full bg-gradient-signature text-white font-bold py-5 rounded-2xl shadow-xl shadow-green/20 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {withdrawing ? 'Processing...' : 'Review & Send'}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex items-center gap-2 justify-center text-gold/80 max-w-sm">
                  <span className="material-icons-outlined text-sm">warning</span>
                  <p className="text-[10px] font-medium italic">
                    {activeTab === 'deposit' 
                      ? `Only send ${selectedCurrency} to this address. Using the wrong network may result in loss of funds.`
                      : `Double check the recipient address. On-chain transactions cannot be reversed once broadcast.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
    </div>
  );
}
