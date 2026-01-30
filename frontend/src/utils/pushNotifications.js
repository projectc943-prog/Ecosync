/**
 * Push Notification Manager
 * Handles service worker registration and push subscription
 */

const VAPID_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEayS355_MqAeO-66kPz_G5rnpRIxoO8RyK8odPh9TwAKhz-qMkV_nVeIyXhzmVk4W31OwOpfM16x-dUyg8BxDQ'; // Will be replaced with actual key

class PushNotificationManager {
    constructor() {
        this.swRegistration = null;
        this.subscription = null;
    }

    /**
     * Initialize push notifications
     * Registers service worker and sets up push subscription
     */
    async initialize() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported');
            return false;
        }

        if (!('PushManager' in window)) {
            console.warn('Push API not supported');
            return false;
        }

        try {
            // Register service worker
            this.swRegistration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', this.swRegistration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('✅ Service Worker ready');

            return true;
        } catch (err) {
            console.error('Service Worker registration failed:', err);
            return false;
        }
    }

    /**
     * Subscribe to push notifications
     * Creates a push subscription and sends it to the backend
     */
    async subscribe(apiBaseUrl) {
        if (!this.swRegistration) {
            console.error('Service Worker not registered');
            return null;
        }

        try {
            // Check if already subscribed
            let subscription = await this.swRegistration.pushManager.getSubscription();

            if (!subscription) {
                // Create new subscription
                const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

                subscription = await this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });

                console.log('✅ Push subscription created:', subscription);
            } else {
                console.log('✅ Already subscribed to push notifications');
            }

            this.subscription = subscription;

            // Send subscription to backend
            await this.sendSubscriptionToBackend(subscription, apiBaseUrl);

            return subscription;
        } catch (err) {
            console.error('Failed to subscribe to push notifications:', err);
            return null;
        }
    }

    /**
     * Send subscription to backend for storage
     */
    async sendSubscriptionToBackend(subscription, apiBaseUrl) {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${apiBaseUrl}/api/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }

            console.log('✅ Subscription saved to backend');
        } catch (err) {
            console.error('Failed to send subscription to backend:', err);
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe(apiBaseUrl) {
        if (!this.subscription) {
            console.log('No active subscription');
            return;
        }

        try {
            await this.subscription.unsubscribe();
            console.log('✅ Unsubscribed from push notifications');

            // Notify backend
            const token = localStorage.getItem('token');
            await fetch(`${apiBaseUrl}/api/push/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            this.subscription = null;
        } catch (err) {
            console.error('Failed to unsubscribe:', err);
        }
    }

    /**
     * Convert VAPID key from base64 to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Send a test notification
     */
    async sendTestNotification() {
        if (!this.subscription) {
            console.error('No active subscription');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/push/test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('✅ Test notification sent');
            }
        } catch (err) {
            console.error('Failed to send test notification:', err);
        }
    }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager();
export default pushNotificationManager;
