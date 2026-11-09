import React from 'react';
import {
  Menu,
  Zap,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Globe,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const Navbar: React.FC = () => {
  const {
    user,
    currency,
    setCurrency,
    setIsPricingModalOpen,
    setIsAuthModalOpen,
    isMobileNavOpen,
    setIsMobileNavOpen,
    logout,
    systemStatus,
    setActiveView,
    setIsDownloadModalOpen,
  } = useApp();

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'NGN', label: 'NGN', symbol: '₦' },
    { code: 'USD', label: 'USD', symbol: '$' },
    { code: 'GBP', label: 'GBP', symbol: '£' },
    { code: 'EUR', label: 'EUR', symbol: '€' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080d1a]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/60 hover:text-white lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div
            onClick={() => setActiveView('dashboard')}
            className="flex cursor-pointer items-center space-x-2.5 transition hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  NEXVORA
                </span>
                <span className="rounded bg-gradient-to-r from-blue-500 to-cyan-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                  AI
                </span>
              </div>
              <p className="hidden text-[10px] font-medium tracking-wide text-cyan-400/90 sm:block">
                Your Business. Your Intelligence. Your Growth.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Currency, Plan, AI Status, User */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Currency Switcher */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 text-xs">
            <Globe className="ml-2 hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            {currencies.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`rounded-md px-2 py-1 font-semibold transition ${
                  currency === c.code
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Switch to ${c.label} (${c.symbol})`}
              >
                {c.symbol} <span className="hidden sm:inline">{c.label}</span>
              </button>
            ))}
          </div>

          {/* Visual Theme Switcher */}
          <ThemeSwitcher variant="compact" />

          {/* Download & Install App */}
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 hover:text-cyan-400 transition"
            title="Download & Install NEXVORA AI"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Subscription Tier Badge */}
          <button
            type="button"
            onClick={() => setIsPricingModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-900/40"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>{user?.plan || 'FREE'} PLAN</span>
            <span className="hidden text-[10px] font-normal text-cyan-400/80 md:inline">
              • Upgrade
            </span>
          </button>

          {/* User Account / Profile */}
          {user ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-xs font-bold text-white">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold leading-tight text-slate-200">
                    {user.businessName || user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400">{user.email}</div>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
              </button>

              {/* Dropdown Menu */}
              <div className="invisible absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-slate-800 bg-slate-900/95 py-1.5 shadow-xl backdrop-blur-md transition-all opacity-0 group-hover:visible group-hover:opacity-100 z-50">
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <p className="text-xs font-semibold text-white truncate">{user.businessName}</p>
                  <p className="text-[10px] text-cyan-400 truncate">{user.country} • {user.currency}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('settings')}
                  className="flex w-full items-center px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <User className="mr-2 h-3.5 w-3.5 text-slate-400" />
                  Account & CAC Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(true)}
                  className="flex w-full items-center px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Zap className="mr-2 h-3.5 w-3.5 text-cyan-400" />
                  Subscription Limits
                </button>
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="flex w-full items-center px-3 py-2 text-xs text-cyan-300 hover:bg-slate-800 hover:text-cyan-200"
                >
                  <Download className="mr-2 h-3.5 w-3.5 text-cyan-400" />
                  Download &amp; Install App
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
