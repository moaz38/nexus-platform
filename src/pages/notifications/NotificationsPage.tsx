import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar'; 
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: 'message' | 'alert' | 'system';
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    avatarUrl?: string;
  };
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. 🔥 MARK ALL AS READ FUNCTION (Backend Call)
  const handleMarkAllRead = async () => {
    try {
        // UI Update (Optimistic) - Foran user ko dikhao ke read ho gaye
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/notifications/mark-all-read', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success("All notifications marked as read");
        }
    } catch (error) {
        console.error("Failed to mark all read");
    }
  };

  // 3. Mark Single as Read
  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare size={18} className="text-blue-500" />;
      case 'alert': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-gray-500" />;
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading updates...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500">Stay updated with your network activity</p>
          </div>
          
          {/* 🔥 Button Ab Backend se Connect Hai */}
          {notifications.some(n => !n.isRead) && (
              <button 
                 onClick={handleMarkAllRead}
                 className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 bg-indigo-50 rounded-lg transition-colors hover:bg-indigo-100"
              >
                <CheckCheck size={16} /> Mark all as read
              </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    notif.isRead 
                    ? 'bg-white border-gray-100 opacity-75' 
                    : 'bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-50'
                }`}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
              >
                <div className="flex-shrink-0">
                    {notif.sender ? (
                        <Avatar src={notif.sender.avatarUrl} alt={notif.sender.name} size="md" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getIcon(notif.type)}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                        {notif.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                    </p>
                </div>

                {!notif.isRead && (
                    <div className="flex-shrink-0 flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                    </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                <p className="text-gray-500">We'll let you know when something important happens.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};