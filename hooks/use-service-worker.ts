import { useEffect, useState } from 'react';

interface ServiceWorkerStatus {
  isRegistered: boolean;
  isUpdating: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isUpdating: false,
    registration: null,
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check if service worker is already registered
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        setStatus({
          isRegistered: true,
          isUpdating: false,
          registration,
        });

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          setStatus((prev) => ({ ...prev, isUpdating: true }));

          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                setStatus((prev) => ({ ...prev, isUpdating: false }));
                
                // Notify user about update
                if (window.confirm('New version available! Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      }
    });

    // Listen for controller change (service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_START') {
        console.log('Background sync started');
      }
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log('Background sync completed');
      }
    });
  }, []);

  const clearCache = async () => {
    if ('serviceWorker' in navigator && status.registration) {
      status.registration.active?.postMessage({ type: 'CLEAR_CACHE' });
      // Wait a bit then reload
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return {
    ...status,
    clearCache,
  };
}
