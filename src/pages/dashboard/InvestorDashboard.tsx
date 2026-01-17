import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Calendar, Users, 
  MessageCircle, ExternalLink, Briefcase, DollarSign, FileSignature 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge'; // Badge import kiya
import { Card, CardBody, CardHeader } from '../../components/ui/Card'; // Cards import kiye
import SignatureModal from '../../components/SignatureModal'; // SignatureModal import kiya
import { Agreement } from '../../types'; // Agreement type import kiya
import { useAuth } from '../../context/AuthContext';

export const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');

  // 🔥 NEW: Agreements States (Milestone 5)
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch Entrepreneurs
      const entResponse = await fetch('http://localhost:5001/api/users?role=entrepreneur', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (entResponse.ok) {
        const data = await entResponse.json();
        setEntrepreneurs(data);
      }

      // 2. 🔥 NEW: Fetch Agreements (Milestone 5)
      const agrResponse = await fetch('http://localhost:5001/api/agreements/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (agrResponse.ok) {
        const data = await agrResponse.json();
        setAgreements(data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Filter Logic
  const filteredEntrepreneurs = entrepreneurs.filter(ent => {
    const matchesSearch = ent.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ent.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'All' || ent.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  // 🔥 Filter Agreements for Investor Signature
  const pendingAgreements = agreements.filter(a => a.status !== 'completed' && !a.investorSignature);

  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
           <p className="text-gray-500">Discover promising startups looking for investment</p>
        </div>
        <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* 🔥 NEW: PENDING AGREEMENTS SECTION (Milestone 5) */}
      {pendingAgreements.length > 0 && (
        <div className="mb-8">
          <Card className="border-2 border-indigo-200 bg-indigo-50">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileSignature className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-indigo-900">Pending Investment Agreements</h2>
              </div>
              <Badge variant="primary">{pendingAgreements.length} Actions Required</Badge>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {pendingAgreements.map((agreement) => (
                  <div key={agreement.id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                    <div>
                      <h4 className="font-semibold text-gray-900">{agreement.documentTitle}</h4>
                      <p className="text-xs text-gray-500 font-medium">Agreement between you and the founder. Sign to finalize the deal.</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedAgreementId(agreement.id)}
                    >
                      Sign Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR - Bilkul pehle jaisa hai */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter size={18} /> Filters
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
              >
                <option value="All">All Industries</option>
                <option value="Tech">Tech</option>
                <option value="Health">Healthcare</option>
                <option value="Finance">Fintech</option>
                <option value="Education">Education</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Funding Stage</label>
              <div className="space-y-2">
                  {['Seed', 'Series A', 'Series B'].map(stage => (
                      <div key={stage} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded text-indigo-600" />
                          <span className="text-sm text-gray-600">{stage}</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARDS GRID - Bilkul pehle jaisa hai */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by founder or company name..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntrepreneurs.map((ent) => (
              <div key={ent._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                {/* Header with Avatar */}
                <div className="flex items-start gap-4 mb-4">
                    <Avatar 
                        src={ent.avatarUrl} 
                        alt={ent.name} 
                        size="lg" 
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{ent.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{ent.companyName || 'Startup Founder'}</p>
                      
                      <div className="flex gap-2 mt-1">
                         <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                           <MapPin size={10} /> {ent.location || 'Remote'}
                         </span>
                         <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-100">
                           <Calendar size={10} /> {ent.createdAt ? new Date(ent.createdAt).getFullYear() : '2025'}
                         </span>
                      </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="mb-6 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pitch Summary</p>
                    <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                      {ent.bio || "This founder is working on something exciting. View profile for full details."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Funding Need</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <DollarSign size={14} className="text-green-500"/> $500k - $1M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Team Size</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Users size={14} className="text-blue-500"/> 1-10 people
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-auto">
                  <Button variant="outline" fullWidth size="sm" onClick={() => navigate(`/chat/${ent._id}`)}>
                    <MessageCircle size={16} className="mr-2" /> Message
                  </Button>
                  <Button variant="primary" fullWidth size="sm" onClick={() => navigate(`/profile/entrepreneur/${ent._id}`)}>
                    View Profile <ExternalLink size={16} className="ml-2" /> 
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEntrepreneurs.length === 0 && !loading && (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No startups found matching your filters.</p>
             </div>
          )}
        </div>
      </div>

      {/* 🔥 SIGNATURE MODAL (Milestone 5) */}
      {selectedAgreementId && (
        <SignatureModal
          agreementId={selectedAgreementId}
          role="investor"
          onClose={() => setSelectedAgreementId(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};