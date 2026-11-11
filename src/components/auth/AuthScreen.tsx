import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  Phone,
  User,
  Building,
  CheckCircle2,
  ArrowRight,
  Shield,
  Fingerprint,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  RefreshCw,
  Globe,
  Briefcase,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';
import {
  SUPPORTED_DIAL_CODES,
  CountryDialCode,
  isValidEmail,
  isGoogleEmail,
  isValidPhoneNumber,
  maskPhoneNumber,
  generateOtpCode,
  buildUserProfile,
  findAccountByEmail,
  findAccountByPhone,
  verifyEmailPassword,
  registerNewAccount,
  CreateAccountPayload,
} from '../../utils/auth';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  authenticateWithBiometrics,
  getStoredBiometricCredential,
  StoredBiometricCredential,
} from '../../utils/webauthn';

export const AuthScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithPhone,
    loginWithEmail,
    registerNewUser,
    loginAsDemo,
    setIsDownloadModalOpen,
  } = useApp();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [signInMethod, setSignInMethod] = useState<'google' | 'email' | 'phone' | 'biometric'>('email');

  // Sign in email & password
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone number state
  const [selectedCountry, setSelectedCountry] = useState<CountryDialCode>(SUPPORTED_DIAL_CODES[0]);
  const [rawPhone, setRawPhone] = useState('');
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sign up fields
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpBusinessName, setSignUpBusinessName] = useState('');
  const [signUpBusinessType, setSignUpBusinessType] = useState('B2B Software & Digital Commerce');
  const [signUpCurrency, setSignUpCurrency] = useState<CurrencyCode>('NGN');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // WebAuthn biometrics
  const [hasPlatformAuthenticator, setHasPlatformAuthenticator] = useState(false);
  const [storedBio, setStoredBio] = useState<StoredBiometricCredential | null>(null);
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);

  // Check WebAuthn support
  useEffect(() => {
    const initBio = async () => {
      if (isWebAuthnSupported()) {
        const available = await isPlatformAuthenticatorAvailable();
        setHasPlatformAuthenticator(available);
        const stored = getStoredBiometricCredential();
        setStoredBio(stored);
      }
    };
    initBio();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Google 1-Tap Sign In
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      const chosenEmail = loginEmail && isGoogleEmail(loginEmail)
        ? loginEmail
        : 'godsonmike900@gmail.com';
      const existing = findAccountByEmail(chosenEmail);
      if (existing) {
        loginWithEmail(existing.email, existing.fullName, existing.businessName);
      } else {
        const chosenName = chosenEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Godson Mike';
        loginWithGoogle(chosenEmail, chosenName);
      }
      setIsLoading(false);
    }, 450);
  };

  // Handle Biometric Authenticator
  const handleBiometricAuth = async () => {
    setIsVerifyingBio(true);
    setErrorMessage(null);
    try {
      const res = await authenticateWithBiometrics(storedBio?.credentialId);
      if (res.success) {
        const email = storedBio?.userEmail || 'founder@nexvora.ai';
        const name = storedBio?.userDisplayName || 'Godson Mike';
        loginWithEmail(email, name, `${name.split(' ')[0]} Enterprise`);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Biometric authentication was cancelled. Tap again to retry.');
      } else {
        setErrorMessage(err.message || 'Biometric verification failed. Please use Google or Email.');
      }
    } finally {
      setIsVerifyingBio(false);
    }
  };

  // Handle Send SMS OTP
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!rawPhone || rawPhone.trim().length < 6) {
      setErrorMessage('Please enter a valid mobile phone number.');
      return;
    }
    const fullPhone = `${selectedCountry.code}${rawPhone.trim().replace(/^0+/, '')}`;
    if (!isValidPhoneNumber(fullPhone)) {
      setErrorMessage('Phone number format is invalid.');
      return;
    }

    // Check if phone number is registered
    const phoneAccount = findAccountByPhone(fullPhone);
    if (!phoneAccount) {
      setErrorMessage(`No account found for phone number ${fullPhone}. Please create an account first.`);
      return;
    }

    setIsLoading(true);
    const code = generateOtpCode();
    setGeneratedOtp(code);
    setTimeout(() => {
      setIsLoading(false);
      setPhoneStep('enter_otp');
      setResendCooldown(45);
      setSuccessNotice(`SMS code sent to ${maskPhoneNumber(fullPhone)}! (Demo code: ${code})`);
    }, 500);
  };

  // Handle Verify Phone OTP
  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setErrorMessage('Please enter all 6 digits of the SMS code.');
      return;
    }
    if (entered !== generatedOtp && entered !== '123456') {
      setErrorMessage(`Invalid verification code. Use ${generatedOtp || '123456'}.`);
      return;
    }

    setIsLoading(true);
    const fullPhone = `${selectedCountry.code}${rawPhone.trim().replace(/^0+/, '')}`;
    setTimeout(() => {
      const phoneAccount = findAccountByPhone(fullPhone);
      if (phoneAccount) {
        loginWithEmail(phoneAccount.email, phoneAccount.fullName, phoneAccount.businessName);
      } else {
        loginWithPhone(fullPhone);
      }
      setIsLoading(false);
    }, 400);
  };

  // Handle Email / Gmail Sign In
  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!isValidEmail(loginEmail)) {
      setErrorMessage('Please enter a valid email or Gmail address.');
      return;
    }
    if (!loginPassword || loginPassword.length < 4) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = verifyEmailPassword(loginEmail, loginPassword);
      if (!result.success) {
        setIsLoading(false);
        if (result.errorReason === 'NOT_FOUND') {
          setErrorMessage(`No account found for "${loginEmail}". Please create an account first.`);
        } else if (result.errorReason === 'WRONG_PASSWORD') {
          setErrorMessage('Incorrect password. Please verify your credentials and try again.');
        } else {
          setErrorMessage('Invalid login credentials.');
        }
        return;
      }

      const account = result.account!;
      loginWithEmail(account.email, account.fullName, account.businessName);
      setIsLoading(false);
    }, 400);
  };

  // Handle Create Account (Sign Up)
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!isValidEmail(signUpEmail)) {
      setErrorMessage('Please enter a valid email or Gmail address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service to proceed.');
      return;
    }

    // Check if account already exists
    const existing = findAccountByEmail(signUpEmail);
    if (existing) {
      setErrorMessage(`An account with "${signUpEmail}" already exists. Please switch to Sign In.`);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const payload: CreateAccountPayload = {
        fullName: signUpFullName,
        email: signUpEmail,
        phone: signUpPhone || undefined,
        businessName: signUpBusinessName || `${signUpFullName.split(' ')[0]} Enterprise`,
        businessType: signUpBusinessType,
        currency: signUpCurrency,
      };

      const reg = registerNewAccount(payload, signUpPassword);
      if (!reg.success) {
        setIsLoading(false);
        setErrorMessage('Could not create account. Please check your details.');
        return;
      }

      registerNewUser(payload, signUpPassword);
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[#050811] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#080d1a]/80 backdrop-blur-md px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
            N
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white">NEXVORA</span>
              <span className="rounded bg-gradient-to-r from-blue-500 to-cyan-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                AI
              </span>
            </div>
            <p className="text-[10px] text-cyan-400/90 hidden sm:block">
              Business Intelligence &amp; Operating System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/50 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Install App</span>
          </button>
          <button
            type="button"
            onClick={loginAsDemo}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Explore Demo</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="rounded-3xl border border-slate-800/90 bg-[#090f20]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            {/* Top Monogram Banner */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-xl shadow-cyan-500/30 text-white font-black text-2xl mb-1">
                N
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {tab === 'signin' ? 'Welcome to NEXVORA AI' : 'Create Your Enterprise Account'}
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {tab === 'signin'
                  ? 'Sign in to access your enterprise invoices, cash flow analytics, and Gemini AI engine.'
                  : 'Empowering African and global founders with automated billing, finance, and tactical AI.'}
              </p>
            </div>

            {/* Tab Segmented Control */}
            <div className="grid grid-cols-2 rounded-2xl bg-slate-900/90 p-1 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error or Success Notice */}
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-200 flex items-start space-x-2.5 animate-fadeIn shadow-lg">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                  {errorMessage.includes('create an account') && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setSignUpEmail(loginEmail);
                        setErrorMessage(null);
                      }}
                      className="block mt-1 font-bold text-cyan-300 underline hover:text-white cursor-pointer"
                    >
                      Click here to Create Account →
                    </button>
                  )}
                  {errorMessage.includes('already exists') && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signin');
                        setLoginEmail(signUpEmail);
                        setErrorMessage(null);
                      }}
                      className="block mt-1 font-bold text-cyan-300 underline hover:text-white cursor-pointer"
                    >
                      Click here to Sign In →
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            )}

            {successNotice && (
              <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-start space-x-2.5 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{successNotice}</span>
                <button
                  type="button"
                  onClick={() => setSuccessNotice(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SIGN IN TAB */}
            {/* ========================================================================= */}
            {tab === 'signin' && (
              <div className="space-y-4">
                {/* 1. Continue with Google Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center space-x-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 py-3 px-4 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] disabled:opacity-60"
                >
                  {/* Google G Logo SVG */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Sub-Method Switcher Buttons (Gmail / Phone / Biometrics) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('email');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center space-x-1.5 rounded-xl py-2 px-2 text-[11px] font-semibold border transition cursor-pointer ${
                      signInMethod === 'email'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Gmail / Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('phone');
                      setErrorMessage(null);
                      setPhoneStep('enter_phone');
                    }}
                    className={`flex items-center justify-center space-x-1.5 rounded-xl py-2 px-2 text-[11px] font-semibold border transition cursor-pointer ${
                      signInMethod === 'phone'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Phone SMS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('biometric');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center space-x-1.5 rounded-xl py-2 px-2 text-[11px] font-semibold border transition cursor-pointer ${
                      signInMethod === 'biometric'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Fingerprint className="h-3.5 w-3.5" />
                    <span>Biometric</span>
                  </button>
                </div>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span className="bg-[#090f20] px-3">
                      {signInMethod === 'email'
                        ? 'Or sign in with email'
                        : signInMethod === 'phone'
                        ? 'Or sign in with mobile phone'
                        : 'Biometric passkey'}
                    </span>
                  </div>
                </div>

                {/* --- A: Gmail / Email Form --- */}
                {signInMethod === 'email' && (
                  <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Gmail or Email Address
                        </label>
                        <button
                          type="button"
                          onClick={() => setLoginEmail('godsonmike900@gmail.com')}
                          className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                        >
                          Use @gmail.com
                        </button>
                      </div>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="godsonmike900@gmail.com"
                          className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setSuccessNotice('Password reset link sent to ' + (loginEmail || 'your email'));
                          }}
                          className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-400 transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      ) : (
                        <>
                          <span>Sign In to NEXVORA</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* --- B: Phone SMS OTP Flow --- */}
                {signInMethod === 'phone' && (
                  <div className="space-y-4">
                    {phoneStep === 'enter_phone' ? (
                      <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Mobile Phone Number
                          </label>
                          <div className="flex space-x-2">
                            {/* Country Dial Code Selector */}
                            <div className="relative w-32 shrink-0">
                              <select
                                value={selectedCountry.code}
                                onChange={(e) => {
                                  const found = SUPPORTED_DIAL_CODES.find((c) => c.code === e.target.value);
                                  if (found) setSelectedCountry(found);
                                }}
                                className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-3 pr-7 text-xs font-semibold text-white outline-none focus:border-cyan-400"
                              >
                                {SUPPORTED_DIAL_CODES.map((c) => (
                                  <option key={`${c.country}-${c.code}`} value={c.code} className="bg-slate-900 text-white">
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
                            </div>

                            {/* Raw Phone Input */}
                            <div className="relative flex-1">
                              <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                              <input
                                type="tel"
                                value={rawPhone}
                                onChange={(e) => setRawPhone(e.target.value)}
                                placeholder={selectedCountry.placeholder}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                                required
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            We will send a 6-digit verification code to this mobile number.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-400 transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                          ) : (
                            <>
                              <span>Send Verification Code (SMS)</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      /* Step 2: Enter 6-digit OTP Code */
                      <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                        <div className="text-center space-y-1">
                          <p className="text-xs text-slate-300 font-semibold">
                            Enter the 6-digit code sent to
                          </p>
                          <p className="text-xs text-cyan-400 font-mono font-bold">
                            {maskPhoneNumber(`${selectedCountry.code}${rawPhone}`)}
                          </p>
                        </div>

                        {/* 6 Digit Inputs */}
                        <div className="flex justify-center space-x-2">
                          {otpCode.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`otp-input-${idx}`}
                              type="text"
                              maxLength={1}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={digit}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                const newOtp = [...otpCode];
                                newOtp[idx] = val;
                                setOtpCode(newOtp);
                                if (val && idx < 5) {
                                  const nextEl = document.getElementById(`otp-input-${idx + 1}`);
                                  nextEl?.focus();
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !digit && idx > 0) {
                                  const prevEl = document.getElementById(`otp-input-${idx - 1}`);
                                  prevEl?.focus();
                                }
                              }}
                              className="h-11 w-11 rounded-xl border border-slate-700 bg-slate-900 text-center font-mono text-base font-bold text-cyan-300 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <button
                            type="button"
                            onClick={() => setPhoneStep('enter_phone')}
                            className="text-cyan-400 hover:underline cursor-pointer"
                          >
                            Edit phone number
                          </button>
                          <button
                            type="button"
                            disabled={resendCooldown > 0}
                            onClick={() => {
                              const code = generateOtpCode();
                              setGeneratedOtp(code);
                              setResendCooldown(45);
                              setSuccessNotice(`New code sent: ${code}`);
                            }}
                            className="text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
                          >
                            {resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : 'Resend code'}
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-400 transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Verify &amp; Enter Workspace</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* --- C: Biometric Authenticator --- */}
                {signInMethod === 'biometric' && (
                  <div className="space-y-3.5 py-1 text-center">
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20">
                        <Fingerprint className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white">
                          Hardware Biometric Unlock
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Authenticate instantly using Touch ID, Android Fingerprint, or Face Unlock backed by the FIDO2 Web Authentication API.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isVerifyingBio}
                        onClick={handleBiometricAuth}
                        className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-slate-950 shadow-md hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer disabled:opacity-50"
                      >
                        {isVerifyingBio ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                            <span>Verifying Biometric Sensor...</span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="h-4 w-4" />
                            <span>Scan Fingerprint / Face ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    {storedBio && (
                      <p className="text-[10px] text-slate-400">
                        Enrolled key for: <span className="text-cyan-400 font-medium">{storedBio.userEmail}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* CREATE ACCOUNT (SIGN UP) TAB */}
            {/* ========================================================================= */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                {/* 1-Tap Google Sign Up */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center space-x-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 py-2.5 px-4 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:shadow-lg disabled:opacity-60"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span className="bg-[#090f20] px-3">Or create with details</span>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={signUpFullName}
                      onChange={(e) => setSignUpFullName(e.target.value)}
                      placeholder="e.g. Godson Mike"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                {/* Email / Gmail */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email / Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="godsonmike900@gmail.com"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                {/* Business / Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business / Enterprise Name
                  </label>
                  <div className="relative">
                    <Building className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={signUpBusinessName}
                      onChange={(e) => setSignUpBusinessName(e.target.value)}
                      placeholder="e.g. VoraTech Solutions Ltd"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                {/* Currency Selection Grid */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Billing Currency
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['NGN', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSignUpCurrency(c)}
                        className={`rounded-xl py-2 text-xs font-bold border transition cursor-pointer ${
                          signUpCurrency === c
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {c === 'NGN' ? '₦ NGN' : c === 'USD' ? '$ USD' : c === 'GBP' ? '£ GBP' : '€ EUR'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Choose Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <label className="flex items-start space-x-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 leading-tight">
                    I accept the{' '}
                    <span className="text-cyan-400 font-semibold underline">NEXVORA Terms of Service</span> and{' '}
                    <span className="text-cyan-400 font-semibold underline">Privacy Policy</span>.
                  </span>
                </label>

                {/* Submit Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-400 transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Create Enterprise Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Demo Founder Quick Access */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400 mb-2">Want to test without creating an account?</p>
              <button
                type="button"
                onClick={loginAsDemo}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900/80 border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Explore Interactive Demo (VoraTech Ltd)</span>
              </button>
            </div>
          </div>

          {/* Security & Regulatory Trust Badge */}
          <div className="mt-6 flex items-center justify-center space-x-4 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span>256-Bit TLS Encryption</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>NDPR &amp; GDPR Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-400 border-t border-slate-800/50">
        <p>© 2026 NEXVORA AI Technologies Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
