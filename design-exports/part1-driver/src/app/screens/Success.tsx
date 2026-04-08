import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { CheckCircle, Banknote, Package, Clock } from 'lucide-react';

export const Success: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries } = useApp();

  const delivery = deliveries.find(d => d.id === id);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/livraisons');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

  const onTime = delivery.onTime !== false;

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-6">
      <div className="w-24 h-24 bg-[#16A34A] rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={56} className="text-white" strokeWidth={3} />
      </div>

      <h1 className="text-[24px] font-bold text-[#1C1917] mb-2 text-center">
        Livraison confirmée !
      </h1>
      <p className="text-[15px] text-[#78716C] text-center mb-8">
        {delivery.orderNumber}
      </p>

      <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-sm mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Banknote size={18} className="text-[#16A34A]" />
              <span className="text-[14px] text-[#78716C]">Gain</span>
            </div>
            <span className="text-[18px] font-semibold text-[#16A34A]">
              {delivery.earnings} MAD
            </span>
          </div>

          {delivery.paymentMethod === 'COD' && (
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#E8632A]" />
                <span className="text-[14px] text-[#78716C]">Montant collecté</span>
              </div>
              <span className="text-[16px] font-semibold text-[#1C1917]">
                {delivery.amount} MAD
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#78716C]" />
              <span className="text-[14px] text-[#78716C]">Temps de livraison</span>
            </div>
            <span className="text-[14px] font-medium text-[#1C1917]">
              {delivery.estimatedTime}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {onTime ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#16A34A]" />
                  <span className="text-[14px] text-[#16A34A] font-medium">
                    Dans le créneau ✓
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#D97706]" />
                  <span className="text-[14px] text-[#D97706] font-medium">
                    Hors créneau (+{delivery.lateBy} min)
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[13px] text-[#78716C] mb-1">Gains aujourd'hui</p>
        <p className="text-[20px] font-bold text-[#16A34A]">175 MAD</p>
      </div>

      <p className="text-[12px] text-[#78716C] text-center mt-8">
        Redirection automatique...
      </p>

      <button
        onClick={() => navigate('/livraisons')}
        className="mt-4 text-[14px] text-[#2563EB] font-medium"
      >
        Retour aux livraisons
      </button>
    </div>
  );
};
