import { useState } from 'react';
import { ArrowLeft, Phone, Camera, X, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useAppContext } from '../context/AppContext';

export const DeliveryConfirmationScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries } = useAppContext();
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState(false);

  const delivery = deliveries.find((d) => d.id === id);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

  const handlePhotoUpload = () => {
    setPhoto('photo-captured');
  };

  const handleConfirm = () => {
    if (!photo) return;
    navigate(`/driver/livraisons/${delivery.id}/succes`);
  };

  return (
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
          Confirmer la livraison
        </span>
      </div>

      {/* Customer Summary Card */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-base font-semibold mb-1" style={{ color: '#1C1917' }}>
            {delivery.customerName}
          </h3>
          <p className="text-sm mb-2" style={{ color: '#78716C' }}>
            {delivery.customerAddress}
          </p>
          <a
            href={`tel:${delivery.customerPhone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-sm"
            style={{ color: '#2563EB' }}
          >
            <Phone className="w-4 h-4" />
            {delivery.customerPhone}
          </a>
        </div>
      </div>

      {/* COD Collection Card */}
      {delivery.paymentMethod === 'cod' && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div
              className="border-l-4 rounded p-3"
              style={{ borderColor: '#D97706', backgroundColor: '#FFFBEB' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" style={{ color: '#D97706' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#D97706' }}>
                  Encaissement requis
                </h3>
              </div>
              <p className="text-sm mb-3" style={{ color: '#78716C' }}>
                Collectez exactement :
              </p>
              <p className="text-3xl font-semibold text-center mb-2" style={{ color: '#1C1917' }}>
                {delivery.amount} MAD
              </p>
              <p className="text-xs text-center italic" style={{ color: '#78716C' }}>
                Ne rendez pas la monnaie — montant exact uniquement
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Proof of Delivery Section */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#1C1917' }}>
            Preuve de livraison
          </h3>

          {!photo ? (
            <div>
              <button
                onClick={handlePhotoUpload}
                className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center"
                style={{ borderColor: '#E2E8F0' }}
              >
                <Camera className="w-10 h-10 mb-2" style={{ color: '#78716C' }} />
                <span className="text-sm font-medium" style={{ color: '#DC2626' }}>
                  Photo obligatoire
                </span>
              </button>
              <p className="text-xs mt-2" style={{ color: '#78716C' }}>
                Prenez une photo du colis remis au client
              </p>
            </div>
          ) : (
            <div className="relative">
              <div
                className="w-full h-40 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#E2E8F0' }}
              >
                <Camera className="w-12 h-12" style={{ color: '#78716C' }} />
              </div>
              <button
                onClick={() => setPhoto(null)}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Signature Section */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium mb-3" style={{ color: '#1C1917' }}>
            Signature du client (optionnel)
          </h3>

          {!signature ? (
            <button
              onClick={() => setSignature(true)}
              className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center"
              style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAF9' }}
            >
              <span className="text-sm" style={{ color: '#78716C' }}>
                Le client signe ici
              </span>
            </button>
          ) : (
            <div>
              <div
                className="w-full h-32 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FAFAF9', border: '1px solid #E2E8F0' }}
              >
                <span className="text-2xl" style={{ color: '#78716C' }}>
                  ～signature～
                </span>
              </div>
              <button
                onClick={() => setSignature(false)}
                className="text-xs mt-1 text-right w-full"
                style={{ color: '#DC2626' }}
              >
                Effacer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Issue Report Link */}
      <div className="px-4 mt-3">
        <button
          onClick={() => navigate(`/driver/livraisons/${delivery.id}/probleme`)}
          className="text-sm underline"
          style={{ color: '#DC2626' }}
        >
          Signaler un problème
        </button>
      </div>

      {/* Sticky Bottom Button */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4"
        style={{ maxWidth: '375px', margin: '0 auto' }}
      >
        <button
          onClick={handleConfirm}
          disabled={!photo}
          className="w-full h-12 rounded-lg text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: '#16A34A' }}
        >
          Confirmer la livraison
        </button>
      </div>
    </div>
  );
};
