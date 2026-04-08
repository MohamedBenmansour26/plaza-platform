import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';

const issueTypes = [
  { id: 'absent', label: 'Client absent' },
  { id: 'refuse', label: 'Client refuse le colis' },
  { id: 'address', label: 'Adresse incorrecte' },
  { id: 'damaged', label: 'Colis endommagé' },
  { id: 'payment', label: 'Problème de paiement' },
  { id: 'other', label: 'Autre problème' }
];

export const IssueReport: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries } = useApp();
  const [selectedIssue, setSelectedIssue] = useState('');
  const [notes, setNotes] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);

  const delivery = deliveries.find(d => d.id === id);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

  const handleSubmit = () => {
    toast.error('Problème signalé. Le support vous contactera.');
    navigate('/livraisons');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} className="text-[#1C1917]" />
        </button>
        <div>
          <h1 className="text-[18px] font-semibold text-[#1C1917]">
            Signaler un problème
          </h1>
          <p className="text-[13px] text-[#78716C]">{delivery.orderNumber}</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4">
          <h2 className="text-[14px] font-semibold text-[#1C1917] mb-3">
            Type de problème
          </h2>
          <div className="space-y-2">
            {issueTypes.map(issue => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedIssue === issue.id
                    ? 'border-[#DC2626] bg-[#FEF2F2]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedIssue === issue.id
                        ? 'border-[#DC2626] bg-[#DC2626]'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedIssue === issue.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-[14px] text-[#1C1917]">{issue.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[14px] font-semibold text-[#1C1917] mb-2">
            Détails supplémentaires
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Décrivez le problème..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2563EB] focus:outline-none text-[14px] resize-none"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#1C1917] mb-1">
            Photo (optionnelle)
          </h3>
          <p className="text-[12px] text-[#78716C] mb-3">
            Ajoutez une photo si nécessaire
          </p>

          {!photoTaken ? (
            <button
              onClick={() => setPhotoTaken(true)}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#2563EB] transition-colors"
            >
              <Camera size={28} className="text-[#78716C]" />
              <span className="text-[13px] text-[#78716C]">Prendre une photo</span>
            </button>
          ) : (
            <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <Camera size={40} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-[375px] mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!selectedIssue}
            className={`w-full h-12 font-semibold rounded-lg transition-colors ${
              selectedIssue
                ? 'bg-[#DC2626] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Envoyer le rapport
          </button>
        </div>
      </div>
    </div>
  );
};
