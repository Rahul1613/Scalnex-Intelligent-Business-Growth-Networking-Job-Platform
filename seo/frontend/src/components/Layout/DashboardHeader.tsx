import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Moon, Sun, Menu, CheckCircle, AlertCircle, FileText, X, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState<string>('Your Business');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Load business data on mount
  useEffect(() => {
    const loadBusinessData = async () => {
      if (!user?.id) return;

      try {
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';
        const response = await fetch(`${API_URL}/api/business/${user.id}`);
        if (response.status === 401 || response.status === 404) {
          // Silently ignore auth/missing errors for business profile in header
          return;
        }
        const data = await response.json();

        if (data.business && data.business.businessName) {
          setBusinessName(data.business.businessName);
        }
      } catch (error) {
        // Silently log network errors to console only
        console.debug('Business data load skipped or failed:', error);
      }
    };

    loadBusinessData();
  }, [user]);

  // Load notifications
  useEffect(() => {
    // Load from localStorage or generate demo notifications
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      // Generate demo notifications
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'SEO Analysis Complete',
          message: 'Your website SEO score improved by 15 points!',
          time: '5 min ago',
          read: false
        },
        {
          id: '2',
          type: 'info',
          title: 'New Report Available',
          message: 'Your weekly analytics report is ready to view.',
          time: '1 hour ago',
          read: false
        },
        {
          id: '3',
          type: 'warning',
          title: 'Keyword Ranking Change',
          message: '3 keywords dropped in rankings. Review needed.',
          time: '3 hours ago',
          read: true
        },
        {
          id: '4',
          type: 'success',
          title: 'Content Published',
          message: 'Your new blog post has been published successfully.',
          time: '1 day ago',
          read: true
        }
      ];
      setNotifications(demoNotifications);
      localStorage.setItem('notifications', JSON.stringify(demoNotifications));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side - Menu Button & Welcome */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {businessName}! 👋
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Here's what's happening with your business today
            </p>
          </div>
        </div>

        {/* Right Side - Notifications, Theme Toggle, Profile */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label="Delete notification"
                                title="Delete notification"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {notification.time}
                              </span>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{businessName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
