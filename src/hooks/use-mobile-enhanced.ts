'use client'

import { useState, useEffect } from 'react'

export interface MobileInfo {
  isMobile: boolean
  isTablet: boolean
  isPhone: boolean
  isAndroid: boolean
  isIOS: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
}

export function useMobileEnhanced(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isPhone: false,
    isAndroid: false,
    isIOS: false,
    screenWidth: 1920,
    screenHeight: 1080,
    orientation: 'landscape'
  })

  useEffect(() => {
    const updateMobileInfo = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // Detect device type
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTabletDevice = /ipad|android(?!.*mobile)/i.test(userAgent) || (isMobileDevice && screenWidth >= 768)
      const isPhoneDevice = isMobileDevice && !isTabletDevice
      
      // Detect OS
      const isAndroidDevice = /android/i.test(userAgent)
      const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent)
      
      // Determine orientation
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait'
      
      setMobileInfo({
        isMobile: isMobileDevice,
        isTablet: isTabletDevice,
        isPhone: isPhoneDevice,
        isAndroid: isAndroidDevice,
        isIOS: isIOSDevice,
        screenWidth,
        screenHeight,
        orientation
      })
    }

    updateMobileInfo()
    window.addEventListener('resize', updateMobileInfo)
    window.addEventListener('orientationchange', updateMobileInfo)
    
    return () => {
      window.removeEventListener('resize', updateMobileInfo)
      window.removeEventListener('orientationchange', updateMobileInfo)
    }
  }, [])

  return mobileInfo
}