import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, XIcon } from './Icons';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const typeColors = {
    status_update: 'bg-blue-100 text-blue-700 border border-blue-300',
    new_complaint: 'bg-green-100 text-green-700 border border-green-300',
    comment: 'bg-purple-100 text-purple-700 border border-purple-300',
    system: 'bg-orange-100 text-orange-700 border border-orange-300'
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-blue-50 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5 text-blue-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-blue-200 z-50 fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <XIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-blue-50 last:border-0 transition-colors ${!n.isRead ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'hover:bg-blue-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`badge mt-0.5 ${typeColors[n.type] || typeColors.system}`}>
                      {n.type.replace('_', ' ')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mt-1 flex-shrink-0 animate-pulse" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
