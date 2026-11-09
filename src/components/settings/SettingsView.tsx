import React, { useState, useEffect } from 'react';
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
  Fingerprint,
  ScanFace,
  Trash2,
  Shield,
  Loader2,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTheme, CurrencyCode } from '../../types';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometricAuthenticator,
  authenticateWithBiometrics,
  getStoredBiometricCredential,
  removeBiometricCredential,
  detectPlatformAuthenticatorName,
  StoredBiometricCredential,
} from '../../utils/webauthn';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, currency, setCurrency, theme, setTheme, systemStatus, refreshStatus, showToast, logout } = useApp();

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

  // WebAuthn Biometric Management State
  const [isBioSupported, setIsBioSupported] = useState(false);
  const [hasPlatformAuth, setHasPlatformAuth] = useState(false);
  const [storedBio, setStoredBio] = useState<StoredBiometricCredential | null>(null);
  const [isEnrollingBio, setIsEnrollingBio] = useState(false);
  const [isTestingBio, setIsTestingBio] = useState(false);

  useEffect(() => {
    const initBiometrics = async () => {
      const supported = isWebAuthnSupported();
      setIsBioSupported(supported);
      if (supported) {
        const platform = await isPlatformAuthenticatorAvailable();
        setHasPlatformAuth(platform);
        setStoredBio(getStoredBiometricCredential());
      }
    };
    initBiometrics();
  }, []);

  const handleEnrollBiometrics = async () => {
    setIsEnrollingBio(true);
    try {
      const cred = await registerBiometricAuthenticator({
        userId: user?.id || `user_${Date.now()}`,
        userEmail: user?.email || 'founder@nexvora.ai',
        userDisplayName: user?.fullName || 'Godson Mike',
      });
      setStoredBio(cred);
      showToast({
        type: 'success',
        title: 'Biometrics Enrolled!',
        message: `${cred.deviceName} is now linked for 1-tap sign in.`,
      });
    } catch (err: any) {
      console.warn('Biometric registration error:', err);
      showToast({
        type: 'error',
        title: 'Enrollment Cancelled',
        message: err.name === 'NotAllowedError'
          ? 'Sensor prompt was cancelled or timed out.'
          : (err.message || 'Could not register biometric key.'),
      });
    } finally {
      setIsEnrollingBio(false);
    }
  };

  const handleTestBiometrics = async () => {
    setIsTestingBio(true);
    try {
      const res = await authenticateWithBiometrics(storedBio?.credentialId);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Biometric Verified!',
          message: 'Hardware sensor successfully authenticated your identity.',
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Verification Failed',
        message: err.name === 'NotAllowedError'
          ? 'Biometric verification cancelled.'
          : (err.message || 'Sensor verification failed.'),
      });
    } finally {
      setIsTestingBio(false);
    }
  };

  const handleRemoveBiometrics = () => {
    removeBiometricCredential();
    setStoredBio(null);
    showToast({
      type: 'info',
      title: 'Biometric Key Removed',
      message: 'Hardware key removed from this device. You can re-enroll anytime.',
    });
  };

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
          {/* WebAuthn Biometric Security & Passkeys */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#090f1f] p-5 space-y-4 shadow-xl shadow-cyan-500/5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Fingerprint className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Biometrics & Passkeys</h3>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  hasPlatformAuth
                    ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400'
                }`}
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    hasPlatformAuth ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                {hasPlatformAuth ? 'Sensor Active' : 'Ready'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use WebAuthn hardware-backed biometrics (Fingerprint, Touch ID, Face ID) for instant, passwordless sign in on your phone or laptop.
            </p>

            {storedBio ? (
              <div className="space-y-3 rounded-xl border border-cyan-500/20 bg-cyan-950/15 p-3.5">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">{storedBio.deviceName}</span>
                    </div>
                    <p className="text-[11px] text-cyan-300">
                      Enrolled: <span className="text-slate-200">{storedBio.userEmail}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Algorithm: ES256 • ID: {storedBio.credentialId.slice(0, 16)}...
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveBiometrics}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition"
                    title="Remove Biometric Key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 pt-1 border-t border-cyan-500/20">
                  <button
                    type="button"
                    disabled={isTestingBio}
                    onClick={handleTestBiometrics}
                    className="flex flex-1 items-center justify-center space-x-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition disabled:opacity-50"
                  >
                    {isTestingBio ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    ) : (
                      <ScanFace className="h-3.5 w-3.5 text-cyan-400" />
                    )}
                    <span>Test Sensor Verification</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isEnrollingBio}
                  onClick={handleEnrollBiometrics}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isEnrollingBio ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    <Fingerprint className="h-4 w-4 text-slate-950" />
                  )}
                  <span>
                    {isEnrollingBio
                      ? 'Touch Fingerprint Sensor...'
                      : 'Enroll This Device (Fingerprint / Face ID)'}
                  </span>
                </button>
              </div>
            )}
          </div>

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

          {/* Account Session & Sign Out Card */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-rose-500/20 pb-3">
              <LogOut className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Active Session &amp; Sign Out</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Signed in as <span className="text-white font-semibold">{user?.fullName || user?.email}</span> ({user?.businessName}).
              Signing out returns to the NEXVORA onboarding &amp; account creation screen.
            </p>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-rose-600/20 border border-rose-500/40 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-600/30 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
