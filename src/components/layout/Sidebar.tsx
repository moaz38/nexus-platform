import React, { useState, useEffect } from 'react'; // ✅ Added Hooks
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Building2, CircleDollarSign, Users, MessageCircle, 
  Bell, FileText, Settings, HelpCircle, CreditCard 
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  badge?: number | null; // ✅ Added Badge Prop
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center justify-between py-2.5 px-4 rounded-md transition-colors duration-200 ${
          isActive 
            ? 'bg-primary-50 text-primary-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          <span className="text-sm font-medium">{text}</span>
      </div>

      {/* ✅ RED BADGE LOGIC HERE */}
      {badge && (
         <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
            {badge > 99 ? '99+' : badge}
         </span>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [msgCount, setMsgCount] = useState(0);     // ✅ State for Messages
  const [notifCount, setNotifCount] = useState(0); // ✅ State for Notifications

  // ✅ AUTO FETCH COUNTS (Backend se poocho)
  useEffect(() => {
    const fetchCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // 1. Unread Messages
            const msgRes = await fetch('http://localhost:5001/api/chat/unread/count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (msgRes.ok) {
                const data = await msgRes.json();
                setMsgCount(data.count);
            }

            // 2. Unread Notifications
            const notifRes = await fetch('http://localhost:5001/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (notifRes.ok) {
                const data = await notifRes.json();
                const unread = data.filter((n: any) => !n.isRead).length;
                setNotifCount(unread);
            }
        } catch (error) {
            console.error("Sidebar count error", error);
        }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 3000); // Har 3 sec baad check karo
    return () => clearInterval(interval);
  }, []);
  
  if (!user) return null;
  
  // ✅ Safe ID check
  const userId = (user as any)._id || (user as any).id;

  // Define sidebar items based on user role
  const entrepreneurItems = [
    { to: '/', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/entrepreneur/' + userId, icon: <Building2 size={20} />, text: 'My Startup' },
    { to: '/investors', icon: <CircleDollarSign size={20} />, text: 'Find Investors' },
    // ✅ Badge added to Messages
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages', badge: msgCount > 0 ? msgCount : null },
    // ✅ Badge added to Notifications
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications', badge: notifCount > 0 ? notifCount : null },
    { to: '/documents', icon: <FileText size={20} />, text: 'Documents' },
    { to: '/payment', icon: <CreditCard size={20} />, text: 'Membership Plan' },
  ];
  
  const investorItems = [
    { to: '/', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/investor/' + userId, icon: <CircleDollarSign size={20} />, text: 'My Portfolio' },
    { to: '/entrepreneurs', icon: <Users size={20} />, text: 'Find Startups' },
    // ✅ Badge added to Messages
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages', badge: msgCount > 0 ? msgCount : null },
    // ✅ Badge added to Notifications
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications', badge: notifCount > 0 ? notifCount : null },
    { to: '/deals', icon: <FileText size={20} />, text: 'Deals' },
    { to: '/payment', icon: <CreditCard size={20} />, text: 'Membership Plan' },
  ];
  
  const sidebarItems = user.role === 'entrepreneur' ? entrepreneurItems : investorItems;
  
  // Common items at the bottom
  const commonItems = [
    { to: '/settings', icon: <Settings size={20} />, text: 'Settings' },
    { to: '/help', icon: <HelpCircle size={20} />, text: 'Help & Support' },
  ];
  
  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 hidden md:block">
      <div className="h-full flex flex-col">
        {/* ❌ Logo Section Removed */}
        
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-1">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                to={item.to}
                icon={item.icon}
                text={item.text}
                badge={item.badge} // ✅ Pass badge here
              />
            ))}
          </div>
          
          <div className="mt-8 px-3">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settings
            </h3>
            <div className="mt-2 space-y-1">
              {commonItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  text={item.text}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-600">Need assistance?</p>
            <h4 className="text-sm font-medium text-gray-900 mt-1">Contact Support</h4>
            <a 
              href="mailto:support@businessnexus.com" 
              className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
            >
              support@businessnexus.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};