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
      
      // Register background sync if supported
      if (
        'serviceWorker' in navigator &&
        typeof ServiceWorkerRegistration !== 'undefined' &&
        'sync' in ServiceWorkerRegistration.prototype
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          if ('sync' in registration) {
            const syncRegistration = registration as ServiceWorkerRegistration & {
              sync: { register: (tag: string) => Promise<void> };
            };
            return syncRegistration.sync.register('sync-links');
          }
          return undefined;
        }).catch((error) => {
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
