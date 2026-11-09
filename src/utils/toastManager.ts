import { ToastNotification, ToastType } from '../types';

export const DEFAULT_TOAST_DURATION = 4500; // 4.5 seconds
export const MAX_CONCURRENT_TOASTS = 5;

/**
 * Creates a validated ToastNotification object with unique ID and timestamp
 */
export function createToast(
  params: Omit<ToastNotification, 'id' | 'timestamp'>,
  idSuffix: string = Math.random().toString(36).substring(2, 7)
): ToastNotification {
  return {
    ...params,
    id: `toast-${Date.now()}-${idSuffix}`,
    duration: params.duration ?? DEFAULT_TOAST_DURATION,
    timestamp: Date.now(),
  };
}

/**
 * Pure reducer function to add a toast, enforcing a maximum queue limit
 */
export function addToast(
  currentToasts: ToastNotification[],
  newToastParams: Omit<ToastNotification, 'id' | 'timestamp'>,
  maxToasts: number = MAX_CONCURRENT_TOASTS
): ToastNotification[] {
  const newToast = createToast(newToastParams);
  // Add new toast to the top, slice to maxToasts
  return [newToast, ...currentToasts].slice(0, maxToasts);
}

/**
 * Pure reducer function to remove a toast by ID
 */
export function removeToast(
  currentToasts: ToastNotification[],
  idToRemove: string
): ToastNotification[] {
  return currentToasts.filter((t) => t.id !== idToRemove);
}

export interface ToastColorTheme {
  border: string;
  bgGlow: string;
  accentBar: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
}

/**
 * Visual color metadata matching NEXVORA AI enterprise design palette
 */
export function getToastTheme(type: ToastType): ToastColorTheme {
  switch (type) {
    case 'success':
      return {
        border: 'border-emerald-500/30',
        bgGlow: 'from-emerald-950/40 to-slate-900/90',
        accentBar: 'bg-emerald-500',
        iconColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
        badgeText: 'text-emerald-400',
      };
    case 'error':
      return {
        border: 'border-rose-500/30',
        bgGlow: 'from-rose-950/40 to-slate-900/90',
        accentBar: 'bg-rose-500',
        iconColor: 'text-rose-400',
        badgeBg: 'bg-rose-500/10 border-rose-500/20',
        badgeText: 'text-rose-400',
      };
    case 'warning':
      return {
        border: 'border-amber-500/30',
        bgGlow: 'from-amber-950/40 to-slate-900/90',
        accentBar: 'bg-amber-500',
        iconColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 border-amber-500/20',
        badgeText: 'text-amber-400',
      };
    case 'info':
    default:
      return {
        border: 'border-cyan-500/30',
        bgGlow: 'from-cyan-950/40 to-slate-900/90',
        accentBar: 'bg-cyan-500',
        iconColor: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/10 border-cyan-500/20',
        badgeText: 'text-cyan-400',
      };
  }
}
