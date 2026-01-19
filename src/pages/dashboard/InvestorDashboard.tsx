import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Filter, Clock,
  FileSignature, CheckCircle, XCircle, Calendar, Mail, FileText, ChevronRight, Video, User
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import SignatureModal from '../../components/SignatureModal';
import { Agreement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');

  // Meeting Requests
  const [investmentRequests, setInvestmentRequests] = useState<any[]>([]);

  // Agreements
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = 'http://localhost:5001/api';

      // 1. Entrepreneurs
      const entResponse = await fetch(`${baseUrl}/users?role=entrepreneur`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (entResponse.ok) setEntrepreneurs(await entResponse.json());

      // 2. Meeting Requests
      const reqResponse = await fetch(`${baseUrl}/meetings/my-meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (reqResponse.ok) setInvestmentRequests(await reqResponse.json());

      // 3. Agreements
      const agrResponse = await fetch(`${baseUrl}/agreements/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (agrResponse.ok) setAgreements(await agrResponse.json());

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Accept / Reject Logic
  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const statusValue = action === 'accept' ? 'accepted' : 'rejected';

      const response = await fetch(`http://localhost:5001/api/meetings/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: statusValue })
      });

      if (response.ok) {
        toast.success(`Meeting Request ${action === 'accept' ? 'Approved' : 'Rejected'}!`);
        fetchData(); 
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const filteredEntrepreneurs = entrepreneurs.filter(ent => {
    const matchesSearch = ent.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ent.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'All' || ent.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  const pendingAgreements = agreements.filter(a => !a.investorSignature);
  const signedAgreements = agreements.filter(a => a.investorSignature);

  const pendingMeetings = investmentRequests.filter(req => req.status === 'pending');
  const confirmedMeetings = investmentRequests.filter(req => req.status === 'accepted');

  // 🔥 HELPER: Identify the "Other Person" (Not Me)
  const getOtherParty = (req: any) => {
    if (!user) return req.senderId;
    // Agar main Sender hoon, to Receiver dikhao. Agar main Receiver hoon, to Sender dikhao.
    return req.senderId._id === user._id ? req.receiverId : req.senderId;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Investor Control Center</h1>
           <p className="text-gray-500">Welcome back, {user?.name}! Manage your deal flow.</p>
        </div>
        <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>

      {/* 🔴 PENDING MEETING REQUESTS */}
      {pendingMeetings.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-amber-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Meeting Requests</h2>
            <Badge variant="warning">{pendingMeetings.length} Pending</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingMeetings.map((req) => {
              const otherPerson = getOtherParty(req); // 🔥 Correct Person Fetch
              
              return (
                <div key={req._id} className="bg-white rounded-xl shadow-md border-l-4 border-amber-500 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header: Show Entrepreneur Details */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                        {otherPerson?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{otherPerson?.name || 'Unknown User'}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14} /> {otherPerson?.email || 'No Email'}
                        </div>
                      </div>
                      <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        Needs Review
                      </span>
                    </div>

                    {/* Meeting Details */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Meeting with {otherPerson?.name}
                      </h4>
                      <p className="text-sm text-gray-600 italic">"{req.description}"</p>
                      
                      <div className="flex gap-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} className="text-indigo-500"/> 
                          <span className="font-medium">{req.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} className="text-indigo-500"/> 
                          <span className="font-medium">{req.time} ({req.duration} mins)</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button onClick={() => handleRequestAction(req._id, 'reject')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                        <XCircle size={18}/> Reject
                      </button>
                      <button onClick={() => handleRequestAction(req._id, 'accept')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors">
                        <CheckCircle size={18}/> Accept
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ UPCOMING SCHEDULE (Accepted Meetings) */}
      {confirmedMeetings.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
            <Badge variant="success">{confirmedMeetings.length} Confirmed</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {confirmedMeetings.map((req) => {
               const otherPerson = getOtherParty(req); // 🔥 Correct Person Fetch

               return (
                <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row items-center gap-5 hover:border-indigo-300 transition-colors">
                  {/* Date Box */}
                  <div className="bg-indigo-50 p-4 rounded-xl text-center min-w-[100px]">
                    <span className="block text-indigo-800 font-bold text-xl">{req.date.split('-')[2]}</span>
                    <span className="block text-indigo-600 text-xs uppercase font-bold">Month</span> 
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Meeting with {otherPerson?.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <User size={14}/> {otherPerson?.role === 'entrepreneur' ? 'Entrepreneur' : 'Investor'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded w-fit">
                        <Clock size={14}/> {req.time} ({req.duration} mins)
                    </div>
                  </div>

                  {/* Join Button */}
                  <Link to={`/room/${req._id}`}>
                    <Button size="sm" leftIcon={<Video size={16}/>} className="bg-indigo-600 hover:bg-indigo-700">
                      Join Call
                    </Button>
                  </Link>
                </div>
               );
            })}
          </div>
        </div>
      )}

      {/* 🔹 LEGAL CONTRACTS SECTION */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <FileSignature className="text-indigo-600" size={24} />
             <h2 className="text-xl font-bold text-gray-900">Legal Contracts Action Center</h2>
          </div>
          {pendingAgreements.length > 0 && <Badge variant="primary">{pendingAgreements.length} To Sign</Badge>}
        </div>

        {pendingAgreements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingAgreements.map((agreement) => (
              <div key={agreement._id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:border-indigo-300 transition-all group relative overflow-hidden">
                <div className="h-2 bg-indigo-500 w-full"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        {(agreement.entrepreneurId as any)?.name?.charAt(0) || 'E'}
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">From Entrepreneur</p>
                        <p className="text-sm font-bold text-gray-900">{(agreement.entrepreneurId as any)?.name || 'Unknown'}</p>
                     </div>
                  </div>
                  <div className="mb-6">
                     <h3 className="text-lg font-bold text-indigo-900 mb-1 flex items-center gap-2"><FileText size={18}/> {agreement.documentTitle}</h3>
                     <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded">{agreement.documentContent}</p>
                  </div>
                  <Button fullWidth className="group-hover:bg-indigo-700 transition-colors flex justify-between items-center" onClick={() => setSelectedAgreementId(agreement._id)}>
                    <span>Review & Sign</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="text-gray-400" size={24} />
            </div>
            <h3 className="text-gray-900 font-medium">All caught up!</h3>
            <p className="text-gray-500 text-sm">No pending contracts waiting for your signature.</p>
          </div>
        )}
      </div>

      {/* ✅ SIGNED ARCHIVE */}
      {signedAgreements.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Signed Archive</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {signedAgreements.map((agreement) => (
              <div key={agreement._id} className="bg-white p-6 rounded-xl border border-green-200 shadow-sm relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                
                {agreement.entrepreneurSignature ? (
                  <div className="absolute top-4 right-4 text-green-100 font-black text-6xl opacity-20 -rotate-12 pointer-events-none">DONE</div>
                ) : (
                  <div className="absolute top-4 right-4 text-yellow-100 font-black text-5xl opacity-50 -rotate-12 pointer-events-none">WAITING</div>
                )}

                <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-gray-400"/> {agreement.documentTitle}
                </h3>
                
                <div className="flex justify-between items-end bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
                  <div className="text-center w-1/2">
                    <div className="h-12 flex items-end justify-center mb-1">
                      {agreement.entrepreneurSignature ? (
                        <img src={agreement.entrepreneurSignature} alt="Ent Sign" className="max-h-12 object-contain" />
                      ) : <span className="text-xs text-gray-400">Pending...</span>}
                    </div>
                    <div className="border-t border-gray-300 w-16 mx-auto mt-1"></div>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Entrepreneur</p>
                  </div>

                  <div className="text-center w-1/2 border-l border-gray-200">
                    <div className="h-12 flex items-end justify-center mb-1">
                      <img src={agreement.investorSignature!} alt="Inv Sign" className="max-h-12 object-contain" />
                    </div>
                    <div className="border-t border-gray-300 w-16 mx-auto mt-1"></div>
                    <p className="text-[10px] text-gray-500 uppercase mt-1 font-bold text-indigo-600">You (Signed)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discover Startups Section */}
      <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Search size={22} className="text-indigo-600"/> Discover New Startups
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Filter size={18} /> Filters</h3>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}>
                  <option value="All">All Industries</option>
                  <option value="Tech">Tech</option>
                  <option value="Health">Healthcare</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search startups..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEntrepreneurs.map((ent) => (
                  <div key={ent._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar src={ent.avatarUrl} alt={ent.name} size="lg" />
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{ent.name}</h3>
                        <p className="text-sm text-gray-500">{ent.companyName || 'Startup Founder'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <Button variant="outline" fullWidth size="sm" onClick={() => navigate(`/chat/${ent._id}`)}>Message</Button>
                      <Button variant="primary" fullWidth size="sm" onClick={() => navigate(`/profile/entrepreneur/${ent._id}`)}>View Profile</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>

      {selectedAgreementId && (
        <SignatureModal agreementId={selectedAgreementId} role="investor" onClose={() => setSelectedAgreementId(null)} onSuccess={fetchData} />
      )}
    </div>
  );
};