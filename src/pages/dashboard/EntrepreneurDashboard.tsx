import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Bell, Calendar, TrendingUp, Check, X, Clock, 
  FileSignature, CheckCircle, XCircle, Plus, Video, 
  FileText, ChevronRight, Mail, User
} from 'lucide-react'; 
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import SignatureModal from '../../components/SignatureModal';
import CreateAgreementModal from '../../components/CreateAgreementModal';
import { Agreement } from '../../types';
import toast from 'react-hot-toast';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // States
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch Data
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5001/api/meetings/my-meetings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgreements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/agreements/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAgreements(data);
      }
    } catch (error) {
      console.error("Error fetching agreements:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchAgreements();
  }, [user]);

  // Handle Meeting Actions
  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/meetings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            toast.success(`Meeting ${status} successfully!`);
            fetchMeetings();
        }
    } catch (error) {
        toast.error("Something went wrong");
    }
  };
  
  if (!user) return null;

  // Filters
  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const upcomingMeetings = meetings.filter(m => m.status === 'accepted');

  const pendingAgreements = agreements.filter(a => !a.entrepreneurSignature);
  const signedAgreements = agreements.filter(a => a.entrepreneurSignature);

  // Helper: Identify the "Other Person" (Investor)
  const getOtherParty = (req: any) => {
    if (!user) return req.senderId;
    return req.senderId._id === user._id ? req.receiverId : req.senderId;
  };

  // Extract Connected Investors for Modal
  const connectedInvestors = upcomingMeetings.map(m => getOtherParty(m))
    .filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);

  return (
    <div className="space-y-6 animate-fade-in min-h-screen bg-gray-50 p-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Manage your startup, meetings, and legal contracts.</p>
        </div>
        
        <div className="flex gap-3">
            <Button 
                variant="outline" 
                leftIcon={<Plus size={18} />}
                onClick={() => setIsCreateModalOpen(true)}
            >
                Create Contract
            </Button>

            <Link to="/investors">
                <Button leftIcon={<TrendingUp size={18} />}>
                    Find Investors
                </Button>
            </Link>
        </div>
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
              const otherPerson = getOtherParty(req);
              return (
                <div key={req._id} className="bg-white rounded-xl shadow-md border-l-4 border-amber-500 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header: Show Investor Details */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                        {otherPerson?.name?.charAt(0) || 'I'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{otherPerson?.name || 'Investor'}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14} /> {otherPerson?.email || 'No Email'}
                        </div>
                      </div>
                      <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        Action Required
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-800 text-lg">{req.title}</h4>
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
                      <button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                        <XCircle size={18}/> Reject
                      </button>
                      <button onClick={() => handleStatusUpdate(req._id, 'accepted')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors">
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

      {/* ✅ UPCOMING SCHEDULE (Confirmed Meetings) */}
      {upcomingMeetings.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
            <Badge variant="success">{upcomingMeetings.length} Confirmed</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMeetings.map((req) => {
               const otherPerson = getOtherParty(req);
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
                        <User size={14}/> Investor
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

      {/* 🔹 AGREEMENTS ACTION CENTER */}
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
                        {/* Investor Details */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                {(agreement.investorId as any)?.name?.charAt(0) || 'I'}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">With Investor</p>
                                <p className="text-sm font-bold text-gray-900">{(agreement.investorId as any)?.name || 'Unknown Investor'}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-indigo-900 mb-1 flex items-center gap-2">
                                <FileText size={18}/> {agreement.documentTitle}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded">
                                {agreement.documentContent}
                            </p>
                        </div>

                        <Button 
                            fullWidth 
                            className="group-hover:bg-indigo-700 transition-colors flex justify-between items-center"
                            onClick={() => setSelectedAgreementId(agreement._id)}
                        >
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
                
                {agreement.investorSignature ? (
                  <div className="absolute top-4 right-4 text-green-100 font-black text-6xl opacity-20 -rotate-12 pointer-events-none">DONE</div>
                ) : (
                  <div className="absolute top-4 right-4 text-yellow-100 font-black text-5xl opacity-50 -rotate-12 pointer-events-none">WAITING</div>
                )}

                <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-gray-400"/> {agreement.documentTitle}
                </h3>
                
                <div className="flex justify-between items-end bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
                  {/* Entrepreneur (You) */}
                  <div className="text-center w-1/2">
                    <div className="h-12 flex items-end justify-center mb-1">
                      {agreement.entrepreneurSignature ? (
                        <img src={agreement.entrepreneurSignature} alt="Ent Sign" className="max-h-12 object-contain" />
                      ) : <span className="text-xs text-gray-400">Pending...</span>}
                    </div>
                    <div className="border-t border-gray-300 w-16 mx-auto mt-1"></div>
                    <p className="text-[10px] text-gray-500 uppercase mt-1 font-bold text-blue-600">You (Signed)</p>
                  </div>

                  {/* Investor */}
                  <div className="text-center w-1/2 border-l border-gray-200">
                    <div className="h-12 flex items-end justify-center mb-1">
                      {agreement.investorSignature ? (
                        <img src={agreement.investorSignature} alt="Inv Sign" className="max-h-12 object-contain" />
                      ) : <span className="text-xs text-gray-400">Pending...</span>}
                    </div>
                    <div className="border-t border-gray-300 w-16 mx-auto mt-1"></div>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Investor</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedAgreementId && (
        <SignatureModal
          agreementId={selectedAgreementId}
          role="entrepreneur"
          onClose={() => setSelectedAgreementId(null)}
          onSuccess={fetchAgreements}
        />
      )}

      <CreateAgreementModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAgreements}
        investors={connectedInvestors} 
      />
    </div>
  );
};