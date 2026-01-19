import React, { useState, useEffect } from 'react'; // ✅ useEffect add kiya
import { X, CheckCircle, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  investors: any[]; // Purana prop wese hi rehne dein taake error na aaye
}

const CreateAgreementModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, investors }) => {
  const [loading, setLoading] = useState(false);
  const [allInvestors, setAllInvestors] = useState<any[]>([]); // ✅ Saare investors ke liye nayi state
  const [formData, setFormData] = useState({
    investorId: '',
    documentTitle: '',
    documentContent: ''
  });

  // 🔥 NAYA LOGIC: Jab modal khulega, ye khud saare investors mangwaye ga
  useEffect(() => {
    if (isOpen) {
      const fetchAllInvestors = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5001/api/users?role=investor', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok) {
            setAllInvestors(data); // ✅ Saari list yahan save ho jayegi
          }
        } catch (error) {
          console.error("Error fetching investors:", error);
        }
      };
      fetchAllInvestors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.investorId) {
        return toast.error("Please select an investor");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Agreement Created Successfully!");
        onSuccess();
        onClose();
        setFormData({ investorId: '', documentTitle: '', documentContent: '' });
      } else {
        toast.error(data.message || "Failed to create agreement");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create New Contract</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Investor */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Investor</label>
                <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.investorId}
                    onChange={(e) => setFormData({...formData, investorId: e.target.value})}
                    required
                >
                    <option value="">-- Choose an Investor --</option>
                    {/* ✅ AB YE 'allInvestors' USE KAREGA JIS ME SAB SHOW HONGE */}
                    {allInvestors.map((inv: any) => (
                         <option key={inv._id} value={inv._id}>
                             {inv.name} ({inv.email})
                         </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select any registered investor to create a contract.</p>
            </div>

            {/* Document Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title</label>
                <input 
                    type="text" 
                    placeholder="e.g. Non-Disclosure Agreement (NDA)"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.documentTitle}
                    onChange={(e) => setFormData({...formData, documentTitle: e.target.value})}
                    required
                />
            </div>

            {/* Terms / Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea 
                    rows={5}
                    placeholder="Enter the full legal text of the agreement here..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.documentContent}
                    onChange={(e) => setFormData({...formData, documentContent: e.target.value})}
                    required
                />
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" isLoading={loading}>Create & Send</Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgreementModal;