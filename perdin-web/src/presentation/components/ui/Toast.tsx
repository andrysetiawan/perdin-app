import React from 'react';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoDismiss?: boolean;
  duration?: number;
}

interface ToastProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
}

const borderColorMap: Record<ToastNotification['type'], string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  info: 'border-l-blue-500',
};

const iconMap: Record<ToastNotification['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const iconColorMap: Record<ToastNotification['type'], string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  return (
    <div
      className={`flex items-start gap-3 rounded-md border border-l-4 bg-white p-4 shadow-md ${borderColorMap[notification.type]}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span
        className={`flex-shrink-0 text-lg font-bold ${iconColorMap[notification.type]}`}
        aria-hidden="true"
      >
        {iconMap[notification.type]}
      </span>
      <p className="flex-1 text-sm text-gray-800">{notification.message}</p>
      <button
        onClick={() => onDismiss(notification.id)}
        className="flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};
