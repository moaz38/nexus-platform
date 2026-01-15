import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch Documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDocuments(data);
    } catch (error) {
      console.error("Error loading docs", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 3. Handle Upload
  const handleUpload = async () => {
    if (!selectedFile) return toast.error("Please select a file first");

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile); // 'file' wohi naam hai jo backend mein multer.single('file') mein likha tha

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // FormData ke sath Content-Type header nahi lagate (Auto lagta hai)
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Document Uploaded Successfully! 📂");
        setSelectedFile(null); // Clear selection
        fetchDocuments(); // Refresh list
      } else {
        toast.error(data.message || "Upload Failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Upload your pitch decks and business plans.</p>
        </div>
      </div>

      {/* UPLOAD SECTION */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Upload New Document</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100"
            />
            <Button 
              onClick={handleUpload} 
              isLoading={uploading}
              leftIcon={<Upload size={18} />}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Accepted formats: PDF, PNG, JPG (Max 5MB)</p>
        </CardBody>
      </Card>

      {/* DOCUMENTS LIST */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8">My Documents</h2>
      
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc._id} className="hover:shadow-md transition-shadow">
              <CardBody className="flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <Badge variant="secondary">{doc.type.split('/')[1]?.toUpperCase()}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 truncate" title={doc.name}>{doc.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-2 gap-3">
                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(doc.createdAt).toLocaleDateString()}</span>
                    <span>{doc.size}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye size={16} />}>
                      View
                    </Button>
                  </a>
                  <a href={doc.url} download className="flex-1">
                    <Button variant="primary" size="sm" className="w-full" leftIcon={<Download size={16} />}>
                      Download
                    </Button>
                  </a>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
          <p className="text-gray-500">Upload your first document to get started.</p>
        </div>
      )}
    </div>
  );
};