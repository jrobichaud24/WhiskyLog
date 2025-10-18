# PWA Installation Guide

## Overview
The Dram Journal is a fully-featured Progressive Web App (PWA) that can be installed on any device for a native app-like experience with offline capabilities.

## Features

### ✅ Offline Functionality
- Service worker caches app files and API responses
- Works completely offline after first visit
- Automatic background sync when connection is restored

### ✅ Local Data Storage
- IndexedDB stores user ratings, notes, and collection data locally
- Data persists even when offline
- Automatic sync with server when back online

### ✅ Installation
- One-click install from the home page
- Works on iOS, Android, desktop Chrome, Edge, Safari
- Native app icon on home screen/app drawer

## How Installation Works

### For Users

**On Desktop (Chrome/Edge):**
1. Visit www.thedramjournal.com
2. Click the "Install App" button on the home page
3. Or click the install icon in the address bar
4. Confirm installation
5. App opens in its own window

**On iOS (Safari):**
1. Visit www.thedramjournal.com
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen

**On Android (Chrome):**
1. Visit www.thedramjournal.com
2. Tap the "Install App" button
3. Or tap menu (⋮) and select "Install app"
4. Confirm installation
5. App icon appears in app drawer

### For Developers

**PWA Components:**

1. **manifest.json** (`client/public/manifest.json`)
   - Defines app name, icons, colors, display mode
   - Already configured for The Dram Journal

2. **Service Worker** (`client/public/sw.js`)
   - Caches static files and API responses
   - Enables offline functionality
   - Handles background sync
   - Push notifications ready

3. **Installation Hook** (`client/src/hooks/usePWAInstall.ts`)
   - Manages PWA install prompt
   - Detects if app is already installed
   - Provides fallback instructions for iOS

4. **Local Database** (`client/src/lib/localDB.ts`)
   - IndexedDB wrapper for offline data storage
   - Stores user products, ratings, notes
   - Pending sync queue for offline actions

## Offline Capabilities

### What Works Offline:
- ✅ Browse cached whiskies
- ✅ View your collection
- ✅ Add ratings and notes (syncs when online)
- ✅ View distillery information
- ✅ Read cached content

### What Requires Internet:
- ❌ Initial app load (first visit)
- ❌ Fetching new whiskies
- ❌ Uploading bottle scans
- ❌ Real-time sync

## Testing PWA Features

### Test Installation:
```bash
# 1. Ensure app is published/deployed
# 2. Visit over HTTPS
# 3. Click "Install App" button
# 4. Verify app opens in standalone mode
```

### Test Offline Mode:
```bash
# 1. Open app
# 2. Open DevTools → Network tab
# 3. Enable "Offline" mode
# 4. Refresh page
# 5. App should still work
```

### Test Service Worker:
```bash
# 1. Open DevTools → Application tab
# 2. Click "Service Workers"
# 3. Verify sw.js is registered and active
# 4. Check "Cache Storage" for cached files
```

## Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Full support |
| Edge | ✅ | ✅ | Full support |
| Safari | ✅ | ✅ | Manual install only |
| Firefox | ✅ | ✅ | Install support limited |
| Samsung Internet | ❌ | ✅ | Full support |

## Deployment Requirements

For PWA to work in production:
1. ✅ Must be served over HTTPS (required)
2. ✅ Valid SSL certificate (automatic with Replit)
3. ✅ manifest.json accessible
4. ✅ Service worker registered
5. ✅ Icons (192x192, 512x512) available

## Maintenance

### Updating the App:
When you make changes, users will automatically get updates:
1. Service worker detects new version
2. Downloads new files in background
3. Shows update notification
4. User refreshes to get new version

### Clearing Cache:
```javascript
// From browser console:
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Security

- HTTPS required for service workers
- Data stored locally is encrypted by browser
- Credentials never stored in IndexedDB
- Session tokens remain server-side
- Background sync requires authentication

## Performance Benefits

- ⚡ Instant loading after first visit
- ⚡ No app store download required
- ⚡ Automatic updates
- ⚡ Reduced server load (caching)
- ⚡ Works on any device with a browser

---

**The Dram Journal PWA is ready for installation!**

Visit www.thedramjournal.com and click "Install App" to try it out.
