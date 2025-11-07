import React, { useState } from 'react';
import { Bell, Settings, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { mockNotifications } from '../../mock';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const [notifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationColor = (type) => {
    const colors = {
      task: 'bg-blue-100 text-blue-800',
      leave: 'bg-green-100 text-green-800',
      salary: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search employees, tasks, or departments..."
            className="pl-10 w-full bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 ml-6">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getNotificationColor(notification.type)}`}
                      >
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                    <span className="text-xs text-gray-400">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <Button variant="link" className="text-sm text-blue-600 hover:text-blue-700">
                  View all notifications
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
          <Settings className="w-5 h-5 text-gray-600" />n
        </Button>

        {/* User Info */}
        <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.department}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
