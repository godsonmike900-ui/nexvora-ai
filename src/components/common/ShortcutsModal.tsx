import React from 'react';
import { X, Command, Keyboard, ArrowRight } from 'lucide-react';
import { SHORTCUT_DEFINITIONS } from '../../utils/shortcuts';
import { useApp } from '../../context/AppContext';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { setActiveView } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#090f1f] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Keyboard className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">NEXVORA AI Keyboard Shortcuts</h3>
            <p className="text-xs text-slate-400">Navigate the Business OS without touching the mouse</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUT_DEFINITIONS.map((s, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (s.view) {
                  setActiveView(s.view);
                  onClose();
                }
              }}
              className="flex items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-900/60 cursor-pointer border border-transparent hover:border-slate-800"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">{s.actionName}</span>
                <p className="text-[11px] text-slate-400">{s.description}</p>
              </div>

              <div className="flex items-center space-x-1.5">
                <kbd className="rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-300 shadow-sm">
                  {s.keyDisplay}
                </kbd>
                {s.view && <ArrowRight className="h-3 w-3 text-slate-500" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">?</kbd> anywhere to open this dialog</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-cyan-400 hover:underline"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
