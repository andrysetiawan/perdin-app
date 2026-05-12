import { useNotificationContext } from '@/presentation/context/NotificationContext';
import { ToastContainer } from '@/presentation/components/ui/Toast';

/**
 * Global notification renderer that displays toast notifications
 * at the app root level. This ensures notifications are visible
 * regardless of which layout is active (auth or dashboard).
 */
export function GlobalNotifications() {
  const { notifications, removeNotification } = useNotificationContext();
  return <ToastContainer notifications={notifications} onDismiss={removeNotification} />;
}
