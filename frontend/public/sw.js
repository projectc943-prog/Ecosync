// Service Worker for handling push notifications
// This runs in the background even when the tab is closed

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received:', event);

    let notificationData = {
        title: '🌿 EcoSync Alert',
        body: 'Environmental threshold exceeded',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'ecosync-alert',
        requireInteraction: true,
        data: {
            url: '/dashboard'
        }
    };

    // Parse push data if available
    if (event.data) {
        try {
            const payload = event.data.json();
            notificationData = {
                title: payload.title || notificationData.title,
                body: payload.body || notificationData.body,
                icon: payload.icon || notificationData.icon,
                badge: payload.badge || notificationData.badge,
                tag: payload.tag || notificationData.tag,
                requireInteraction: payload.requireInteraction !== undefined ? payload.requireInteraction : true,
                data: payload.data || notificationData.data,
                vibrate: [200, 100, 200], // Vibration pattern for mobile
                actions: payload.actions || []
            };
        } catch (err) {
            console.error('Error parsing push data:', err);
        }
    }

    const promiseChain = self.registration.showNotification(
        notificationData.title,
        notificationData
    );

    event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked:', event);

    event.notification.close();

    // Get the URL to open from notification data
    const urlToOpen = event.notification.data?.url || '/dashboard';

    // Open or focus the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('❌ Notification closed:', event);
});

// Handle background sync (optional - for offline support)
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event);
    if (event.tag === 'sync-alerts') {
        event.waitUntil(syncAlerts());
    }
});

async function syncAlerts() {
    // Fetch latest alerts when back online
    try {
        const response = await fetch('/api/alerts/latest');
        const alerts = await response.json();
        console.log('Synced alerts:', alerts);
    } catch (err) {
        console.error('Sync failed:', err);
    }
}
