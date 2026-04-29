'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export interface ActivityNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
  activity: ActivityNotification[];
  unreadCount: number;
  fetchActivity: () => void;
  markAsRead: (id: string) => void;
  deleteActivity: (id: string) => void;
  clearAllActivity: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activity, setActivity] = useState<ActivityNotification[]>([]);
  const { user } = useAuth();

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setActivity(res.data);
    } catch (err) {
      console.error('Failed to fetch activity notifications', err);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setActivity(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setActivity(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const clearAllActivity = async () => {
    try {
      await api.delete('/notifications');
      setActivity([]);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivity();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchActivity, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchActivity]);

  const unreadCount = activity.filter(a => !a.is_read).length;

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      notifications, 
      removeNotification,
      activity,
      unreadCount,
      fetchActivity,
      markAsRead,
      deleteActivity,
      clearAllActivity
    }}>
      {children}
      <div className="fixed top-10 right-10 z-[9999] flex flex-col gap-4 pointer-events-none">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} onRemove={removeNotification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function Toast({ notification, onRemove }: { notification: Notification; onRemove: (id: string) => void }) {
  return (
    <div className="pointer-events-auto animate-in slide-in-from-right-10 duration-500">
      <div className={`flex items-center gap-5 px-8 py-6 rounded-[2.5rem] border backdrop-blur-3xl shadow-2xl min-w-[320px] ${
        notification.type === 'success' ? 'bg-green/10 border-green/20 text-green' : 
        notification.type === 'error' ? 'bg-red-400/10 border-red-400/20 text-red-400' :
        'bg-blue/10 border-blue/20 text-blue'
      }`}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
          notification.type === 'success' ? 'bg-green/10 border-green/20' : 
          notification.type === 'error' ? 'bg-red-400/10 border-red-400/20' :
          'bg-blue/10 border-blue/20'
        }`}>
          <span className="material-icons-outlined text-xl">
            {notification.type === 'success' ? 'check_circle' : 
             notification.type === 'error' ? 'report_problem' : 'info'}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</p>
        </div>
        <button onClick={() => onRemove(notification.id)} className="ml-2 opacity-40 hover:opacity-100 transition-opacity">
          <span className="material-icons-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
