export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  _id: string;        // ✅ MongoDB ID
  id?: string;        // Optional (Backwards compatibility)
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string; 
  bio?: string;       
  isOnline?: boolean;
  createdAt?: string;
  location?: string;  
  isPremium?: boolean;
  
  // ✅ FIX 1: companyName add kiya (Red line hat jayegi)
  companyName?: string; 
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
  _id: string; 
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  _id: string; 
  id?: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  _id: string; 
  id?: string;
  senderId: string; 
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
  sender?: User; 
}

export interface Document {
  _id: string; 
  id?: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export interface Agreement {
  _id: string; 
  id?: string;
  entrepreneurId: string | User;
  investorId: string | User;
  documentTitle: string;
  documentContent: string;
  entrepreneurSignature?: string; 
  investorSignature?: string;     
  status: 'pending' | 'partially_signed' | 'completed';
  signedAt?: string;
  createdAt: string;
  companyName?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  // ✅ FIX 2: Yahan 'FormData' allow kiya (fd wala error hat jayega)
  updateProfile: (userId: string, updates: Partial<User> | FormData) => Promise<void>;
  
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}