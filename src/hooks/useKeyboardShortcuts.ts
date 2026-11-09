import { useEffect, useState, useCallback } from 'react';
import { useApp, AppView } from '../context/AppContext';
import { resolveShortcutAction } from '../utils/shortcuts';

interface UseKeyboardShortcutsOptions {
  onShortcutTriggered?: (actionName: string) => void;
}

export function useKeyboardShortcuts(options?: UseKeyboardShortcutsOptions) {
  const { setActiveView, isShortcutsModalOpen, setIsShortcutsModalOpen } = useApp();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e || typeof e.key !== 'string') return;

      const target = e.target as HTMLElement | null;
      const targetTagName = target?.tagName || '';
      const isEditable = target?.isContentEditable || false;

      const action = resolveShortcutAction({
        key: e.key,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        targetTagName,
        isEditable,
      });

      if (!action) return;

      if (action.specialAction === 'toggleShortcutsModal') {
        e.preventDefault();
        setIsShortcutsModalOpen(!isShortcutsModalOpen);
        options?.onShortcutTriggered?.('Shortcuts Guide');
        return;
      }

      if (action.view) {
        e.preventDefault();
        setActiveView(action.view);
        options?.onShortcutTriggered?.(action.view);
      }
    },
    [setActiveView, isShortcutsModalOpen, setIsShortcutsModalOpen, options]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
  };
}
