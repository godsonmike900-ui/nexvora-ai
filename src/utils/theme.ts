import { AppTheme } from '../types';

export interface ThemeMeta {
  id: 'default' | 'midnight-forest';
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  badgeClass: string;
}

export const THEME_METAS: Record<'default' | 'midnight-forest', ThemeMeta> = {
  default: {
    id: 'default',
    name: 'Default (Blue-Cyan)',
    tagline: 'Signature oceanic dark navy with electric blue and cyan neon accents',
    primaryColor: '#2563eb',
    accentColor: '#06b6d4',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  'midnight-forest': {
    id: 'midnight-forest',
    name: 'Midnight Forest (Emerald-Jade)',
    tagline: 'Deep organic obsidian with luminous emerald and jade neon accents',
    primaryColor: '#059669',
    accentColor: '#10b981',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
};

/**
 * Normalizes any legacy theme string to either 'default' or 'midnight-forest'
 */
export function normalizeTheme(theme: string | null | undefined): 'default' | 'midnight-forest' {
  if (theme === 'midnight-forest') return 'midnight-forest';
  return 'default';
}

/**
 * Toggles between 'default' (blue-cyan) and 'midnight-forest' (emerald-jade)
 */
export function toggleTheme(currentTheme: AppTheme | string): 'default' | 'midnight-forest' {
  const normalized = normalizeTheme(currentTheme);
  return normalized === 'default' ? 'midnight-forest' : 'default';
}
