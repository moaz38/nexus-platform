import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, Calendar } from 'lucide-react'; 
import { Investor } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast'; 

interface InvestorCardProps {
  investor: Investor;
  showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  showActions = true
}) => {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    navigate(`/profile/investor/${investor.id}`);
  };
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/chat/${investor.id}`);
  };

  // *** SCHEDULE MEETING FUNCTION ***
  const handleScheduleMeeting = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to schedule meetings');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Intro Meeting with ${investor.name}`,
          description: "Discussing potential investment opportunities.",
          date: "2025-01-15", 
          time: "10:00",      
          duration: 30,
          receiverId: investor.id, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Meeting Request Sent Successfully! 📅');
      } else {
        toast.error(data.message || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Meeting Error:', error);
      toast.error('Server error. Is backend running?');
    }
  };
  
  return (
    <Card 
      hoverable 
      className="transition-all duration-300 h-full"
      onClick={handleViewProfile}
    >
      <CardBody className="flex flex-col">
        <div className="flex items-start">
          <Avatar
            // *** FIX: Fallback to empty string for safety ***
            src={investor.avatarUrl || ''} 
            alt={investor.name}
            size="lg"
            status={investor.isOnline ? 'online' : 'offline'}
            className="mr-4"
          />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{investor.name}</h3>
            <p className="text-sm text-gray-500 mb-2">Investor • {investor.totalInvestments || 0} investments</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {investor.investmentStage?.map((stage, index) => (
                <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Investment Interests</h4>
          <div className="flex flex-wrap gap-2">
            {investor.investmentInterests?.map((interest, index) => (
              <Badge key={index} variant="primary" size="sm">{interest}</Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 line-clamp-2">{investor.bio}</p>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500">Investment Range</span>
            <p className="text-sm font-medium text-gray-900">{investor.minimumInvestment || '$10k'} - {investor.maximumInvestment || '$50k'}</p>
          </div>
        </div>
      </CardBody>
      
      {showActions && (
        <CardFooter className="border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            {/* Chat Button */}
            <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<MessageCircle size={16} />}
                onClick={handleMessage}
            >
                Chat
            </Button>

            {/* View Profile Button */}
            <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<ExternalLink size={16} />}
                onClick={handleViewProfile}
            >
                Profile
            </Button>
          </div>
            
          {/* Schedule Meeting Button (Full Width) */}
          <Button
              variant="primary"
              size="sm"
              className="w-full"
              leftIcon={<Calendar size={16} />}
              onClick={handleScheduleMeeting}
          >
              Schedule Meeting
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};