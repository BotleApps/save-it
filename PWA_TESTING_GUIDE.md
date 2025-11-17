# PWA Testing Guide

## Complete Offline Testing Checklist

### 1. Build and Serve Locally

```bash
./run-local.sh
```

Visit: http://localhost:3005

### 2. Verify Service Worker Installation

**Chrome/Edge DevTools:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Should see: `save-it-v2` status: **Activated and is running**

**Firefox:**
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Click **Service Workers**
4. Should see registration for http://localhost:3005

### 3. Test Offline Functionality

#### Method 1: DevTools (Recommended)
1. Open DevTools > **Network** tab
2. Check **Offline** checkbox at top
3. Refresh page
4. ✅ App should load from cache
5. ✅ Offline indicator should appear at top

#### Method 2: Airplane Mode
1. Enable airplane mode on device
2. Try to access http://localhost:3005
3. ✅ App should work completely offline

### 4. Test Offline Features

With offline mode enabled, test:

- ✅ **View existing links** (loads from AsyncStorage)
- ✅ **Search links** (works with cached data)
- ✅ **Add new link** (saves to AsyncStorage)
- ✅ **Edit link** (updates in AsyncStorage)
- ✅ **Delete link** (removes from AsyncStorage)
- ✅ **Filter by category** (works with cached data)
- ✅ **Filter by tags** (works with cached data)
- ✅ **Theme toggle** (dark/light mode)

### 5. Test Cache Strategy

#### Test App Shell Caching
1. Load app online
2. Go offline
3. Navigate between pages
4. ✅ All pages should load instantly

#### Test Image Caching
1. View links with images online
2. Go offline
3. View same links
4. ✅ Images should load from cache

#### Test API Caching
1. Make API calls online (link preview)
2. Go offline
3. Try to add link (should save without preview)
4. ✅ Link should save with URL only

### 6. Test Background Sync

**Note:** Background Sync only works in Chrome/Edge, not Firefox

1. Go offline
2. Add/edit a link
3. Go back online
4. Open DevTools Console
5. ✅ Should see: "Background sync started" and "Sync completed successfully"

### 7. Test Update Flow

1. Make a change to service worker version
2. Build and deploy
3. Reload app
4. ✅ Should see console message: "New version available! Refresh to update."
5. ✅ Reload should activate new service worker

### 8. Test Storage Persistence

#### Check Storage Usage
**Chrome DevTools > Application:**
1. **Local Storage**: Check `links-storage` and `tags-storage`
2. **Cache Storage**: Should see `save-it-v2`, `save-it-runtime-v2`, `save-it-images-v2`

#### Test Data Persistence
1. Add 10 links
2. Close browser
3. Reopen browser
4. Go to app
5. ✅ All 10 links should still be there

### 9. Test PWA Installation

#### Desktop (Chrome/Edge)
1. Visit app in Chrome
2. Look for **Install** icon in address bar (+ icon)
3. Click Install
4. ✅ App should open in standalone window
5. ✅ Check Start Menu / Applications folder for app icon

#### Android (Chrome)
1. Visit app in Chrome
2. Tap menu (⋮) > **Add to Home screen**
3. ✅ Icon should appear on home screen
4. Tap icon
5. ✅ App should open fullscreen without browser UI

#### iOS (Safari)
1. Visit app in Safari
2. Tap Share button
3. Tap **Add to Home Screen**
4. ✅ Icon should appear on home screen
5. Tap icon
6. ✅ App should open (Note: Some features limited on iOS)

### 10. Test Manifest Features

#### Shortcuts (Right-click on installed app icon)
- ✅ "Add New Link" - Should open /new-link
- ✅ "View All Links" - Should open /

#### Theme Color
- ✅ Address bar should be #6366F1 (purple)
- ✅ Status bar should match theme

#### Display Mode
- ✅ App should run in standalone mode (no browser UI)

### 11. Performance Testing

#### Lighthouse Audit (Chrome DevTools)
1. DevTools > **Lighthouse** tab
2. Select **Progressive Web App**
3. Click **Generate report**

**Target Scores:**
- ✅ PWA: 100/100
- ✅ Installable
- ✅ Works offline
- ✅ Themed

#### Manual Performance
1. Load app
2. ✅ Should load in < 2 seconds
3. Navigate between pages
4. ✅ Navigation should be instant
5. Scroll list with 100+ links
6. ✅ Should be smooth (60fps)

### 12. Test Offline Page

