import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Calendar, Users, 
  MessageCircle, ExternalLink, Briefcase, DollarSign 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar'; // ✅ Updated Avatar Import

export const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');

  useEffect(() => {
    const fetchEntrepreneurs = async () => {
      try {
        const token = localStorage.getItem('token');
        // Port 5001 se data la rahe hain
        const response = await fetch('http://localhost:5001/api/users?role=entrepreneur', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEntrepreneurs(data);
        }
      } catch (error) {
        console.error("Error fetching startups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepreneurs();
  }, []);

  // Filter Logic
  const filteredEntrepreneurs = entrepreneurs.filter(ent => {
    const matchesSearch = ent.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ent.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'All' || ent.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS SIDEBAR */}
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

        {/* CARDS GRID */}
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
                
                {/* 1. Header with Auto-Fixing Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  
                    {/* ✅ Ab humne simple Avatar use kiya hai jo tootay ga nahi */}
                    <Avatar 
                        src={ent.avatarUrl} 
                        alt={ent.name} 
                        size="lg" // Card ke liye bara size
                    />

                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{ent.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{ent.companyName || 'Startup Founder'}</p>
                      
                      <div className="flex gap-2 mt-1">
                         <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                           <MapPin size={10} /> {ent.location || 'Remote'}
                         </span>
                         <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-100">
                           <Calendar size={10} /> {new Date(ent.createdAt).getFullYear()}
                         </span>
                      </div>
                    </div>
                </div>

                {/* 2. Body Content */}
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

                {/* 3. Footer Buttons */}
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
                <button onClick={() => {setSearchTerm(''); setFilterIndustry('All')}} className="text-indigo-600 text-sm font-bold mt-2 hover:underline">
                  Clear Filters
                </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};