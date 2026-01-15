import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu, X, Bell, MessageCircle, User as UserIcon, LogOut, 
  Building2, CircleDollarSign, Crown, CreditCard 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // ✅ Check Premium Status
  const isPremium = (user as any)?.isPremium;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // User dashboard route based on role
  const dashboardRoute = user?.role === 'entrepreneur' 
    ? '/dashboard/entrepreneur' 
    : '/dashboard/investor';
  
  // User profile route based on role and ID
  const profileRoute = user 
    ? `/profile/${user.role}/${(user as any)._id || (user as any).id}` // ✅ Fix ID access
    : '/login';
  
  const navLinks = [
    {
      icon: user?.role === 'entrepreneur' ? <Building2 size={18} /> : <CircleDollarSign size={18} />,
      text: 'Dashboard',
      path: dashboardRoute,
    },
    {
      icon: <MessageCircle size={18} />,
      text: 'Messages',
      path: user ? '/messages' : '/login',
    },
    {
      icon: <Bell size={18} />,
      text: 'Notifications',
      path: user ? '/notifications' : '/login',
    },
    {
      icon: <UserIcon size={18} />,
      text: 'Profile',
      path: profileRoute,
    }
  ];
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Business Nexus
              </span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:ml-6">
            {user ? (
              <div className="flex items-center space-x-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.text}
                  </Link>
                ))}

                {/* 🔥 PREMIUM BADGE (Desktop) */}
                {isPremium ? (
                    <Link to="/payment" className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-yellow-300 transform hover:scale-105 transition-transform mr-2">
                        <Crown size={14} fill="currentColor" />
                        <span>PRO</span>
                    </Link>
                ) : (
                    <Link to="/payment" className="text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors mr-2">
                        Upgrade
                    </Link>
                )}
                
                <Button 
                  variant="ghost"
                  onClick={handleLogout}
                  leftIcon={<LogOut size={18} />}
                >
                  Logout
                </Button>
                
                <Link to={profileRoute} className="flex items-center space-x-2 ml-2">
                  {/* 🔥 GOLDEN RING For Premium Users */}
                  <div className={`rounded-full ${isPremium ? 'p-0.5 bg-gradient-to-r from-yellow-400 to-amber-500' : ''}`}>
                    <Avatar
                        // 🔥 KEY ADDED: Ye photo ko force update karega jab URL change hoga
                        key={user.avatarUrl} 
                        src={user.avatarUrl || ''} 
                        alt={user.name || 'User'} 
                        size="sm"
                        status={user.isOnline ? 'online' : 'offline'}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg mx-2 mb-2">
                  <div className={`rounded-full ${isPremium ? 'p-0.5 bg-gradient-to-r from-yellow-400 to-amber-500' : ''}`}>
                    <Avatar
                        // 🔥 KEY ADDED HERE TOO
                        key={user.avatarUrl}
                        src={user.avatarUrl || ''} 
                        alt={user.name || 'User'}
                        size="sm"
                        status={user.isOnline ? 'online' : 'offline'}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        {isPremium && <Crown size={12} className="text-yellow-600 fill-current" />}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.path}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.text}
                    </Link>
                  ))}

                  {/* 🔥 Mobile Membership Link */}
                  <Link
                      to="/payment"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CreditCard size={18} className="mr-3" />
                      {isPremium ? <span className="text-yellow-600 font-bold">Pro Membership Active</span> : "Upgrade Plan"}
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link 
                  to="/login" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>Log in</Button>
                </Link>
                <Link 
                  to="/register" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button fullWidth>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};