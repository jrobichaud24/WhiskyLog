import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Service Worker Registration Helper
 * Handles PWA service worker registration with comprehensive lifecycle logging
 * and error handling for easier debugging and monitoring.
 */

// Store registration globally for access by other modules
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker with detailed lifecycle logging
 * @returns Promise that resolves to the ServiceWorkerRegistration
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Check browser support
  if (!('serviceWorker' in navigator)) {
    console.warn('🚫 Service Workers are not supported in this browser');
    return null;
  }

  try {
    console.log('⏳ Registering service worker...');

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    swRegistration = registration;

    // Log initial registration state
    console.log('✅ Service worker registered successfully');
    console.log('📍 Scope:', registration.scope);

    // Log current worker states
    if (registration.installing) {
      console.log('🔄 Service worker installing...');
      logWorkerState(registration.installing, 'installing');
    }

    if (registration.waiting) {
      console.log('⏸️  Service worker waiting to activate');
      logWorkerState(registration.waiting, 'waiting');
    }

    if (registration.active) {
      console.log('✨ Service worker active and ready');
      logWorkerState(registration.active, 'active');
    }

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      console.log('🔍 Update found! New service worker installing...');

      const newWorker = registration.installing;
      if (newWorker) {
        logWorkerState(newWorker, 'new worker');

        newWorker.addEventListener('statechange', () => {
          console.log(`🔄 New worker state changed to: ${newWorker.state}`);

          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('🆕 New content is available! Please refresh to update.');

              // Optionally notify user (you can hook into a toast notification here)
              notifyUserOfUpdate();
            } else {
              // Content is cached for offline use
              console.log('💾 Content cached for offline use');
            }
          }

          if (newWorker.state === 'activated') {
            console.log('✅ New service worker activated');
          }
        });
      }
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      console.log('🔍 Checking for service worker updates...');
      registration.update().catch(error => {
        console.error('❌ Failed to check for updates:', error);
      });
    }, 60 * 60 * 1000); // 1 hour

    return registration;

  } catch (error) {
    console.error('❌ Service worker registration failed');

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }

    // Specific error handling
    if (error instanceof TypeError) {
      console.error('💡 Possible causes:');
      console.error('  - Service worker file (/sw.js) not found');
      console.error('  - Network connectivity issues');
      console.error('  - HTTPS requirement not met (required in production)');
    }

    return null;
  }
}

/**
 * Log detailed state information about a service worker
 */
function logWorkerState(worker: ServiceWorker, label: string) {
  console.log(`📊 ${label} worker details:`, {
    state: worker.state,
    scriptURL: worker.scriptURL,
  });
}

/**
 * Notify user of available updates
 * This is a placeholder - integrate with your notification system
 */
function notifyUserOfUpdate() {
  // You can integrate this with your toast notification system
  // For now, we'll just log to console
  console.log('💡 Tip: Refresh the page to get the latest version');

  // Example: Show a toast notification
  // toast({
  //   title: "Update Available",
  //   description: "A new version is available. Refresh to update.",
  // });
}

/**
 * Get the current service worker registration
 * Useful for other modules that need access to the registration
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

/**
 * Wait for service worker to be ready
 * @returns Promise that resolves when the service worker is ready
 */
export async function waitForServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers not supported');
  }
  return navigator.serviceWorker.ready;
}

/**
 * Unregister service worker (useful for debugging)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (swRegistration) {
    const result = await swRegistration.unregister();
    console.log(result ? '✅ Service worker unregistered' : '❌ Failed to unregister service worker');
    return result;
  }
  return false;
}

// Initialize service worker on page load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Check if we are on the non-www domain (and not localhost/render)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isRender = window.location.hostname.endsWith('.onrender.com');
    const isWww = window.location.hostname.startsWith('www.');

    if (!isLocalhost && !isRender && !isWww) {
      console.log('🌐 Detected non-www domain, checking for service workers to unregister...');
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          console.log(`🗑️ Found ${registrations.length} service workers, unregistering...`);
          await Promise.all(registrations.map(r => r.unregister()));
          console.log('✅ All service workers unregistered. Reloading to force redirect...');
          window.location.reload();
        } else {
          console.log('ℹ️ No service workers found on non-www.');
          // Force reload anyway to trigger redirect if no SW was found but we're still here
          window.location.reload();
        }
      } catch (error) {
        console.error('❌ Error checking/unregistering service workers:', error);
      }
      // Do not register new SW on non-www
      return;
    }

    console.log('🚀 Page loaded, initializing service worker...');
    registerServiceWorker().then(registration => {
      if (registration) {
        console.log('✅ Service worker initialization complete');
      } else {
        console.log('⚠️  Service worker initialization failed (see errors above)');
      }
    });
  });
} else {
  console.warn('⚠️  Service workers not available in this environment');
}

createRoot(document.getElementById("root")!).render(<App />);
