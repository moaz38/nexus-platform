import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, DollarSign, PieChart, 
  Briefcase, CheckCircle, Clock, MoreHorizontal, FileText 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar'; // ✅ Smart Avatar
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

// Deal Type Definition
interface Deal {
  _id: string;
  startupName: string;
  startupIndustry?: string;
  startupLogo?: string;
  amount: number;
  equity: number;
  status: 'Due Diligence' | 'Term Sheet' | 'Negotiation' | 'Closed' | 'Passed';
  stage: 'Seed' | 'Series A' | 'Series B';
  updatedAt: string;
}

export const DealsPage: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Deals from Backend
  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ Port 5001
      const res = await fetch('http://localhost:5001/api/deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      } else {
        // Fallback for demo if API is empty (Taake page khali na lage)
        console.log("No deals found or API not ready.");
      }
    } catch (error) {
      console.error("Error fetching deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // 2. Calculate Stats (Dynamic)
  const totalInvestment = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const activeDealsCount = deals.filter(d => d.status !== 'Closed' && d.status !== 'Passed').length;
  const closedDealsCount = deals.filter(d => d.status === 'Closed').length;

  // 3. Filter Logic
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.startupName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || deal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed': return 'bg-green-100 text-green-700';
      case 'Term Sheet': return 'bg-purple-100 text-purple-700';
      case 'Due Diligence': return 'bg-blue-100 text-blue-700';
      case 'Negotiation': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0 
    }).format(amount);
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Pipeline...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Deals</h1>
          <p className="text-gray-500">Track and manage your investment pipeline</p>
        </div>
        <Button onClick={() => toast.success("Add Deal Modal will open here")}>
          <Plus size={18} className="mr-2" /> Add New Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4"><DollarSign size={24}/></div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Investment</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvestment)}</h3>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mr-4"><Briefcase size={24}/></div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Active Deals</p>
                <h3 className="text-2xl font-bold text-gray-900">{activeDealsCount}</h3>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4"><PieChart size={24}/></div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Portfolio Companies</p>
                <h3 className="text-2xl font-bold text-gray-900">{deals.length}</h3>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4"><CheckCircle size={24}/></div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Closed Deals</p>
                <h3 className="text-2xl font-bold text-gray-900">{closedDealsCount}</h3>
            </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search deals by startup name..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
             {['All', 'Due Diligence', 'Term Sheet', 'Negotiation', 'Closed'].map(status => (
                 <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition ${
                        filterStatus === status 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                 >
                    {status}
                 </button>
             ))}
          </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Startup</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Equity</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Activity</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredDeals.length > 0 ? (
                        filteredDeals.map((deal) => (
                            <tr key={deal._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={deal.startupLogo} alt={deal.startupName} size="md" />
                                        <div>
                                            <p className="font-bold text-gray-900">{deal.startupName}</p>
                                            <p className="text-xs text-gray-500">{deal.startupIndustry || 'Tech'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(deal.amount)}</td>
                                <td className="px-6 py-4 text-gray-600">{deal.equity}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(deal.status)}`}>
                                        {deal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{deal.stage}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(deal.updatedAt || Date.now()).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center py-12">
                                <div className="flex flex-col items-center">
                                    <FileText className="h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-gray-500 font-medium">No active deals found.</p>
                                    <p className="text-sm text-gray-400">Click "Add New Deal" to start tracking.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};