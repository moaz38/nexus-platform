import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';

export const EntrepreneursPage: React.FC = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFundingRange, setSelectedFundingRange] = useState<string[]>([]);

  // 1. Fetch Real Data from Backend
  useEffect(() => {
    const fetchEntrepreneurs = async () => {
      try {
        const token = localStorage.getItem('token');
        // ✅ FIX 1: 'localhost' -> '127.0.0.1' (Speed ke liye)
        // ✅ FIX 2: '/entrepreneurs' -> '?role=entrepreneur' (Backend logic ke mutabiq)
        const res = await fetch('http://127.0.0.1:5001/api/users?role=entrepreneur', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          const formattedData = data.map((user: any) => ({
            ...user,
            id: user._id, 
          }));
          setEntrepreneurs(formattedData);
        }
      } catch (error) {
        console.error("Error fetching startups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepreneurs();
  }, []);

  // Get unique industries dynamically
  const allIndustries = Array.from(new Set(entrepreneurs.map(e => e.industry || 'Tech')));
  const fundingRanges = ['< $500K', '$500K - $1M', '$1M - $5M', '> $5M'];

  // 2. Filter Logic
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = searchQuery === '' || 
      (entrepreneur.name && entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entrepreneur.companyName && entrepreneur.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entrepreneur.industry && entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIndustry = selectedIndustries.length === 0 ||
      selectedIndustries.includes(entrepreneur.industry);
    
    const matchesFunding = selectedFundingRange.length === 0 || 
      selectedFundingRange.some(range => {
        const amountStr = entrepreneur.fundingNeeded || "0"; 
        const amount = parseInt(amountStr.toString().replace(/[^0-9]/g, '')) || 0;
        switch (range) {
          case '< $500K': return amount < 500;
          case '$500K - $1M': return amount >= 500 && amount <= 1000;
          case '$1M - $5M': return amount > 1000 && amount <= 5000;
          case '> $5M': return amount > 5000;
          default: return true;
        }
      });
    
    return matchesSearch && matchesIndustry && matchesFunding;
  });

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );
  };

  const toggleFundingRange = (range: string) => {
    setSelectedFundingRange(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
        <p className="text-gray-600">Discover promising startups looking for investment</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Industry</h3>
                <div className="space-y-2">
                  {allIndustries.length > 0 ? allIndustries.map(industry => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedIndustries.includes(industry)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {industry}
                    </button>
                  )) : <p className="text-xs text-gray-400">No industries found</p>}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Funding Range</h3>
                <div className="space-y-2">
                  {fundingRanges.map(range => (
                    <button
                      key={range}
                      onClick={() => toggleFundingRange(range)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedFundingRange.includes(range)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredEntrepreneurs.length} results
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
                <div className="col-span-2 text-center py-10">Loading Startups...</div>
            ) : filteredEntrepreneurs.length > 0 ? (
                filteredEntrepreneurs.map(entrepreneur => (
                  <EntrepreneurCard
                    key={entrepreneur._id}
                    entrepreneur={entrepreneur}
                  />
                ))
            ) : (
                <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
                    <TrendingUp size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Startups Found</h3>
                    <p className="text-gray-500">Try adjusting your filters.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};