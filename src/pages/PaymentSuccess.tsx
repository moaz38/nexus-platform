import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    const confirmUpgrade = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5001/api/payment/confirm-upgrade', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          toast.success("Account Upgraded to Premium!");
        } else {
          toast.error("Status update failed. Please contact support.");
        }
      } catch (error) {
        console.error("Upgrade error:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    confirmUpgrade();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-600 w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          {isUpdating 
            ? "Updating your account status, please wait..." 
            : "Congratulations! You are now a Premium Member of Business Nexus."}
        </p>

        <div className="space-y-4">
          <Button 
            fullWidth 
            onClick={() => navigate('/dashboard')}
            disabled={isUpdating}
            rightIcon={<ArrowRight size={18} />}
          >
            Go to Dashboard
          </Button>
          
          <p className="text-xs text-gray-400">
            A confirmation email has been sent to your registered address.
          </p>
        </div>
      </div>
    </div>
  );
};