import { useState } from 'react';
import { Store, User, Phone, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';
import { Toast } from '../components/Toast';

export const LivraisonsScreen = () => {
  const navigate = useNavigate();
  const { isAvailable, deliveries } = useAppContext();
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const waitingPickupDeliveries = deliveries.filter((d) => d.status === 'waiting_pickup');
  const inDeliveryDeliveries = deliveries.filter((d) => d.status === 'in_delivery');

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen pb-20" style={{ backgroundColor: '#FAFAF9', maxWidth: '375px', margin: '0 auto' }}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-semibold" style={{ color: '#1C1917' }}>
            Bonjour, Youssef
          </h1>
          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: isAvailable ? '#16A34A' : '#78716C' }}
          >
            {isAvailable ? 'Disponible' : 'Indisponible'}
          </button>
        </div>

        {/* Status Summary */}
        <div className="flex gap-2 px-4 mt-3">
          <div
            className="px-3 py-1.5 rounded-full border text-sm font-semibold"
            style={{ backgroundColor: 'white', borderColor: '#E2E8F0', color: '#E8632A' }}
          >
            {inDeliveryDeliveries.length + waitingPickupDeliveries.length} en cours
          </div>
          <div
            className="px-3 py-1.5 rounded-full border text-sm"
            style={{ backgroundColor: 'white', borderColor: '#E2E8F0', color: '#78716C' }}
          >
            12 aujourd'hui
          </div>
        </div>

        {/* A collecter Section */}
        {waitingPickupDeliveries.length > 0 && (
          <div className="px-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                À collecter
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#FFF7ED', color: '#E8632A' }}
              >
                {waitingPickupDeliveries.length}
              </span>
            </div>

            <div className="space-y-2">
              {waitingPickupDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  onClick={() => navigate(`/driver/livraisons/${delivery.id}`)}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                        {delivery.orderNumber}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: '#FFF7ED', color: '#E8632A' }}
                      >
                        En attente de collecte
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#78716C' }}>
                      {delivery.distance}
                    </span>
                  </div>

                  {/* Merchant Info */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-4 h-4" style={{ color: '#78716C' }} />
                      <span className="text-sm" style={{ color: '#1C1917' }}>
                        {delivery.merchantName}
                      </span>
                    </div>
                    <p className="text-xs ml-6" style={{ color: '#78716C' }}>
                      {delivery.merchantAddress}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t my-2" style={{ borderColor: '#F1F5F9' }} />

                  {/* Customer Info */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" style={{ color: '#78716C' }} />
                      <span className="text-sm" style={{ color: '#1C1917' }}>
                        {delivery.customerName}
                      </span>
                    </div>
                    <a
                      href={`tel:${delivery.customerPhone.replace(/\s/g, '')}`}
                      className="text-xs ml-6 flex items-center gap-1"
                      style={{ color: '#2563EB' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3 h-3" />
                      {delivery.customerPhone}
                    </a>
                    <p className="text-xs ml-6 mt-0.5" style={{ color: '#78716C' }}>
                      {delivery.customerAddress}
                    </p>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                        {delivery.amount} MAD
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: delivery.paymentMethod === 'cod' ? '#F3F4F6' : '#EFF6FF',
                          color: delivery.paymentMethod === 'cod' ? '#78716C' : '#2563EB',
                        }}
                      >
                        {delivery.paymentMethod === 'cod' ? 'COD' : 'Terminal'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/driver/livraisons/${delivery.id}/collecte`);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: '#2563EB' }}
                    >
                      Collecter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* En livraison Section */}
        {inDeliveryDeliveries.length > 0 && (
          <div className="px-4 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                En livraison
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
              >
                {inDeliveryDeliveries.length}
              </span>
            </div>

            <div className="space-y-2">
              {inDeliveryDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  onClick={() => navigate(`/driver/livraisons/${delivery.id}`)}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                        {delivery.orderNumber}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                      >
                        En route
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#78716C' }}>
                      {delivery.distance}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-4 h-4" style={{ color: '#78716C' }} />
                      <span className="text-sm" style={{ color: '#1C1917' }}>
                        {delivery.merchantName}
                      </span>
                    </div>
                    <p className="text-xs ml-6" style={{ color: '#78716C' }}>
                      {delivery.merchantAddress}
                    </p>
                  </div>

                  <div className="border-t my-2" style={{ borderColor: '#F1F5F9' }} />

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" style={{ color: '#78716C' }} />
                      <span className="text-sm" style={{ color: '#1C1917' }}>
                        {delivery.customerName}
                      </span>
                    </div>
                    <a
                      href={`tel:${delivery.customerPhone.replace(/\s/g, '')}`}
                      className="text-xs ml-6 flex items-center gap-1"
                      style={{ color: '#2563EB' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3 h-3" />
                      {delivery.customerPhone}
                    </a>
                    <p className="text-xs ml-6 mt-0.5" style={{ color: '#78716C' }}>
                      {delivery.customerAddress}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                        {delivery.amount} MAD
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: delivery.paymentMethod === 'cod' ? '#F3F4F6' : '#EFF6FF',
                          color: delivery.paymentMethod === 'cod' ? '#78716C' : '#2563EB',
                        }}
                      >
                        {delivery.paymentMethod === 'cod' ? 'COD' : 'Terminal'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/driver/livraisons/${delivery.id}/livraison`);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: '#16A34A' }}
                    >
                      Livrer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {waitingPickupDeliveries.length === 0 && inDeliveryDeliveries.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 pt-16">
            <Truck className="w-16 h-16 mb-4" style={{ color: '#E2E8F0' }} />
            <h3 className="text-base font-semibold text-center mb-2" style={{ color: '#1C1917' }}>
              Aucune livraison pour le moment
            </h3>
            <p className="text-sm text-center max-w-[240px]" style={{ color: '#78716C' }}>
              Passez en disponible pour recevoir des livraisons
            </p>
          </div>
        )}

        {/* Availability Modal */}
        {showAvailabilityModal && (
          <AvailabilityModal
            isAvailable={isAvailable}
            onClose={() => setShowAvailabilityModal(false)}
            onConfirm={() => {
              setShowAvailabilityModal(false);
              setToast({
                message: isAvailable
                  ? 'Vous êtes maintenant indisponible'
                  : 'Vous êtes maintenant disponible',
                type: 'success',
              });
            }}
          />
        )}
      </div>

      <BottomNav />
    </>
  );
};

interface AvailabilityModalProps {
  isAvailable: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AvailabilityModal = ({ isAvailable, onClose, onConfirm }: AvailabilityModalProps) => {
  const { setIsAvailable } = useAppContext();

  const handleConfirm = () => {
    setIsAvailable(!isAvailable);
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '375px' }}
      >
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: isAvailable ? '#FFFBEB' : '#F0FDF4' }}
          >
            <Package
              className="w-6 h-6"
              style={{ color: isAvailable ? '#D97706' : '#16A34A' }}
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center mb-2" style={{ color: '#1C1917' }}>
          {isAvailable ? 'Passer en indisponible ?' : 'Passer en disponible ?'}
        </h3>

        {/* Description */}
        <p className="text-sm text-center mb-6" style={{ color: '#78716C' }}>
          {isAvailable
            ? 'Vous ne recevrez plus de nouvelles livraisons.'
            : 'Vous recevrez de nouvelles livraisons.'}
        </p>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="w-full h-12 rounded-lg text-white font-medium mb-2"
          style={{ backgroundColor: isAvailable ? '#D97706' : '#16A34A' }}
        >
          Confirmer
        </button>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-lg font-medium"
          style={{ backgroundColor: 'transparent', color: '#78716C' }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
};
