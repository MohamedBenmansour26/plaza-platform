import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, MapPin, Phone, User, Clock, Banknote, Navigation } from 'lucide-react';

export const DeliveryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries } = useApp();

  const delivery = deliveries.find(d => d.id === id);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

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

  const urgency = getUrgencyPill(delivery.timeRemaining);
  const progressPercent = 30;
  const showWarning = delivery.timeRemaining < 30;

  const handleNextStep = () => {
    if (delivery.status === 'to_collect') {
      navigate(`/collecte/${delivery.id}`);
    } else if (delivery.status === 'in_delivery') {
      navigate(`/confirmation/${delivery.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/livraisons')} className="p-1">
          <ArrowLeft size={24} className="text-[#1C1917]" />
        </button>
        <div>
          <h1 className="text-[18px] font-semibold text-[#1C1917]">
            {delivery.orderNumber}
          </h1>
          <p className="text-[13px] text-[#78716C]">Détails de la livraison</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] text-[#78716C]">Gain pour cette livraison</span>
            <span className="text-[16px] font-semibold text-[#16A34A]">
              {delivery.earnings} MAD
            </span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-[14px] text-[#78716C]">Gains aujourd'hui</span>
            <span className="text-[14px] text-[#78716C]">175 MAD</span>
          </div>
          <p className="text-[12px] text-[#78716C] italic mt-3">
            Virement effectué chaque lundi
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#2563EB]" />
              <span className="text-[14px] font-semibold text-[#1C1917]">
                Créneau demandé par le client
              </span>
            </div>
            <span
              className="px-2 py-1 text-[11px] font-semibold rounded-full"
              style={{ backgroundColor: urgency.bg, color: urgency.text }}
            >
              {urgency.label}
            </span>
          </div>

          <div className="text-center my-4">
            <p className="text-[24px] font-semibold text-[#1C1917]">
              {delivery.timeSlotStart} — {delivery.timeSlotEnd}
            </p>
            <p className="text-[13px] text-[#78716C] mt-1">
              Mardi 7 avril 2026
            </p>
          </div>

          <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-[#16A34A] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {showWarning && (
            <div className="mt-3 bg-[#FFFBEB] border-l-4 border-[#D97706] rounded-lg p-3">
              <p className="text-[13px] text-[#D97706]">
                ⚠️ Dépêchez-vous ! Il vous reste moins de 30 minutes pour livrer dans le créneau.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} className="text-[#2563EB]" />
            <h2 className="text-[14px] font-semibold text-[#1C1917]">Client</h2>
          </div>
          <p className="text-[15px] font-medium text-[#1C1917] mb-1">
            {delivery.customerName}
          </p>
          <a
            href={`tel:${delivery.customerPhone}`}
            className="flex items-center gap-2 text-[13px] text-[#2563EB]"
          >
            <Phone size={14} />
            {delivery.customerPhone}
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-[#E8632A]" />
            <h2 className="text-[14px] font-semibold text-[#1C1917]">Collecte</h2>
          </div>
          <p className="text-[15px] font-medium text-[#1C1917] mb-1">
            {delivery.pickupShop}
          </p>
          <p className="text-[13px] text-[#78716C]">{delivery.pickupAddress}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-[#16A34A]" />
            <h2 className="text-[14px] font-semibold text-[#1C1917]">Livraison</h2>
          </div>
          <p className="text-[13px] text-[#78716C] mb-1">{delivery.deliveryNeighborhood}</p>
          <p className="text-[15px] font-medium text-[#1C1917]">
            {delivery.deliveryAddress}
          </p>
        </div>

        {delivery.paymentMethod === 'COD' && (
          <div className="bg-[#FFF7ED] border-2 border-[#E8632A] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote size={18} className="text-[#E8632A]" />
              <h2 className="text-[14px] font-semibold text-[#1C1917]">
                Paiement à la livraison
              </h2>
            </div>
            <p className="text-[24px] font-bold text-[#E8632A]">
              {delivery.amount} MAD
            </p>
            <p className="text-[12px] text-[#78716C] mt-1">
              À collecter auprès du client
            </p>
          </div>
        )}

        <button className="w-full h-12 bg-[#2563EB] text-white font-semibold rounded-lg flex items-center justify-center gap-2">
          <Navigation size={18} />
          Naviguer — {delivery.distance} (estimé {delivery.estimatedTime})
        </button>

        <button
          onClick={handleNextStep}
          className={`w-full h-12 font-semibold rounded-lg ${
            delivery.status === 'to_collect'
              ? 'bg-[#E8632A] text-white'
              : 'bg-[#16A34A] text-white'
          }`}
        >
          {delivery.status === 'to_collect'
            ? 'Confirmer la collecte'
            : 'Confirmer la livraison'}
        </button>
      </div>
    </div>
  );
};