1. Clear cache: DevTools > Application > Clear storage
2. Go offline immediately
3. Try to visit app
4. ✅ Should show beautiful offline page
5. ✅ "Try Again" button should work when back online

### 13. Network Status Indicator

1. Start app online
2. Go offline
3. ✅ Red bar should appear: "⚠ Offline - Data saved locally"
4. Go back online
5. ✅ Green bar should appear: "✓ Back Online"
6. ✅ Bar should disappear after 3 seconds

### 14. Cross-Browser Testing

Test in all major browsers:

#### ✅ Chrome/Chromium
- Full PWA support
- Service Worker ✓
- Background Sync ✓
- Installation ✓

#### ✅ Firefox
- Service Worker ✓
- Installation ✓
- Background Sync ✗ (not supported)

#### ✅ Edge
- Full PWA support (same as Chrome)

#### ✅ Safari (Desktop)
- Service Worker ✓
- Installation ✓
- Limited PWA features

#### ⚠️ Safari (iOS)
- Service Worker ✓
- Installation ✓
- Share Target ✗
- Background Sync ✗
- Limited API access

### 15. Production Testing

After deploying to Vercel:

```bash
# Visit production URL
https://save-it-chi.vercel.app
```

1. Test all offline features
2. Test installation
3. Test across different devices
4. Test sharing (Android only)

### Common Issues & Solutions

#### Service Worker Not Registering
```bash
# Clear everything and rebuild
rm -rf dist/
./run-local.sh
# Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
```

#### Cache Not Updating
```bash
# In DevTools > Application > Service Workers
# Click "Unregister"
# Click "Update"
# Or clear cache: Application > Storage > Clear site data
```

#### Offline Page Not Showing
```bash
# Make sure offline.html is copied
ls dist/offline.html

# If missing:
cp public/offline.html dist/
```

#### Data Not Persisting
```bash
# Check AsyncStorage in DevTools
# Application > Storage > Local Storage > http://localhost:3005
# Should see: links-storage and tags-storage
```

### Automated Testing Script

```bash
#!/bin/bash
# test-pwa.sh

echo "🧪 Testing PWA..."

# Build
./run-local.sh &
SERVER_PID=$!
sleep 5

# Test with Lighthouse CLI
npm install -g @lhci/cli
lhci autorun --url=http://localhost:3005

# Kill server
kill $SERVER_PID

echo "✅ PWA tests complete!"
```

### Debugging Tips

**Service Worker Console Logs:**
- Look for `[SW]` prefix in console
- Shows cache operations
- Shows fetch strategies

**Storage Inspection:**
```javascript
// In browser console
// Check storage
console.log(localStorage.getItem('links-storage'));
console.log(localStorage.getItem('tags-storage'));

// Check caches
caches.keys().then(console.log);

// Check service worker
navigator.serviceWorker.getRegistration().then(console.log);
```

**Force Service Worker Update:**
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

**Clear Everything:**
```javascript
// In browser console
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
localStorage.clear();
navigator.serviceWorker.getRegistration().then(reg => {
  reg.unregister();
});
```

### Success Criteria

Your PWA is complete when:

- ✅ Lighthouse PWA score: 100/100
- ✅ Works completely offline
- ✅ Installable on all platforms
- ✅ Fast loading (< 2s)
- ✅ Responsive on all devices
- ✅ Data persists across sessions
- ✅ Network status indicator works
- ✅ Service worker caches efficiently
- ✅ Updates smoothly
- ✅ No console errors

## Production Deployment

When ready to deploy:

```bash
# 1. Test locally
./run-local.sh
# Do full offline testing

# 2. Commit changes
git add .
git commit -m "Enhanced PWA with complete offline support"

# 3. Push to GitHub
git push origin main

# 4. GitHub Actions will automatically deploy to Vercel

# 5. Test production
# Visit https://save-it-chi.vercel.app
# Run all tests again in production
```

## Maintenance

### Update Service Worker Version
When making changes, update version in `public/service-worker.js`:
```javascript
const CACHE_NAME = 'save-it-v3'; // Increment version
```

### Monitor Cache Size
```javascript
// Check cache sizes
caches.keys().then(async keys => {
  for (const key of keys) {
    const cache = await caches.open(key);
    const items = await cache.keys();
    console.log(`${key}: ${items.length} items`);
  }
});
```

### Clear Old Caches
Caches are automatically cleaned on service worker activation.

---

**You now have a production-ready PWA with complete offline support! 🎉**
