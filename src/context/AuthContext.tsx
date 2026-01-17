import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'business_nexus_user';

const API_URL = 'http://127.0.0.1:5001/api/auth';
const USERS_URL = 'http://127.0.0.1:5001/api/users'; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          await checkLatestStatus(parsedUser.id || parsedUser._id, token);
        } catch (e) {
          localStorage.clear(); 
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const checkLatestStatus = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${USERS_URL}/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const freshData = await response.json();
            const updatedUser = { ...freshData, id: freshData._id };
            setUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
    } catch (err) {
        console.error("Status check failed", err);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      localStorage.clear(); 
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('token', data.token);
      const loggedInUser = { ...data, id: data._id };
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      toast.success('Registration Successful!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally { setIsLoading(false); }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem(USER_STORAGE_KEY);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid email or password');
      
      if (data.role !== role) {
        throw new Error(`Account registered as ${data.role}. Use correct portal.`);
      }

      localStorage.setItem('token', data.token);
      const loggedInUser = { ...data, id: data._id };
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      
      toast.success('Login Successful!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally { setIsLoading(false); }
  };

  // 🔥 UPDATED: updateProfile function for Bio edit fix
  const updateProfile = async (userId: string, updates: Partial<User>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${USERS_URL}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        // ✨ Naya token aur data save karein taake logout na ho
        localStorage.setItem('token', data.token);
        const updatedUser = { ...data, id: data._id };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear(); 
    toast.success('Logged out successfully');
    window.location.href = '/login'; 
  };

  const value = {
    user, login, logout, isLoading, register, updateProfile,
    isAuthenticated: !!user,
    refreshProfile: async () => {
        const token = localStorage.getItem('token');
        if (user && token) await checkLatestStatus(user.id || (user as any)._id, token);
    },
    forgotPassword: async () => {},
    resetPassword: async () => {}
  };

  // @ts-ignore
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};