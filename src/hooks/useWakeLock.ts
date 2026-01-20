import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook that manages the Screen Wake Lock API to prevent the screen
 * from turning off while reading.
 * 
 * Uses the native Screen Wake Lock API (supported in modern browsers).
 * Falls back gracefully if not supported.
 */
export const useWakeLock = (enabled: boolean = false) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  // Request wake lock
  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      console.log('Wake Lock API not supported');
      return false;
    }

    try {
      // Release any existing lock first
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
      }

      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);
      
      console.log('Wake Lock acquired');

      // Listen for release (e.g., when tab becomes hidden)
      wakeLockRef.current.addEventListener('release', () => {
        console.log('Wake Lock released');
        setIsActive(false);
      });

      return true;
    } catch (err) {
      // Wake lock request failed - usually due to:
      // - Low battery
      // - Tab not visible
      // - Permission denied
      console.log('Wake Lock request failed:', err);
      setIsActive(false);
      return false;
    }
  }, []);

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
        console.log('Wake Lock manually released');
      } catch (err) {
        console.log('Wake Lock release failed:', err);
      }
    }
  }, []);

  // Auto-acquire/release based on enabled flag
  useEffect(() => {
    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [enabled, requestWakeLock, releaseWakeLock]);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && enabled) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, requestWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  return {
    isActive,
    isSupported,
    requestWakeLock,
    releaseWakeLock
  };
};
