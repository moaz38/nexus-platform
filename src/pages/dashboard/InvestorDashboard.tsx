import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, Check, X, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Meetings
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/meetings/my-meetings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setMeetings(data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [user]);

  // 2. Handle Accept/Reject
  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/meetings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(`Meeting ${status} successfully!`);
        fetchMeetings(); // Refresh list
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (!user) return null;

  const pendingRequests = meetings.filter(m => m.status === 'pending');
  const upcomingMeetings = meetings.filter(m => m.status === 'accepted');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Discover promising startups and manage your portfolio</p>
        </div>
        
        <Link to="/entrepreneurs">
          <Button leftIcon={<TrendingUp size={18} />}>
            Find Startups
          </Button>
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Bell size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Meeting Requests</p>
                <h3 className="text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Users size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Portfolio</p>
                <h3 className="text-xl font-semibold text-secondary-900">0</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
                <h3 className="text-xl font-semibold text-accent-900">{upcomingMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MEETING REQUESTS SECTION */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Meeting Requests</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            
            <CardBody>
              {loading ? (
                  <p>Loading...</p>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((meeting: any) => (
                    <div key={meeting._id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
                        <div>
                            <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                            <p className="text-sm text-gray-500">{meeting.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <Clock size={14} />
                                <span>{meeting.date} at {meeting.time} ({meeting.duration} mins)</span>
                            </div>
                            <div className="mt-1">
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                    Request From: {meeting.senderId?.name || "Entrepreneur"}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleStatusUpdate(meeting._id, 'accepted')}
                                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                                title="Accept Meeting"
                            >
                                <Check size={20} />
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(meeting._id, 'rejected')}
                                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                                title="Reject Meeting"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No new meeting requests.
                </div>
              )}
            </CardBody>
          </Card>

           {/* UPCOMING MEETINGS LIST */}
           <Card>
            <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Your Schedule</h2>
            </CardHeader>
            <CardBody>
                {upcomingMeetings.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingMeetings.map((meeting: any) => (
                             <div key={meeting._id} className="flex items-center p-3 bg-gray-50 rounded-md border-l-4 border-green-500">
                                <div className="flex-1">
                                    <h4 className="font-medium">{meeting.title}</h4>
                                    <p className="text-sm text-gray-500">{meeting.date} • {meeting.time} with {meeting.senderId?.name}</p>
                                </div>
                                <Badge variant="success">Confirmed</Badge>
                             </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500">No upcoming meetings.</p>}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};