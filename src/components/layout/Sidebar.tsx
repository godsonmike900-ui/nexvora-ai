import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Megaphone,
  PenTool,
  FileText,
  DollarSign,
  TrendingUp,
  Settings,
  X,
  Sparkles,
  Shield,
  HelpCircle,
  Keyboard,
  Download,
  LogOut,
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isMobileNavOpen,
    setIsMobileNavOpen,
    systemStatus,
    setIsPricingModalOpen,
    setIsShortcutsModalOpen,
    setIsDownloadModalOpen,
    user,
    logout,
  } = useApp();

  const navigationItems: {
    id: AppView;
    label: string;
    icon: React.ElementType;
    badge?: string;
    shortcut?: string;
  }[] = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, shortcut: 'Alt+1' },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'Live AI', shortcut: 'Alt+2' },
    { id: 'marketing', label: 'Marketing Studio', icon: Megaphone, shortcut: 'Alt+3' },
    { id: 'writer', label: 'Business Writer', icon: PenTool, shortcut: 'Alt+4' },
    { id: 'invoices', label: 'Invoice Generator', icon: FileText, shortcut: 'Alt+5' },
    { id: 'finance', label: 'Sales & Expenses', icon: DollarSign, shortcut: 'Alt+6' },
    { id: 'analytics', label: 'Business Analytics', icon: TrendingUp, shortcut: 'Alt+7' },
    { id: 'settings', label: 'Settings & Database', icon: Settings, shortcut: 'Alt+8' },
  ];

  const handleSelect = (id: AppView) => {
    setActiveView(id);
    setIsMobileNavOpen(false);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Business OS
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-4 w-4 transition ${
                        isActive
                          ? 'text-cyan-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60">
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <span className="opacity-0 group-hover:opacity-100 font-mono text-[9px] text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800 transition-opacity">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Plan Info Card */}
        <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-[#0c1427] p-3.5 shadow-sm">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">
              {user?.plan || 'FREE'} Tier Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            AI powered by Gemini 3.8 Flash with tactical business grounding.
          </p>
          <button
            type="button"
            onClick={() => setIsPricingModalOpen(true)}
            className="mt-3 block w-full rounded-lg bg-blue-600/20 border border-blue-500/40 py-1.5 text-center text-xs font-semibold text-blue-300 transition hover:bg-blue-600/30"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Footer / Legal, Shortcuts & System Status */}
      <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
        <button
          type="button"
          onClick={() => handleSelect('legal')}
          className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] transition ${
            activeView === 'legal'
              ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>Privacy &amp; Terms</span>
          </div>
          <span className="text-[10px] text-slate-500">Legal</span>
        </button>

        <button
          type="button"
          onClick={() => setIsShortcutsModalOpen(true)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 transition"
        >
          <div className="flex items-center space-x-2">
            <Keyboard className="h-3.5 w-3.5 text-cyan-400" />
            <span>Shortcuts</span>
          </div>
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
            ?
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setIsDownloadModalOpen(true)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200 transition border border-cyan-500/20 bg-cyan-950/20"
        >
          <div className="flex items-center space-x-2">
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-semibold">Download App</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">PWA</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsMobileNavOpen(false);
            logout();
          }}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out / Switch</span>
          </div>
          <span className="text-[10px] text-rose-400/80">Exit</span>
        </button>

        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 font-medium">NEXVORA Engine</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800/80 bg-[#070c18] lg:block">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative flex w-72 flex-col bg-[#070c18] border-r border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold text-xs">
                  N
                </div>
                <span className="text-sm font-extrabold text-white">NEXVORA AI</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
