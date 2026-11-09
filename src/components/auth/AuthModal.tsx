import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  ArrowRight,
  Shield,
  AlertCircle,
  Fingerprint,
  ScanFace,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  authenticateWithBiometrics,
  getStoredBiometricCredential,
  detectPlatformAuthenticatorName,
  StoredBiometricCredential,
} from '../../utils/webauthn';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginAsDemo, loginWithUser, updateProfile } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timeoutNotice, setTimeoutNotice] = useState<string | null>(() => {
    const notice = sessionStorage.getItem('nexvora_session_timeout');
    if (notice) {
      sessionStorage.removeItem('nexvora_session_timeout');
      return notice;
    }
    return null;
  });

  // WebAuthn Biometric States
  const [hasPlatformAuthenticator, setHasPlatformAuthenticator] = useState(false);
  const [storedBio, setStoredBio] = useState<StoredBiometricCredential | null>(null);
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const initBiometrics = async () => {
      if (isWebAuthnSupported()) {
        const available = await isPlatformAuthenticatorAvailable();
        setHasPlatformAuthenticator(available);
        const stored = getStoredBiometricCredential();
        setStoredBio(stored);
      }
    };
    initBiometrics();
  }, [isAuthModalOpen]);

  const handleBiometricAuth = async () => {
    setIsVerifyingBio(true);
    setBioError(null);
    try {
      const result = await authenticateWithBiometrics(storedBio?.credentialId);
      if (result.success) {
        const activeEmail = storedBio?.userEmail || 'founder@nexvora.ai';
        const activeName = storedBio?.userDisplayName || 'Godson Mike';
        const userObj: UserProfile = {
          id: storedBio?.userId || 'founder_demo_01',
          email: activeEmail,
          fullName: activeName,
          businessName: `${activeName.split(' ')[0]} Enterprise`,
          businessType: 'B2B Software & Digital Commerce',
          country: 'Nigeria',
          currency: 'NGN',
          plan: 'PRO',
          createdAt: new Date().toISOString(),
        };
        loginWithUser(userObj);
      }
    } catch (err: any) {
      console.warn('Biometric verification cancelled or error:', err);
      if (err.name === 'NotAllowedError') {
        setBioError('Biometric prompt was cancelled or timed out. Tap again to retry.');
      } else {
        setBioError(err.message || 'Biometric verification failed. Please try password or demo login.');
      }
    } finally {
      setIsVerifyingBio(false);
    }
  };

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      setSuccessMessage('Password recovery instructions sent to ' + email);
      setTimeout(() => {
        setSuccessMessage(null);
        setMode('login');
      }, 2500);
      return;
    }

    if (mode === 'register') {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        fullName: fullName || 'Founder',
        businessName: businessName || 'My Enterprise',
        businessType: 'General Commerce',
        country: 'Nigeria',
        currency: 'NGN',
        plan: 'FREE',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('nexvora_active_user', JSON.stringify(newUser));
      localStorage.setItem('nexvora_last_active', Date.now().toString());
      localStorage.removeItem('nexvora_timed_out');
      window.location.reload();
      return;
    }

    // Login mode
    if (email) {
      const loggedUser: UserProfile = {
        id: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        fullName: email.split('@')[0],
        businessName: `${email.split('@')[0]} Ventures`,
        businessType: 'Digital Commerce',
        country: 'Nigeria',
        currency: 'NGN',
        plan: 'PRO',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('nexvora_active_user', JSON.stringify(loggedUser));
      localStorage.setItem('nexvora_last_active', Date.now().toString());
      localStorage.removeItem('nexvora_timed_out');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-[#090f1f] p-6 sm:p-8 shadow-2xl">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-md shadow-blue-500/20 text-white font-black text-sm">
            N
          </div>
          <h2 className="text-xl font-black text-white">
            {mode === 'login'
              ? 'Sign in to NEXVORA AI'
              : mode === 'register'
              ? 'Create Your Enterprise Account'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Access your private invoices, financial analytics, and AI suite.'
              : mode === 'register'
              ? 'Join founders and business leaders across Nigeria and globally.'
              : 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* WebAuthn Biometric 1-Tap Sign In */}
        {mode === 'login' && hasPlatformAuthenticator && (
          <div className="mt-5 space-y-2">
            <button
              type="button"
              disabled={isVerifyingBio}
              onClick={handleBiometricAuth}
              className="flex w-full items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-indigo-600/20 border border-cyan-400/50 py-3 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/30 hover:border-cyan-300 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
            >
              {isVerifyingBio ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              ) : (
                <Fingerprint className="h-4 w-4 text-cyan-400" />
              )}
              <span>
                {isVerifyingBio
                  ? 'Verifying Biometric Sensor...'
                  : storedBio
                  ? `Sign in with ${storedBio.deviceName || 'Biometrics'} (${storedBio.userEmail})`
                  : '1-Tap Biometric Sign In (Touch ID / Fingerprint / Face)'}
              </span>
            </button>
            {storedBio && (
              <p className="text-[10px] text-center text-slate-400">
                Key registered for <span className="text-cyan-400 font-medium">{storedBio.userEmail}</span>
              </p>
            )}
            {bioError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 text-[11px] text-rose-300 flex items-center justify-between">
                <span>{bioError}</span>
                <button
                  type="button"
                  onClick={() => setBioError(null)}
                  className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* 1-Click Demo Founder Login Button */}
        <div className="mt-3">
          <button
            type="button"
            onClick={loginAsDemo}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900/80 border border-slate-700/80 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Instant Demo Founder Login (Pre-Loaded Data)</span>
          </button>
        </div>

        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Or With Email
          </span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {timeoutNotice && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-300 flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-200 block">Security Session Timeout</span>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">{timeoutNotice}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Godson Mike"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business / Company Name
                </label>
                <div className="relative">
                  <Building className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. VoraTech Solutions Ltd"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@nexvora.ai"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:from-blue-500 hover:to-cyan-400"
          >
            <span>
              {mode === 'login'
                ? 'Sign In to Workspace'
                : mode === 'register'
                ? 'Register Business'
                : 'Send Recovery Link'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
