import React from 'react';
import { ShieldCheck, Scale, Lock, Sparkles, HelpCircle, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const {
    setActiveView,
    setIsShortcutsModalOpen,
    setIsPricingModalOpen,
    setIsDownloadModalOpen,
  } = useApp();

  return (
    <footer className="border-t border-slate-800/80 bg-[#060a14] py-6 px-4 sm:px-8 text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-xs shadow-sm">
              N
            </div>
            <span className="font-extrabold text-white text-sm">NEXVORA AI</span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-slate-400 text-[11px]">
            Your Business. Your Intelligence. Your Growth.
          </span>
        </div>

        {/* Legal & Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveView('legal')}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-300 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('legal')}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-300 transition"
          >
            <Scale className="h-3.5 w-3.5 text-indigo-400" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('legal')}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-300 transition"
          >
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Security & RLS</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPricingModalOpen(true)}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            Pricing & Plans
          </button>

          <button
            type="button"
            onClick={() => setIsShortcutsModalOpen(true)}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            Shortcuts (?)
          </button>

          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 transition font-semibold"
          >
            Download App (PWA)
          </button>
        </div>

        {/* Compliance & Copyright */}
        <div className="text-[11px] text-slate-500 text-center md:text-right">
          <span>&copy; {new Date().getFullYear()} NEXVORA AI • NDPR &amp; GDPR Compliant</span>
        </div>
      </div>
    </footer>
  );
};
