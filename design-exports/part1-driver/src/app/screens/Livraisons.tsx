import React from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { Package, MapPin, Banknote, Clock, ChevronRight } from 'lucide-react';

const getUrgencyPill = (timeRemaining: number) => {
  if (timeRemaining > 30) {
    return {
      bg: '#F0FDF4',
      text: '#16A34A',
      label: `Dans ${Math.floor(timeRemaining / 60)}h ${timeRemaining % 60}`
    };
  } else if (timeRemaining > 0) {
    return {
      bg: '#FFF7ED',
      text: '#E8632A',
      label: `Dans ${timeRemaining} min`
    };
  } else {
    return {
      bg: '#FEF2F2',
      text: '#DC2626',
      label: 'En retard !'
    };
  }
};

export const Livraisons: React.FC = () => {
  const navigate = useNavigate();
  const { isAvailable, setIsAvailable, deliveries } = useApp();

  const toCollect = deliveries.filter(d => d.status === 'to_collect');
  const inDelivery = deliveries.filter(d => d.status === 'in_delivery');

  const DeliveryCard: React.FC<{ delivery: any }> = ({ delivery }) => {
    const urgency = getUrgencyPill(delivery.timeRemaining);

    return (
      <div
        onClick={() => navigate(`/livraison/${delivery.id}`)}
        className="bg-white rounded-xl p-4 shadow-sm mb-3 active:scale-[0.98] transition-transform cursor-pointer relative"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[#2563EB]" />
            <span className="text-[14px] font-semibold text-[#1C1917]">
              {delivery.orderNumber}
            </span>
          </div>
          {delivery.paymentMethod === 'COD' && (
            <span className="px-2 py-1 bg-[#FFF7ED] text-[#E8632A] text-[11px] font-semibold rounded-full">
              Paiement à collecter
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Banknote size={16} className="text-[#16A34A]" />
            <span className="text-[12px] text-[#78716C]">Votre gain</span>
          </div>
          <span className="text-[14px] font-semibold text-[#16A34A]">
            {delivery.earnings} MAD
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
            <Clock size={16} className="text-[#78716C] flex-shrink-0" />
            <span className="text-[12px] text-[#78716C] truncate">
              Livraison entre {delivery.timeSlotStart} et {delivery.timeSlotEnd}
            </span>
          </div>
          <span
            className="px-2 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap flex-shrink-0"
            style={{ backgroundColor: urgency.bg, color: urgency.text }}
          >
            {urgency.label}
          </span>
        </div>

        <div className="mb-2">
          <p className="text-[13px] font-medium text-[#1C1917]">
            {delivery.customerName}
          </p>
          <p className="text-[12px] text-[#78716C]">{delivery.customerPhone}</p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <MapPin size={14} className="text-[#E8632A] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#78716C]">Collecte</p>
              <p className="text-[12px] text-[#1C1917]">{delivery.pickupShop}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MapPin size={14} className="text-[#16A34A] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#78716C]">Livraison</p>
              <p className="text-[12px] text-[#1C1917]">
                {delivery.deliveryNeighborhood}
              </p>
            </div>
          </div>
        </div>

        <ChevronRight size={20} className="text-[#78716C] absolute right-4 top-1/2 -translate-y-1/2" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-[#1C1917]">Livraisons</h1>
            <p className="text-[13px] text-[#78716C]">
              {toCollect.length + inDelivery.length} livraison(s) active(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#78716C]">Disponible</span>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isAvailable ? 'bg-[#16A34A]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {toCollect.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              À collecter ({toCollect.length})
            </h2>
            {toCollect.map(delivery => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        )}

        {inDelivery.length > 0 && (
          <div>
            <h2 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              En livraison ({inDelivery.length})
            </h2>
            {inDelivery.map(delivery => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        )}

        {toCollect.length === 0 && inDelivery.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="text-[#78716C] mx-auto mb-4" />
            <p className="text-[15px] text-[#78716C]">Aucune livraison active</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
