import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';

export const InvestorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Real Investors State
  const [investors, setInvestors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API Call to Fetch Real Investors
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 🔥 FIX 1: URL change kiya '127.0.0.1' (Speed ke liye)
        // 🔥 FIX 2: Path change kiya '?role=investor' (Backend logic ke mutabiq)
        const res = await fetch('http://127.0.0.1:5001/api/users?role=investor', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        
        if (res.ok) {
          // 1. Current User ki ID nikalo
          const currentUser = JSON.parse(localStorage.getItem('business_nexus_user') || '{}'); // Key name fix kiya

          // 2. Pehle list se "Khud" ko nikaal do
          const filteredList = data.filter((inv: any) => inv._id !== currentUser.id && inv._id !== currentUser._id);

          // 3. Data Format karo
          const formattedData = filteredList.map((inv: any) => ({
            ...inv,
            id: inv._id, // ✅ MongoDB _id ko id bana diya
            investmentStage: inv.investmentStage && inv.investmentStage.length > 0 ? inv.investmentStage : ['Seed'],
            investmentInterests: inv.investmentInterests && inv.investmentInterests.length > 0 ? inv.investmentInterests : ['Tech'],
            avatarUrl: inv.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(inv.name)}&background=random`,
            company: inv.companyName || "Independent Investor"
          }));
          
          setInvestors(formattedData);
        }
      } catch (error) {
        console.error("Error fetching investors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestors();
  }, []);
  
  // Get unique investment stages and interests (Dynamic based on real data)
  const allStages = Array.from(new Set(investors.flatMap(i => i.investmentStage || [])));
  const allInterests = Array.from(new Set(investors.flatMap(i => i.investmentInterests || [])));
  
  // Filter logic
  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = searchQuery === '' || 
      (investor.name && investor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (investor.bio && investor.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (investor.investmentInterests && investor.investmentInterests.some((interest: string) => 
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    const matchesStages = selectedStages.length === 0 ||
      (investor.investmentStage && investor.investmentStage.some((stage: string) => selectedStages.includes(stage)));
    
    const matchesInterests = selectedInterests.length === 0 ||
      (investor.investmentInterests && investor.investmentInterests.some((interest: string) => selectedInterests.includes(interest)));
    
    return matchesSearch && matchesStages && matchesInterests;
  });
  
  const toggleStage = (stage: string) => {
    setSelectedStages(prev => 
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
  };
  
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Connect with investors who match your startup's needs</p>
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
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Stage</h3>
                {allStages.length > 0 ? (
                    <div className="space-y-2">
                    {allStages.map((stage: any) => (
                        <button
                        key={stage}
                        onClick={() => toggleStage(stage)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                            selectedStages.includes(stage)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        >
                        {stage}
                        </button>
                    ))}
                    </div>
                ) : <p className="text-sm text-gray-500">No filters available</p>}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {allInterests.map((interest: any) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? 'primary' : 'gray'}
                      className="cursor-pointer"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
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
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredInvestors.length} results
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
                <p className="text-center col-span-2">Loading Investors...</p>
            ) : filteredInvestors.length > 0 ? (
                filteredInvestors.map(investor => (
                <InvestorCard
                    key={investor.id}
                    investor={investor}
                />
                ))
            ) : (
                <p className="text-center col-span-2 text-gray-500">
                    No Investors found. Try creating a new account with 'Investor' role to verify.
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};