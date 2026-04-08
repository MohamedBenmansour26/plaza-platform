import { useState } from 'react';
import { ArrowLeft, Circle, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Toast } from '../components/Toast';

export const ReportIssueScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const issues = [
    { id: 'absent', label: 'Client absent / injoignable' },
    { id: 'address', label: 'Adresse introuvable' },
    { id: 'refused', label: 'Client refuse la commande' },
    { id: 'damaged', label: 'Colis endommagé' },
    { id: 'other', label: 'Autre problème' },
  ];

  const handleSubmit = () => {
    if (!selectedIssue) return;

    setToast({
      message: 'Problème signalé. Notre équipe vous contactera.',
      type: 'success',
    });

    setTimeout(() => {
      navigate('/driver/livraisons');
    }, 2000);
  };

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: '#FAFAF9', maxWidth: '375px', margin: '0 auto' }}
      >
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" style={{ color: '#1C1917' }} />
          </button>
          <span className="text-base font-semibold" style={{ color: '#1C1917' }}>
            Signaler un problème
          </span>
        </div>

        {/* Question */}
        <div className="px-4 mt-4">
          <h2 className="text-base font-semibold" style={{ color: '#1C1917' }}>
            Quel est le problème ?
          </h2>
        </div>

        {/* Issue Type List */}
        <div className="px-4 mt-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {issues.map((issue, index) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue.id)}
                className="w-full h-14 px-4 flex items-center justify-between"
                style={{
                  backgroundColor: selectedIssue === issue.id ? '#EFF6FF' : 'white',
                  borderBottom: index < issues.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  {selectedIssue === issue.id ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#2563EB' }} />
                  ) : (
                    <Circle className="w-5 h-5" style={{ color: '#E2E8F0' }} />
                  )}
                  <span
                    className="text-sm"
                    style={{ color: selectedIssue === issue.id ? '#2563EB' : '#1C1917' }}
                  >
                    {issue.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="px-4 mt-4">
          <h3 className="text-sm font-medium mb-2" style={{ color: '#1C1917' }}>
            Détails supplémentaires
          </h3>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Décrivez le problème..."
            className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#E2E8F0' }}
          />
        </div>

        {/* Sticky Bottom Button */}
        <div
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4"
          style={{ maxWidth: '375px', margin: '0 auto' }}
        >
          <button
            onClick={handleSubmit}
            disabled={!selectedIssue}
            className="w-full h-12 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#DC2626' }}
          >
            Envoyer le signalement
          </button>
        </div>
      </div>
    </>
  );
};
