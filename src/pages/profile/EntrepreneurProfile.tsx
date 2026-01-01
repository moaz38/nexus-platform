import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, FileText, Download, Eye } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entrepreneur, setEntrepreneur] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem('token');
        
        // 1. Fetch User Details
        const userRes = await fetch(`http://localhost:5000/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        
        if (userRes.ok) {
            setEntrepreneur(userData);
        }

        // 2. Fetch Documents
        const docRes = await fetch(`http://localhost:5000/api/documents/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const docData = await docRes.json();
        
        if (docRes.ok) {
            setDocuments(docData);
        }

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleMessage = () => {
    navigate(`/chat/${id}`);
  };

  const handleScheduleMeeting = async () => {
    navigate('/investors'); 
    toast.success("Please use the 'Meeting' button on the Find Investors card.");
  };

  if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
  if (!entrepreneur) return <div className="p-8 text-center">User Not Found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar 
              src={entrepreneur.avatarUrl || ''} 
              alt={entrepreneur.name} 
              size="xl" 
              className="border-4 border-white shadow-lg"
            />
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
                  <p className="text-gray-500">{entrepreneur.companyName}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" leftIcon={<MessageCircle size={18} />} onClick={handleMessage}>
                    Message
                  </Button>
                  <Button variant="primary" leftIcon={<Calendar size={18} />} onClick={handleScheduleMeeting}>
                    Schedule Meeting
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">{entrepreneur.bio}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="primary">{entrepreneur.industry || 'Tech'}</Badge>
                <Badge variant="secondary">{entrepreneur.location || 'Remote'}</Badge>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Company Documents & Pitch Decks
          </h2>
        </CardHeader>
        <CardBody>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc._id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded text-blue-600">
                      <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 truncate max-w-[150px]">{doc.name}</h4>
                        <p className="text-xs text-gray-500">{doc.size} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" leftIcon={<Eye size={14} />}>View</Button>
                    </a>
                    <a href={doc.url} download>
                        <Button size="sm" variant="ghost" className="text-blue-600"><Download size={18} /></Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No public documents.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};