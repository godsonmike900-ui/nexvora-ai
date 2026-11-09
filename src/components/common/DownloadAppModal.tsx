import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  CheckCircle,
  Share,
  PlusSquare,
  FileCode,
  Zap,
  WifiOff,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'source'>('pwa');
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const { showToast } = useApp();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadSourceZip = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/download/source-zip');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nexvora-ai-source.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      }, 500);
      showToast({
        type: 'success',
        title: 'Source Code Download Started',
        message: 'nexvora-ai-source.zip (1.7 MB) is downloading to your device.',
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Download Error',
        message: 'Could not fetch archive. Check connection and retry.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        showToast({
          type: 'success',
          title: 'App Installed Successfully!',
          message: 'NEXVORA AI is now installed on your home screen.',
        });
        onClose();
      } else if (outcome === 'unsupported') {
        showToast({
          type: 'info',
          title: isIOS ? 'Add to Home Screen' : 'Install on Android Phone',
          message: isIOS
            ? "Tap Safari's Share icon (box with arrow) at the bottom → tap 'Add to Home Screen'."
            : "Tap the 3 dots (⋮) in Chrome at top right → tap 'Install app' or 'Add to Home screen'.",
        });
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Install Error',
        message: 'Could not complete in-app installation. Try your browser menu.',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#090f1f] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-white transition"
          aria-label="Close download modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Get NEXVORA AI
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/30">
                PWA & Source
              </span>
            </h3>
            <p className="text-xs text-slate-400">Install directly on your phone/laptop or download the codebase</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === 'pwa'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Install on Device (App)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('source')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === 'source'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            Download Source Code (.ZIP)
          </button>
        </div>

        {/* Tab 1: PWA Installation */}
        {activeTab === 'pwa' && (
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {isInstalled ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-300">NEXVORA AI is Already Installed</h4>
                <p className="text-xs text-slate-300 mt-1">
                  You are running NEXVORA AI in standalone app mode with offline service worker support.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-cyan-400" /> Standalone Progressive Web App
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Install NEXVORA AI directly to your home screen or desktop dock. No app store download required.
                      </p>
                    </div>
                  </div>

                  {/* Always-visible Install App button */}
                  <button
                    type="button"
                    disabled={isInstalling}
                    onClick={handleInstallClick}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4 text-slate-950" />
                    {isInstalling
                      ? 'Installing...'
                      : isInstallable
                      ? '1-Click Install NEXVORA AI on This Phone'
                      : 'Install NEXVORA AI on Phone (Add to Home Screen)'}
                  </button>
                </div>

                {/* Instructions by Device */}
                {isIOS ? (
                  <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-3.5 space-y-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4" /> iOS (iPhone & iPad) Safari Instructions:
                    </span>
                    <ol className="text-xs text-slate-300 space-y-1.5 pl-5 list-decimal">
                      <li>
                        Tap the <span className="inline-flex items-center font-semibold text-cyan-400"><Share className="inline h-3.5 w-3.5 mx-1" /> Share</span> button in Safari's bottom toolbar.
                      </li>
                      <li>
                        Scroll down and tap <span className="inline-flex items-center font-semibold text-cyan-400"><PlusSquare className="inline h-3.5 w-3.5 mx-1" /> Add to Home Screen</span>.
                      </li>
                      <li>
                        Confirm by tapping <span className="font-semibold text-cyan-400">Add</span> in the top-right corner.
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-3.5 space-y-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Laptop className="h-4 w-4" /> Android & Desktop Chrome / Edge:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Look for the <span className="font-semibold text-cyan-400">Install icon (⊕)</span> in your browser's address bar, or click your browser's top menu (<span className="font-semibold text-cyan-400">⋮</span>) and select <span className="font-semibold text-cyan-400">"Install NEXVORA AI"</span>.
                    </p>
                  </div>
                )}

                {/* Feature Bullets */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 text-center">
                    <WifiOff className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold text-slate-200 block">Offline Cache</span>
                    <span className="text-[10px] text-slate-400">Works without network</span>
                  </div>
                  <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 text-center">
                    <Zap className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold text-slate-200 block">Fast Startup</span>
                    <span className="text-[10px] text-slate-400">Native window view</span>
                  </div>
                  <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 text-center">
                    <ShieldCheck className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold text-slate-200 block">Encrypted</span>
                    <span className="text-[10px] text-slate-400">Private local sync</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Source Code Download */}
        {activeTab === 'source' && (
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Full Application Source Archive</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Complete clean codebase (.ZIP) ready for self-hosting</p>
                </div>
                <span className="rounded-md bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-300">
                  ~1.7 MB
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Frontend:</span>
                  <span className="font-medium text-slate-200">React 19 + TypeScript + Tailwind CSS</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Backend:</span>
                  <span className="font-medium text-slate-200">Express + Gemini 3.8 Flash Engine</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Database:</span>
                  <span className="font-medium text-slate-200">Local JSON Store + Supabase RLS Schema</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">PWA:</span>
                  <span className="font-medium text-slate-200">Service Worker + Manifest Configured</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadSourceZip}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer text-center"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Preparing ZIP...' : 'Download nexvora-ai-source.zip (1.7 MB)'}
              </button>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-300 block">Quick Start After Unzipping:</span>
              <pre className="rounded bg-black/60 p-2 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                npm install{'\n'}
                npm run build{'\n'}
                npm start
              </pre>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>NEXVORA AI v1.0 • PWA Ready</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
