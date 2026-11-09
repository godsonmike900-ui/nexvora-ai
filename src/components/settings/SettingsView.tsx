import React, { useState } from 'react';
import {
  Settings,
  Building,
  User,
  CreditCard,
  Database,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  Save,
  Globe,
  Sparkles,
  Server,
  Palette,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTheme, CurrencyCode } from '../../types';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, currency, setCurrency, theme, setTheme, systemStatus, refreshStatus } = useApp();

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'B2B Software & Digital Commerce');
  const [country, setCountry] = useState(user?.country || 'Nigeria');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [cacNumber, setCacNumber] = useState(user?.cacNumber || '');

  // Bank Details
  const [bankName, setBankName] = useState(user?.bankDetails?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.bankDetails?.accountNumber || '');
  const [accountName, setAccountName] = useState(user?.bankDetails?.accountName || '');
  const [swiftCode, setSwiftCode] = useState(user?.bankDetails?.swiftCode || '');

  const [isSaved, setIsSaved] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const sampleSchema = `-- NEXVORA AI Production Supabase Schema
-- RLS Enabled Tables: profiles, invoices, transactions, ai_generations
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  business_name TEXT NOT NULL,
  currency TEXT DEFAULT 'NGN',
  plan TEXT DEFAULT 'FREE'
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);`;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      businessName,
      fullName,
      businessType,
      country,
      phone,
      address,
      cacNumber,
      currency,
      theme,
      bankDetails: {
        bankName,
        accountNumber,
        accountName,
        swiftCode,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(sampleSchema);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Settings className="h-4 w-4" />
          <span>Workspace Configuration</span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
          Business Profile & Database
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your registered business identity, bank details for invoice settlement, and database infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Theme & Visual Appearance Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5">
            <ThemeSwitcher variant="full" />
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Business Information Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
                <Building className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Business Entity & Identity</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Founder / Authorized Officer
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CAC / Tax ID Number
                  </label>
                  <input
                    type="text"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    placeholder="e.g. RC-1849204 or BN-392810"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry / Business Type
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. B2B SaaS, E-Commerce, Logistics"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    <option value="NGN">NGN (₦ Nigerian Naira)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="GBP">GBP (£ British Pound)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Physical Commercial Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 14 Admiralty Way, Lekki Phase 1, Lagos"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Banking Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Banking Settlement Information (Printed on Invoices)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Zenith Bank PLC / GTBank"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 1018274920"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. VoraTech Solutions Ltd"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SWIFT / IBAN (For International Wire)
                  </label>
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="e.g. ZEIBNGLA"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition hover:from-blue-500 hover:to-cyan-400"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </button>

              {isSaved && (
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Info: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Diagnostics */}
          <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <Server className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">System Architecture</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">AI Model Provider:</span>
                <span className="font-semibold text-cyan-400">Gemini 3.8 Flash</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Database Layer:</span>
                <span className="font-semibold text-emerald-400">
                  {systemStatus?.database || 'Local Encrypted DB'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Security Policies:</span>
                <span className="font-semibold text-white">Row Level Security (RLS)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Server Backend:</span>
                <span className="font-semibold text-white">Node.js + Express API</span>
              </div>
            </div>
          </div>

          {/* Supabase Schema Viewer Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <Database className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Supabase Cloud Database</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              NEXVORA AI provides a complete production PostgreSQL schema with Row Level Security (`supabase-schema.sql`) for 1-click cloud sync.
            </p>

            <button
              type="button"
              onClick={() => setShowSqlSchema(!showSqlSchema)}
              className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>{showSqlSchema ? 'Hide SQL Script' : 'View SQL Schema'}</span>
            </button>

            {showSqlSchema && (
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <pre className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-black/60 p-3 text-[11px] font-mono text-cyan-300">
                    {sampleSchema}
                  </pre>
                  <button
                    type="button"
                    onClick={copySqlSchema}
                    className="absolute right-2 top-2 rounded bg-slate-800 p-1 text-slate-300 hover:text-white"
                    title="Copy SQL"
                  >
                    {sqlCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Full schema located at <code>/supabase-schema.sql</code> in root directory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
