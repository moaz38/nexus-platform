export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string; // Optional kar diya taake crash na ho
  bio?: string;       // Optional
  isOnline?: boolean;
  createdAt?: string;
  location?: string;  // ✅ Ye Naya add kiya hai (Error fix karne ke liye)
  isPremium?: boolean;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName?: string;
  pitchSummary?: string;
  fundingNeeded?: string;
  industry?: string;
  foundedYear?: number;
  teamSize?: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  senderId: string; // Changed from investorId/entrepreneurId to generic sender/receiver
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
  sender?: User; // UI display ke liye
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}