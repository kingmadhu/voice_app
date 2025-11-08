'use client';

import { useCallback } from 'react'; // ✅ FIX: import useCallback from React

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

export function useHapticFeedback(): { triggerHaptic: (type: HapticType) => void } {
  const triggerHaptic = useCallback((type: HapticType) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate([30, 10, 30]);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'error':
          navigator.vibrate([50, 30, 50, 30, 50]);
          break;
        case 'warning':
          navigator.vibrate([20, 20, 20]);
          break;
      }
    }
  }, []);

  return { triggerHaptic };
}
