import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'business_nexus_user';

// ✅ Ports
const API_URL = 'http://127.0.0.1:5001/api/auth';
const USERS_URL = 'http://127.0.0.1:5001/api/users'; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. APP LOAD LOGIC
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Show old data immediately

        // Check for updates in background
        await checkLatestStatus(parsedUser.id || parsedUser._id, token);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // ✅ HELPER: Check latest status from server
  const checkLatestStatus = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${USERS_URL}/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const freshData = await response.json();
            const isPrem = freshData.isPremium === true || freshData.isPremium === 'true';
            
            const updatedUser = { ...freshData, id: freshData._id, isPremium: isPrem };
            setUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
    } catch (err) {
        console.error("Background check failed", err);
    }
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('token');
    // @ts-ignore
    if (!token || !user) return;
    // @ts-ignore
    await checkLatestStatus(user.id || user._id, token);
  };

  // 🔥 3. LOGIN FUNCTION (UPDATED FOR DUAL PURPOSE) 🛠️
  // Ye function ab "Login" aur "Update Profile" dono kaam karega
  const login = async (emailOrToken: string, passwordOrUser: string | any, role?: UserRole) => {
    
    // 🛑 A. UPDATE PROFILE LOGIC (Agar second cheez Password nahi, User Data hai)
    if (typeof passwordOrUser === 'object') {
        const updatedUser = { ...passwordOrUser, id: passwordOrUser._id };
        
        // 1. State update karo (Foran Navbar change ho jaye)
        setUser(updatedUser);
        
        // 2. Storage update karo (Refresh par data rahay)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        // 3. Token update karo (Agar naya mila hai)
        if (emailOrToken) {
            localStorage.setItem('token', emailOrToken);
        }
        return; // Yahan se wapis chale jao, Login API call mat karo
    }

    // 🚀 B. NORMAL LOGIN LOGIC (Agar second cheez Password hai)
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrToken, password: passwordOrUser }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (data.role !== role) throw new Error(`Please login via ${data.role} portal`);

      localStorage.setItem('token', data.token);

      // Full Profile Fetch
      const profileRes = await fetch(`${USERS_URL}/${data._id}`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      
      let finalUserData = data;
      if (profileRes.ok) {
          finalUserData = await profileRes.json();
      }

      const isPrem = finalUserData.isPremium === true || finalUserData.isPremium === 'true';
      const loggedInUser = { ...finalUserData, id: finalUserData._id, isPremium: isPrem };
      
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      
      toast.success('Login Successful!');
    } catch (error: any) {
      toast.error(error.message);
    } finally { setIsLoading(false); }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('token');
    toast.success('Logged out');
  };

  const value = {
    user, login, logout, isLoading, refreshProfile,
    register: async () => {}, 
    isAuthenticated: !!user,
    forgotPassword: async () => {}, resetPassword: async () => {}, updateProfile: async () => {}
  };

  // @ts-ignore
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};