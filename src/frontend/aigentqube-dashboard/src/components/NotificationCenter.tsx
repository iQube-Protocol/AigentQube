import React, { useState } from 'react';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
    }
  };

  return (
    <div className="notification-center relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No notifications
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`
                    p-4 flex justify-between items-center 
                    border-b border-gray-700 
                    ${getNotificationColor(notification.type)}
                    bg-opacity-20
                  `}
                >
                  <div>
                    <p className="text-white">{notification.message}</p>
                    <small className="text-gray-400">
                      {notification.timestamp.toLocaleTimeString()}
                    </small>
                  </div>
                  <button 
                    onClick={() => clearNotification(notification.id)}
                    className="text-white hover:opacity-75"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
