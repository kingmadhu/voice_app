'use client'

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    // Check if the device supports haptic feedback
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10)
          break
        case 'medium':
          navigator.vibrate(20)
          break
        case 'heavy':
          navigator.vibrate([30, 10, 30])
          break
        case 'success':
          navigator.vibrate([10, 50, 10])
          break
        case 'error':
          navigator.vibrate([50, 30, 50, 30, 50])
          break
        case 'warning':
          navigator.vibrate([20, 20, 20])
          break
      }
    }
  }, [])

  return {
    triggerHaptic
  }
}