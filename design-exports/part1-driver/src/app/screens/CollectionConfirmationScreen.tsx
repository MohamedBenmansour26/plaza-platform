import { useState } from 'react';
import { ArrowLeft, AlertCircle, Camera, X, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { Toast } from '../components/Toast';

export const CollectionConfirmationScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries, updateDeliveryStatus } = useAppContext();
  const [checklist, setChecklist] = useState({
    items: false,
    merchant: false,
    packaging: false,
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const delivery = deliveries.find((d) => d.id === id);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

  const allChecked = checklist.items && checklist.merchant && checklist.packaging;

  const handleConfirm = () => {
    if (!allChecked) return;

    updateDeliveryStatus(delivery.id, 'in_delivery');
    setToast({
      message: 'Collecte confirmée ! En route vers le client.',
      type: 'success',
    });

    setTimeout(() => {
      navigate('/driver/livraisons');
    }, 1500);
  };

  const handlePhotoUpload = () => {
    // Simulate photo capture
    setPhoto('photo-captured');
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
            Confirmer la collecte
          </span>
        </div>

        {/* Instructions Card */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-6 h-6" style={{ color: '#E8632A' }} />
              <h3 className="text-base font-semibold" style={{ color: '#1C1917' }}>
                Avant de partir
              </h3>
            </div>

            <div className="space-y-3">
              <ChecklistItem
                checked={checklist.items}
                onChange={(checked) => setChecklist({ ...checklist, items: checked })}
                label="J'ai vérifié tous les articles de la commande"
              />
              <ChecklistItem
                checked={checklist.merchant}
                onChange={(checked) => setChecklist({ ...checklist, merchant: checked })}
                label="Le marchand a confirmé le contenu du colis"
              />
              <ChecklistItem
                checked={checklist.packaging}
                onChange={(checked) => setChecklist({ ...checklist, packaging: checked })}
                label="Le colis est bien emballé et sécurisé"
              />
            </div>
          </div>
        </div>

        {/* COD Warning Card */}
        {delivery.paymentMethod === 'cod' && (
          <div className="px-4 mt-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#1C1917' }}>
                Encaissement à la livraison
              </h3>
              <p className="text-sm mb-3" style={{ color: '#78716C' }}>
                Ne collectez PAS l'argent maintenant. Le client paiera à la réception.
              </p>
              <div className="text-center">
                <p className="text-2xl font-semibold" style={{ color: '#E8632A' }}>
                  {delivery.amount} MAD
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Photo Proof Section */}
        <div className="px-4 mt-3">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium mb-3" style={{ color: '#1C1917' }}>
              Photo du colis (optionnel)
            </h3>

            {!photo ? (
              <button
                onClick={handlePhotoUpload}
                className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center"
                style={{ borderColor: '#E2E8F0' }}
              >
                <Camera className="w-8 h-8 mb-2" style={{ color: '#78716C' }} />
                <span className="text-sm" style={{ color: '#78716C' }}>
                  Prendre une photo
                </span>
              </button>
            ) : (
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#E2E8F0' }}
                >
                  <Camera className="w-8 h-8" style={{ color: '#78716C' }} />
                </div>
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Button */}
        <div
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4"
          style={{ maxWidth: '375px', margin: '0 auto' }}
        >
          <button
            onClick={handleConfirm}
            disabled={!allChecked}
            className="w-full h-12 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#E8632A' }}
          >
            Je confirme la collecte
          </button>
        </div>
      </div>
    </>
  );
};

interface ChecklistItemProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const ChecklistItem = ({ checked, onChange, label }: ChecklistItemProps) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full text-left"
    >
      <div
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{
          borderColor: checked ? '#16A34A' : '#E2E8F0',
          backgroundColor: checked ? '#16A34A' : 'transparent',
        }}
      >
        {checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <span className="text-sm" style={{ color: '#1C1917' }}>
        {label}
      </span>
    </button>
  );
};
