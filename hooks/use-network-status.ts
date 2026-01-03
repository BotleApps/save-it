import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      
      // Register background sync if supported (guarded to browser only)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((registration: MinimalServiceWorkerRegistration | undefined | null) => {
            try {
              if (registration && registration.sync) {
                return registration.sync.register('sync-links');
              }
            } catch (e) {
              // ignore errors from unexpected shapes
            }
            return undefined;
          })
          .catch((error: any) => {
            console.log('Background sync registration failed:', error);
          });
      }

      // Clear the flag after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
