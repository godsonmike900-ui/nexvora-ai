import { AppView } from '../context/AppContext';

export interface ShortcutDefinition {
  keyDisplay: string;
  actionName: string;
  view?: AppView;
  specialAction?: 'toggleShortcutsModal' | 'quickAi';
  description: string;
}

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  { keyDisplay: 'Alt + 1', actionName: 'Main Dashboard', view: 'dashboard', description: 'Jump to Executive Dashboard' },
  { keyDisplay: 'Alt + 2', actionName: 'AI Assistant', view: 'assistant', description: 'Open Gemini 3.8 Flash Advisor' },
  { keyDisplay: 'Alt + 3', actionName: 'Marketing Studio', view: 'marketing', description: 'Open AI Marketing Copy Studio' },
  { keyDisplay: 'Alt + 4', actionName: 'Business Writer', view: 'writer', description: 'Open Business Proposals & Letters' },
  { keyDisplay: 'Alt + 5', actionName: 'Invoice Generator', view: 'invoices', description: 'Open Invoices & PDF Generator' },
  { keyDisplay: 'Alt + 6', actionName: 'Sales & Expenses', view: 'finance', description: 'Open Cash Flow & Transactions' },
  { keyDisplay: 'Alt + 7', actionName: 'Business Analytics', view: 'analytics', description: 'Open Financial Trends & Charts' },
  { keyDisplay: 'Alt + 8', actionName: 'Settings & DB', view: 'settings', description: 'Open Business Profile & Themes' },
  { keyDisplay: 'Alt + 9', actionName: 'Legal & Privacy', view: 'legal', description: 'Open Privacy Policy & Terms' },
  { keyDisplay: '?', actionName: 'Shortcuts Help', specialAction: 'toggleShortcutsModal', description: 'Open Keyboard Shortcuts Guide' },
];

/**
 * Pure function to determine what action to execute given a keyboard event.
 * Avoids triggering when user is actively typing in a form input/textarea/select.
 */
export function resolveShortcutAction(event?: {
  key?: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  targetTagName?: string;
  isEditable?: boolean;
} | null): { view?: AppView; specialAction?: 'toggleShortcutsModal' | 'quickAi' } | null {
  if (!event || typeof event.key !== 'string' || !event.key) {
    return null;
  }

  const isInput =
    event.isEditable ||
    event.targetTagName === 'INPUT' ||
    event.targetTagName === 'TEXTAREA' ||
    event.targetTagName === 'SELECT';

  // Toggle shortcuts modal: '?' or 'Ctrl+/'
  if (!isInput && event.key === '?') {
    return { specialAction: 'toggleShortcutsModal' };
  }
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    return { specialAction: 'toggleShortcutsModal' };
  }

  // Navigation via Alt + number or Alt + letter
  const hasModifier = Boolean(event.altKey || event.ctrlKey || event.metaKey);
  const keyLower = event.key.toLowerCase();

  // Number shortcuts (Alt + 1 to 9)
  if (hasModifier) {
    switch (event.key) {
      case '1':
        return { view: 'dashboard' };
      case '2':
        return { view: 'assistant' };
      case '3':
        return { view: 'marketing' };
      case '4':
        return { view: 'writer' };
      case '5':
        return { view: 'invoices' };
      case '6':
        return { view: 'finance' };
      case '7':
        return { view: 'analytics' };
      case '8':
        return { view: 'settings' };
      case '9':
        return { view: 'legal' };
    }

    // Letter shortcuts (Alt + d, Alt + m, Alt + s, Alt + l, etc.)
    switch (keyLower) {
      case 'd':
        return { view: 'dashboard' };
      case 'm':
        return { view: 'marketing' };
      case 's':
        return { view: 'settings' };
      case 'a':
        return { view: 'assistant' };
      case 'i':
        return { view: 'invoices' };
      case 'l':
        return { view: 'legal' };
    }
  }

  return null;
}
