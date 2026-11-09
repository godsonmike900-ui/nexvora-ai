import React from 'react';
import { Palette, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toggleTheme, normalizeTheme, THEME_METAS } from '../../utils/theme';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'full';
  showLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'compact',
  showLabel = true,
}) => {
  const { theme, setTheme, showToast } = useApp();
  const currentTheme = normalizeTheme(theme);
  const isMidnightForest = currentTheme === 'midnight-forest';

  const handleToggle = () => {
    const nextTheme = toggleTheme(currentTheme);
    setTheme(nextTheme);

    const meta = THEME_METAS[nextTheme];
    showToast({
      type: nextTheme === 'midnight-forest' ? 'success' : 'info',
      title: 'Theme Switched',
      message: `Visual workspace switched to ${meta.name}.`,
    });
  };

  const handleSelectTheme = (selected: 'default' | 'midnight-forest') => {
    if (selected === currentTheme) return;
    setTheme(selected);

    const meta = THEME_METAS[selected];
    showToast({
      type: selected === 'midnight-forest' ? 'success' : 'info',
      title: 'Theme Switched',
      message: `Visual workspace switched to ${meta.name}.`,
    });
  };

  if (variant === 'full') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Visual Theme & Appearance</h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
              isMidnightForest
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
            }`}
          >
            Active: {THEME_METAS[currentTheme].name}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Customize your executive workspace environment. Choose between our signature oceanic navy mode or the alternative deep emerald forest dark mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Default (Blue-Cyan) Card */}
          <button
            type="button"
            onClick={() => handleSelectTheme('default')}
            className={`flex flex-col justify-between rounded-xl p-4 text-left transition border cursor-pointer ${
              !isMidnightForest
                ? 'border-cyan-400 bg-gradient-to-b from-[#0a152e] to-[#080e1e] shadow-lg shadow-cyan-500/10'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Default (Blue-Cyan)</span>
                {!isMidnightForest && (
                  <span className="inline-flex items-center rounded-md bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/40">
                    <Check className="mr-1 h-3 w-3" /> Selected
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                {THEME_METAS.default.tagline}
              </p>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <div className="flex -space-x-1">
                <span
                  className="h-4 w-4 rounded-full bg-[#070b14] border border-slate-700"
                  title="Dark Navy Base"
                />
                <span
                  className="h-4 w-4 rounded-full bg-[#2563eb] border border-slate-700"
                  title="Electric Blue"
                />
                <span
                  className="h-4 w-4 rounded-full bg-[#06b6d4] border border-slate-700"
                  title="Cyan Accent"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">Navy / Cyan</span>
            </div>
          </button>

          {/* Midnight Forest (Emerald-Jade) Card */}
          <button
            type="button"
            onClick={() => handleSelectTheme('midnight-forest')}
            className={`flex flex-col justify-between rounded-xl p-4 text-left transition border cursor-pointer ${
              isMidnightForest
                ? 'border-emerald-400 bg-gradient-to-b from-[#0d2719] to-[#07150c] shadow-lg shadow-emerald-500/10'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Midnight Forest</span>
                {isMidnightForest && (
                  <span className="inline-flex items-center rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                    <Check className="mr-1 h-3 w-3" /> Selected
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                {THEME_METAS['midnight-forest'].tagline}
              </p>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <div className="flex -space-x-1">
                <span
                  className="h-4 w-4 rounded-full bg-[#051009] border border-slate-700"
                  title="Deep Forest Base"
                />
                <span
                  className="h-4 w-4 rounded-full bg-[#059669] border border-slate-700"
                  title="Forest Green"
                />
                <span
                  className="h-4 w-4 rounded-full bg-[#10b981] border border-slate-700"
                  title="Emerald Jade Accent"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">Emerald / Jade</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Compact Switcher for Navbar / Header
  return (
    <div className="flex items-center space-x-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={isMidnightForest}
        aria-label={`Toggle theme: current is ${THEME_METAS[currentTheme].name}`}
        onClick={handleToggle}
        className="group relative inline-flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white cursor-pointer"
        title={`Click to switch to ${isMidnightForest ? 'Default (Blue-Cyan)' : 'Midnight Forest (Emerald-Jade)'}`}
      >
        {/* Animated indicator circle */}
        <div className="flex items-center space-x-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              isMidnightForest
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
            }`}
          />
          <Palette className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-200 transition" />
        </div>

        {showLabel && (
          <span className="hidden sm:inline text-[11px] font-semibold text-slate-300 group-hover:text-white transition">
            {isMidnightForest ? 'Midnight Forest' : 'Default'}
          </span>
        )}

        {/* Small theme badge indicator */}
        <span
          className={`hidden md:inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border ${
            isMidnightForest
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
          }`}
        >
          {isMidnightForest ? 'Emerald' : 'Cyan'}
        </span>
      </button>
    </div>
  );
};
