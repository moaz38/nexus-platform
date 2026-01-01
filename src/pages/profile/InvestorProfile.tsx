import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Building2, MapPin, Briefcase } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Investor } from '../../types';

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  // Real Data State
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch from Backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        // Backend API Call
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          // Data formatting to match Frontend Types
          const formattedInvestor: Investor = {
            id: data._id, 
            name: data.name,
            email: data.email,
            role: 'investor',
            // Fix for Avatar Error: Agar avatar na ho to default bana do
            avatarUrl: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
            bio: data.bio || '',
            isOnline: true,
            location: data.location || 'San Francisco, CA',
            createdAt: data.createdAt,
            
            // Investor Specifics
            portfolioCompanies: data.portfolioCompanies || [], 
            totalInvestments: data.totalInvestments || 0,
            minimumInvestment: data.minimumInvestment || "$10k",
            maximumInvestment: data.maximumInvestment || "$50k",
            investmentStage: data.investmentStage || [],
            investmentInterests: data.investmentInterests || []
          };
          setInvestor(formattedInvestor);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserProfile();
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading Profile...</div>;

  if (!investor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Investor not found</h2>
        <Link to="/investors">
          <Button variant="outline" className="mt-4">Back to List</Button>
        </Link>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === investor.id;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={investor.avatarUrl || ''} // Safety check added here too
              alt={investor.name}
              size="xl"
              status={investor.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Investor • {investor.totalInvestments} investments
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">
                  <MapPin size={14} className="mr-1" />
                  {investor.location}
                </Badge>
                {investor.investmentStage.map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <Link to={`/chat/${investor.id}`}>
                <Button leftIcon={<MessageCircle size={18} />}>
                  Message
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="text-lg font-medium text-gray-900">About</h2></CardHeader>
            <CardBody><p className="text-gray-700">{investor.bio}</p></CardBody>
          </Card>
          
          <Card>
            <CardHeader><h2 className="text-lg font-medium text-gray-900">Portfolio Companies</h2></CardHeader>
            <CardBody>
              {investor.portfolioCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {investor.portfolioCompanies.map((company, index) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-md">
                        <div className="p-3 bg-primary-50 rounded-md mr-3">
                          <Briefcase size={18} className="text-primary-700" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{company}</h3>
                          <p className="text-xs text-gray-500">Portfolio Company</p>
                        </div>
                      </div>
                    ))}
                  </div>
              ) : <p className="text-gray-500">No portfolio companies listed.</p>}
            </CardBody>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="text-lg font-medium text-gray-900">Investment Details</h2></CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Range</span>
                  <p className="text-lg font-semibold text-gray-900">{investor.minimumInvestment} - {investor.maximumInvestment}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};