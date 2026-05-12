import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from 'react';

import { MAX_NOTIFICATIONS, NOTIFICATION_AUTO_DISMISS_MS } from '@/shared/constants';

// --- Types ---

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoDismiss: boolean;
  duration: number;
}

export type AddNotificationInput = {
  type: ToastNotification['type'];
  message: string;
  autoDismiss?: boolean;
  duration?: number;
};

// --- Context ---

interface NotificationContextValue {
  notifications: ToastNotification[];
  addNotification: (input: AddNotificationInput) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// --- Utility ---

let notificationIdCounter = 0;

function generateId(): string {
  notificationIdCounter += 1;
  return `notification-${Date.now()}-${notificationIdCounter}`;
}

/**
 * Determines whether a notification should auto-dismiss based on its type.
 * Success notifications auto-dismiss; error notifications persist.
 * Warning and info default to auto-dismiss.
 */
function resolveAutoDismiss(type: ToastNotification['type'], explicit?: boolean): boolean {
  if (explicit !== undefined) return explicit;
  return type !== 'error';
}

// --- Provider ---

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addNotification = useCallback(
    (input: AddNotificationInput) => {
      const id = generateId();
      const autoDismiss = resolveAutoDismiss(input.type, input.autoDismiss);
      const duration = input.duration ?? NOTIFICATION_AUTO_DISMISS_MS;

      const notification: ToastNotification = {
        id,
        type: input.type,
        message: input.message,
        autoDismiss,
        duration,
      };

      setNotifications((prev) => {
        const updated = [...prev, notification];
        // Enforce max queue size — remove oldest when exceeded
        if (updated.length > MAX_NOTIFICATIONS) {
          const removed = updated.slice(0, updated.length - MAX_NOTIFICATIONS);
          // Clean up timers for removed notifications
          for (const removedNotification of removed) {
            const timer = timersRef.current.get(removedNotification.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removedNotification.id);
            }
          }
          return updated.slice(updated.length - MAX_NOTIFICATIONS);
        }
        return updated;
      });

      // Set auto-dismiss timer for non-persistent notifications
      if (autoDismiss) {
        const timer = setTimeout(() => {
          removeNotification(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [removeNotification],
  );

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// --- Custom Hook ---

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
