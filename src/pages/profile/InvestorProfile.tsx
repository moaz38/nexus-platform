import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, TrendingUp, FileText, MapPin, Briefcase, 
  ShieldCheck, Crown, Globe, Mail, Building2, Download
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

// Types to avoid errors
interface Document {
  _id: string;
  name: string;
  url: string;
  size?: string;
}

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingPitch, setSendingPitch] = useState(false); // 🔥 New State for button loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!id) return;

        // 1. Fetch Investor
        const userRes = await fetch(`http://localhost:5001/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userRes.ok) {
            const userData = await userRes.json();
            setInvestor(userData);
        }

        // 2. Fetch Documents
        const docRes = await fetch(`http://localhost:5001/api/documents/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (docRes.ok) {
            const docData = await docRes.json();
            setDocuments(docData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleMessage = () => navigate(`/chat/${id}`);

  // 🔥 FIXED: Ab ye Backend par Asli Request Bhejega
  const handlePitch = async () => {
    setSendingPitch(true);
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5001/api/investments/request', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ investorId: id }) // Investor ID backend ko bheji
        });

        const data = await response.json();

        if (response.ok) {
            toast.success("Pitch Request Sent Successfully!");
        } else {
            // Agar pehle se request bheji hui ho tu error dikhaye
            toast.error(data.message || "Failed to send pitch");
        }
    } catch (error) {
        toast.error("Server Error: Could not send request");
    } finally {
        setSendingPitch(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Profile...</div>;
  if (!investor) return <div className="p-20 text-center text-red-500">Investor not found</div>;

  const isPremium = investor.isPremium;

  return (
    <div className="min-h-screen bg-gray-100 pb-10 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-white shadow-sm mb-4">
        <div className={`h-48 w-full ${isPremium ? 'bg-gradient-to-r from-teal-800 to-emerald-600' : 'bg-gray-300'}`}>
           {isPremium && (
             <div className="absolute top-4 right-4 bg-black/20 text-white px-3 py-1 rounded text-xs font-bold tracking-wider">
               PREMIUM INVESTOR
             </div>
           )}
        </div>

        <div className="max-w-5xl mx-auto px-4 relative pb-6">
            
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
                <div className={`rounded-full p-1 bg-white transform scale-150 origin-bottom-left ${isPremium ? 'border-2 border-yellow-500' : ''}`}>
                    <Avatar 
                        src={investor.avatarUrl || ''} 
                        alt={investor.name} 
                        size="xl" 
                    />
                </div>
            </div>

            {/* Actions (Top Right) */}
            <div className="flex justify-end pt-4 gap-3 mb-12 md:mb-0">
                 <Button variant="outline" onClick={handleMessage}>
                    <div className="flex items-center gap-2"><MessageCircle size={18} /> Message</div>
                 </Button>
                 
                 {/* 🔥 UPDATED BUTTON with Loading State */}
                 <Button 
                    variant="primary" 
                    onClick={handlePitch} 
                    disabled={sendingPitch}
                    className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                 >
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} /> 
                        {sendingPitch ? "Sending..." : "Pitch Your Idea"}
                    </div>
                 </Button>
            </div>

            {/* Name & Headline */}
            <div className="mt-8 md:mt-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
                    
                    {isPremium && (
                      <div className="text-yellow-500" title="Premium Investor">
                        <Crown size={20} fill="currentColor" />
                      </div>
                    )}
                    {isPremium && (
                      <div className="text-emerald-500" title="Verified Fund">
                        <ShieldCheck size={20} />
                      </div>
                    )}
                </div>
                
                <p className="text-gray-900 text-lg mt-1 font-medium flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400"/>
                    {investor.companyName || "Angel Investor"}
                </p>
                
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><Briefcase size={14}/> Focus: {investor.industry || 'Tech & SaaS'}</div>
                    <div className="flex items-center gap-1"><MapPin size={14}/> {investor.location || 'Global'}</div>
                </div>
                
                <div className="mt-4 flex gap-2">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                        Active Investor
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                        Seed / Series A
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* --- DETAILS GRID --- */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Investment Philosophy</h2>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {investor.bio || "No investment philosophy details added."}
                  </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Portfolio & Requirements</h2>
                  {documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {documents.map((doc: Document) => (
                              <div key={doc._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition bg-gray-50 flex items-center gap-3">
                                  <div className="text-emerald-600 bg-emerald-100 p-2 rounded"><FileText size={20} /></div>
                                  <div className="overflow-hidden">
                                      <h4 className="font-semibold text-sm truncate text-gray-900">{doc.name}</h4>
                                      <div className="flex gap-3 mt-1 text-xs text-blue-600 font-bold">
                                          <a href={doc.url} target="_blank" rel="noreferrer" className="hover:underline">View</a>
                                          <a href={doc.url} download className="hover:underline flex items-center gap-1"><Download size={10}/> Download</a>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-gray-400 text-sm">No documents listed.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                   <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Contact Info</h3>
                   <ul className="space-y-4">
                       <li className="flex items-center text-sm text-gray-700 gap-3">
                           <Mail size={16} className="text-emerald-600" />
                           <span className="truncate">{investor.email}</span>
                       </li>
                       <li className="flex items-center text-sm text-gray-700 gap-3">
                           <Globe size={16} className="text-emerald-600" />
                           <span className="truncate">www.{investor.companyName?.replace(/\s/g, '').toLowerCase() || 'firm'}.com</span>
                       </li>
                   </ul>
              </div>
          </div>

      </div>
    </div>
  );
};