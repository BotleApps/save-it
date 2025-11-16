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
  
  // Add PWA meta tags and manifest link before closing head tag
  const pwaMetaTags = `
  <!-- PWA Meta Tags -->
  <meta name="application-name" content="Save It">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Save It">
  <meta name="description" content="Save and organize your links, articles, and resources">
  <meta name="format-detection" content="telephone=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#6366F1">
  
  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" href="/icon-192.png">
  <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png">
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('Service Worker registered:', reg.scope))
          .catch(err => console.error('Service Worker registration failed:', err));
      });
    }
  </script>
</head>`;
  
  html = html.replace('</head>', pwaMetaTags);
  
  fs.writeFileSync(indexPath, html);
  console.log('✓ Fixed index.html for PWA with ES modules support');
}
