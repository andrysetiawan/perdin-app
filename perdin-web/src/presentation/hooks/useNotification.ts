import { useNotificationContext } from '@/presentation/context/NotificationContext';

export function useNotification() {
  return useNotificationContext();
}
