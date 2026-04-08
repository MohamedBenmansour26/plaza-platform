import { CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';

export const DeliverySuccessScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries, updateDeliveryStatus } = useAppContext();

  const delivery = deliveries.find((d) => d.id === id);

  // Update status to completed
  useEffect(() => {
    if (delivery && delivery.status !== 'completed') {
      updateDeliveryStatus(delivery.id, 'completed');
    }
  }, [delivery, id, updateDeliveryStatus]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #F0FDF4 0%, #F0FDF4 50%, white 50%, white 100%)',
        maxWidth: '375px',
        margin: '0 auto',
      }}
    >
      <div className="flex flex-col items-center px-6 pt-16">
        {/* Success Icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: '#16A34A' }}
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-semibold text-center mb-1" style={{ color: '#1C1917' }}>
          Livraison effectuée !
        </h1>
        <p className="text-base text-center mb-8" style={{ color: '#78716C' }}>
          Commande {delivery?.orderNumber}
        </p>

        {/* Stats Card */}
        <div className="w-full bg-white rounded-xl shadow-md p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#78716C' }}>
                Distance parcourue
              </span>
              <span className="text-sm font-medium" style={{ color: '#1C1917' }}>
                4.2 km
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#78716C' }}>
                Durée
              </span>
              <span className="text-sm font-medium" style={{ color: '#1C1917' }}>
                28 min
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#78716C' }}>
                Gain pour cette livraison
              </span>
              <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                35 MAD
              </span>
            </div>

            <div className="border-t pt-3" style={{ borderColor: '#F1F5F9' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#78716C' }}>
                  Gains aujourd'hui
                </span>
                <span className="text-base font-semibold" style={{ color: '#1C1917' }}>
                  210 MAD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={() => navigate('/driver/livraisons')}
          className="w-full h-12 rounded-lg text-white font-medium mt-6"
          style={{ backgroundColor: '#2563EB' }}
        >
          Retour aux livraisons
        </button>
      </div>
    </div>
  );
};