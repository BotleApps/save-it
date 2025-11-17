const fs = require('fs');
const path = require('path');

// Post-export script to fix index.html for PWA
const indexPath = path.join(__dirname, 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Add type="module" to the script tag
  html = html.replace(
    /<script src="([^"]+)" defer><\/script>/,
    '<script type="module" src="$1"></script>'
  );
  
  // Update viewport for better mobile experience
  html = html.replace(
    /<meta name="viewport" content="[^"]*">/,
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover">'
  );
  
  // Add PWA meta tags and manifest link before closing head tag
  const pwaMetaTags = `
  <!-- PWA Meta Tags -->
  <meta name="application-name" content="Save It">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Save It">
  <meta name="description" content="Save and organize your links, articles, and resources">
  <meta name="format-detection" content="telephone=no">
  <meta name="theme-color" content="#6366F1">
  <meta name="color-scheme" content="light dark">
  
  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" href="/icon-180.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png">
  <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png">
  
  <!-- Apple Splash Screens -->
  <meta name="apple-mobile-web-app-status-bar" content="#6366F1">
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">
  
  <!-- Service Worker Registration with Update Notification -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => {
            console.log('✓ Service Worker registered:', reg.scope);
            
            // Check for updates every hour
            setInterval(() => {
              reg.update();
            }, 3600000);
            
            // Listen for updates
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    console.log('New version available! Refresh to update.');
                  }
                });
              }
            });
          })
          .catch(err => console.error('✗ Service Worker registration failed:', err));
      });
      
      // Handle connection status
      window.addEventListener('online', () => {
        console.log('✓ Back online');
        // Trigger background sync if supported
        if ('sync' in ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then(reg => {
            return reg.sync.register('sync-links');
          });
        }
      });
      
      window.addEventListener('offline', () => {
        console.log('⚠ Offline mode - data saved locally');
      });
    }
    
    // Log initial connection status
    console.log(navigator.onLine ? '✓ Online' : '⚠ Offline');
  </script>
</head>`;
  
  html = html.replace('</head>', pwaMetaTags);
  
  fs.writeFileSync(indexPath, html);
  console.log('✓ Fixed index.html for PWA with ES modules support');
}
