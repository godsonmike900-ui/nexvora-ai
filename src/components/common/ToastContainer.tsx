import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastNotification } from '../../types';
import { getToastTheme } from '../../utils/toastManager';

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const theme = getToastTheme(toast.type);
  const duration = toast.duration ?? 4500;

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, duration]);

  useEffect(() => {
    if (progress <= 0) {
      onDismiss(toast.id);
    }
  }, [progress, toast.id, onDismiss]);

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className={`h-5 w-5 ${theme.iconColor}`} />;
      case 'error':
        return <AlertCircle className={`h-5 w-5 ${theme.iconColor}`} />;
      case 'warning':
        return <AlertTriangle className={`h-5 w-5 ${theme.iconColor}`} />;
      case 'info':
      default:
        return <Info className={`h-5 w-5 ${theme.iconColor}`} />;
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${theme.border} bg-gradient-to-r ${theme.bgGlow} p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className="mt-0.5 flex-shrink-0">{renderIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-white tracking-wide">
              {toast.title}
            </h4>
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider border ${theme.badgeBg} ${theme.badgeText}`}
            >
              {toast.type}
            </span>
          </div>

          {toast.message && (
            <p className="mt-1 text-xs text-slate-300 leading-relaxed break-words">
              {toast.message}
            </p>
          )}

          {/* Optional Action Button */}
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                onDismiss(toast.id);
              }}
              className="mt-2.5 inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              <span>{toast.actionLabel}</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800/80">
        <div
          className={`h-full ${theme.accentBar} transition-all duration-75`}
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};
