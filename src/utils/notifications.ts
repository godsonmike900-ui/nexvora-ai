export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

export interface PushPreferences {
  paymentReceived: boolean;
  invoiceOverdue: boolean;
  dailyBriefing: boolean;
  securityAlerts: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  paymentReceived: true,
  invoiceOverdue: true,
  dailyBriefing: true,
  securityAlerts: true,
  soundEnabled: true,
};

/**
 * Checks if the Notification API is available in the current browser/device
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission state: 'granted' | 'denied' | 'default'
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Requests native browser/phone permission for notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Triggers a local web push notification if permission is granted
 */
export function triggerLocalPush(payload: PushNotificationPayload): boolean {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/pwa-192x192.png',
      tag: payload.tag || `nexvora-${Date.now()}`,
      data: payload.data,
    };

    // If service worker registration is available, use showNotification for mobile support
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(payload.title, options);
      });
      return true;
    }

    // Fallback to standard Notification constructor
    new Notification(payload.title, options);
    return true;
  } catch (err) {
    console.warn('Failed to fire local notification:', err);
    return false;
  }
}

/**
 * Creates templates for standard business alerts
 */
export function createPaymentReceivedAlert(clientName: string, amount: string): PushNotificationPayload {
  return {
    title: '💰 Payment Received!',
    body: `${clientName} has completed payment of ${amount}. Inflow recorded in Cash Flow.`,
    tag: 'payment-received',
  };
}

export function createInvoiceOverdueAlert(invoiceNumber: string, clientName: string, amount: string): PushNotificationPayload {
  return {
    title: '⚠️ Invoice Overdue Notice',
    body: `Invoice ${invoiceNumber} for ${clientName} (${amount}) has passed its due date. Send a 1-tap reminder.`,
    tag: 'invoice-overdue',
  };
}

export function createMorningBriefingAlert(revenue: string, pendingCount: number): PushNotificationPayload {
  return {
    title: '⚡ NEXVORA AI Daily Briefing',
    body: `Good morning! Current cash revenue is ${revenue} with ${pendingCount} invoices pending collection.`,
    tag: 'daily-briefing',
  };
}

/**
 * Storage helpers for Push Preferences
 */
export function getStoredPushPreferences(): PushPreferences {
  if (typeof localStorage === 'undefined') return DEFAULT_PUSH_PREFERENCES;
  try {
    const saved = localStorage.getItem('nexvora_push_prefs');
    return saved ? { ...DEFAULT_PUSH_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PUSH_PREFERENCES;
  } catch {
    return DEFAULT_PUSH_PREFERENCES;
  }
}

export function saveStoredPushPreferences(prefs: PushPreferences): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('nexvora_push_prefs', JSON.stringify(prefs));
}
