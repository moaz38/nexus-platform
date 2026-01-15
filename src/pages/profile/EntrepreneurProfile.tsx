import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Calendar, FileText, MapPin, Briefcase, 
  ShieldCheck, Crown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

// ✅ Types define kar diye taake "any" ka error na aaye
interface Document {
  _id: string;
  name: string;
  url: string;
  size?: string;
}

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entrepreneur, setEntrepreneur] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!id) return;

        // 1. Fetch User
        const userRes = await fetch(`http://localhost:5001/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userRes.ok) {
            const userData = await userRes.json();
            setEntrepreneur(userData);
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
  const handleScheduleMeeting = () => {
    navigate('/investors');
    toast.success("Please verify availability in Investors tab.");
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!entrepreneur) return <div className="p-20 text-center text-red-500">User not found</div>;

  const isPremium = entrepreneur.isPremium;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      
      {/* Cover Photo */}
      <div className="relative bg-white shadow-sm mb-4">
        <div className={`h-48 w-full ${isPremium ? 'bg-gradient-to-r from-blue-800 to-blue-600' : 'bg-gray-300'}`}>
           {isPremium && (
             <div className="absolute top-4 right-4 bg-black bg-opacity-30 text-white px-3 py-1 rounded text-xs font-bold">
               PREMIUM
             </div>
           )}
        </div>

        <div className="max-w-5xl mx-auto px-4 relative pb-6">
            
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
                <div className={`rounded-full p-1 bg-white ${isPremium ? 'border-2 border-yellow-500' : ''}`}>
                    {/* ✅ FIX: Size '2xl' hata diya, 'xl' use kiya */}
                    <Avatar 
                        src={entrepreneur.avatarUrl || ''} 
                        alt={entrepreneur.name} 
                        size="xl" 
                    />
                </div>
            </div>

            {/* Actions (Top Right) */}
            <div className="flex justify-end pt-4 gap-3 mb-12 md:mb-0">
                 <Button variant="outline" onClick={handleMessage}>
                    <div className="flex items-center gap-2"><MessageCircle size={18} /> Message</div>
                 </Button>
                 <Button variant="primary" onClick={handleScheduleMeeting}>
                    <div className="flex items-center gap-2"><Calendar size={18} /> Book Meeting</div>
                 </Button>
            </div>

            {/* Name & Headline */}
            <div className="mt-4 md:mt-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
                    
                    {/* ✅ FIX: Icons ko div mein wrap kiya taake TypeScript error na de */}
                    {isPremium && (
                      <div className="text-yellow-500" title="Premium">
                        <Crown size={20} />
                      </div>
                    )}
                    {isPremium && (
                      <div className="text-blue-500" title="Verified">
                        <ShieldCheck size={20} />
                      </div>
                    )}
                </div>
                
                <p className="text-gray-900 text-lg mt-1 font-medium">{entrepreneur.companyName}</p>
                
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><Briefcase size={14}/> Founder</div>
                    <div className="flex items-center gap-1"><MapPin size={14}/> {entrepreneur.location || 'Pakistan'}</div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 font-bold">500+ connections</div>
            </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">About</h2>
                  <p className="text-gray-800 text-sm whitespace-pre-line">
                      {entrepreneur.bio || "No bio provided yet."}
                  </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Featured Documents</h2>
                  {documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {documents.map((doc: Document) => (
                              <div key={doc._id} className="border rounded-lg p-3 hover:shadow-md transition bg-gray-50 flex items-center gap-3">
                                  <div className="text-gray-500"><FileText size={24} /></div>
                                  <div className="overflow-hidden">
                                      <h4 className="font-semibold text-sm truncate">{doc.name}</h4>
                                      <div className="flex gap-3 mt-1 text-xs text-blue-600 font-bold">
                                          <a href={doc.url} target="_blank" rel="noreferrer">View</a>
                                          <a href={doc.url} download>Download</a>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-gray-500 text-sm">No documents.</p>
                  )}
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                   <h3 className="text-base font-bold mb-2">Public Profile</h3>
                   <p className="text-gray-500 text-xs break-all">
                     www.nexus.com/in/{entrepreneur.name?.replace(/\s/g, '').toLowerCase()}
                   </p>
              </div>
          </div>

      </div>
    </div>
  );
};