import React, { useRef } from 'react';
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

  const saveSignature = async () => {
    if (sigPad.current.isEmpty()) {
      return toast.error("Please provide a signature first");
    }

    const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://127.0.0.1:5001/api/agreements/sign/${agreementId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ signatureData, role }),
      });

      if (response.ok) {
        toast.success("Document Signed Successfully!");
        onSuccess();
        onClose();
      } else {
        throw new Error("Failed to sign document");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Digital Signature (Milestone 5)</h3>
        <p className="text-sm text-gray-500 mb-2">Use mouse or touch to sign below</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <SignatureCanvas 
            ref={sigPad}
            canvasProps={{width: 400, height: 200, className: 'sigCanvas'}}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-lg">Cancel</button>
          <button onClick={() => sigPad.current.clear()} className="px-4 py-2 text-yellow-600 border border-yellow-600 rounded-lg">Clear</button>
          <button onClick={saveSignature} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Confirm & Sign</button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;