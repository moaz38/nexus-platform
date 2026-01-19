import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import toast from 'react-hot-toast';

interface Props {
  agreementId: string;
  role: 'entrepreneur' | 'investor';
  onClose: () => void;
  onSuccess: () => void;
}

const SignatureModal: React.FC<Props> = ({ agreementId, role, onClose, onSuccess }) => {
  const sigPad = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  const saveSignature = async () => {
    if (sigPad.current.isEmpty()) {
      return toast.error("Please provide a signature first");
    }

    setLoading(true);

    try {
      // ❌ OLD CODE (Jo Error de raha tha):
      // const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

      // ✅ NEW FIX: Direct Data URL (Bina Trim kiye)
      // Yeh 100% chalega kyunke yeh library ka basic function hai.
      const signatureData = sigPad.current.toDataURL(); 

      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5001/api/agreements/sign/${agreementId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ signatureData, role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Document Signed Successfully!");
        onSuccess();
        onClose();
      } else {
        console.error("Server Error:", data);
        toast.error(data.message || "Failed to sign document");
      }
    } catch (error: any) {
      console.error("Network Error:", error);
      toast.error("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Digital Signature (Milestone 5)</h3>
        <p className="text-sm text-gray-500 mb-2">Use mouse or touch to sign below</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
          <SignatureCanvas 
            ref={sigPad}
            penColor='black'
            canvasProps={{
                width: 400, 
                height: 200, 
                className: 'sigCanvas bg-white'
            }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => sigPad.current.clear()} className="px-4 py-2 text-yellow-600 border border-yellow-600 rounded-lg hover:bg-yellow-50">Clear</button>
          <button 
            onClick={saveSignature} 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Confirm & Sign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;