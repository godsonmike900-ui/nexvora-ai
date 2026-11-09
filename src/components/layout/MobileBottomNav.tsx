import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  DollarSign,
  Menu,
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, setIsMobileNavOpen, isMobileNavOpen } = useApp();

  const navItems: { view: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { view: 'assistant', label: 'AI Studio', icon: Sparkles },
    { view: 'invoices', label: 'Invoices', icon: FileText },
    { view: 'finance', label: 'Finances', icon: DollarSign },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-[#080d1a]/95 backdrop-blur-xl px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  isActive
                    ? 'bg-cyan-500/15 shadow-sm shadow-cyan-500/20 text-cyan-400'
                    : 'text-slate-400'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More / Menu toggle */}
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            isMobileNavOpen
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
              isMobileNavOpen
                ? 'bg-cyan-500/15 shadow-sm shadow-cyan-500/20 text-cyan-400'
                : 'text-slate-400'
            }`}
          >
            <Menu className="h-4 w-4" />
          </div>
          <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${isMobileNavOpen ? 'text-cyan-400' : 'text-slate-400'}`}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
