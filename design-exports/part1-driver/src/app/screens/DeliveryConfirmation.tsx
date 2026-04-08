import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, User, Camera, CheckCircle, Banknote } from 'lucide-react';

export const DeliveryConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries, completeDelivery } = useApp();
  const [code, setCode] = useState(['8', '3', '1', '9', '0', '5']);
  const [codeStatus] = useState<'valid'>('valid');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const delivery = deliveries.find(d => d.id === id);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

  const showTimeWarning = delivery.timeRemaining < 30;

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      setActiveIndex(index + 1);
    }
  };

  const handleTakePhoto = () => {
    setPhotoTaken(true);
  };

  const handleConfirm = () => {
    const onTime = delivery.timeRemaining > 0;
    const lateBy = onTime ? 0 : Math.abs(delivery.timeRemaining);
    completeDelivery(delivery.id, onTime, lateBy);
    navigate(`/succes/${delivery.id}`);
  };

  const isValid = codeStatus === 'valid' && photoTaken;

  const getBoxStyle = () => {
    return 'border-2 border-[#16A34A] bg-[#F0FDF4]';
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} className="text-[#1C1917]" />
        </button>
        <div>
          <h1 className="text-[18px] font-semibold text-[#1C1917]">
            {delivery.orderNumber}
          </h1>
          <p className="text-[13px] text-[#78716C]">Confirmation de livraison</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-[#1C1917]">
            Confirmer la livraison
          </h2>
          <p className="text-[14px] text-[#78716C] mt-1">
            Demandez le code au client
          </p>
        </div>

        {showTimeWarning && (
          <div className="bg-[#FFF7ED] border-l-4 border-[#E8632A] rounded-lg p-3 mb-3">
            <p className="text-[13px] text-[#E8632A] font-semibold">
              Créneau: {delivery.timeSlotStart}–{delivery.timeSlotEnd} — Dans {delivery.timeRemaining} min
            </p>
          </div>
        )}

        {delivery.paymentMethod === 'COD' && (
          <div className="bg-[#FFF7ED] border-2 border-[#E8632A] rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Banknote size={18} className="text-[#E8632A]" />
              <h3 className="text-[14px] font-semibold text-[#1C1917]">
                Paiement à collecter
              </h3>
            </div>
            <p className="text-[28px] font-bold text-[#E8632A]">
              {delivery.amount} MAD
            </p>
            <p className="text-[12px] text-[#78716C] mt-1">
              Confirmez avoir reçu ce montant
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-[#2563EB]" />
            <h3 className="text-[14px] font-semibold text-[#1C1917]">
              Code de livraison — {delivery.customerName}
            </h3>
          </div>

          <p className="text-[13px] text-[#78716C] mb-3">
            Saisissez le code à 6 chiffres
          </p>

          <div className="flex gap-2 justify-center mb-2">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onFocus={() => setActiveIndex(index)}
                className={`w-12 h-14 text-center text-[20px] font-semibold text-[#1C1917] rounded-lg focus:outline-none ${getBoxStyle()}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-2">
            <CheckCircle size={16} className="text-[#16A34A]" />
            <p className="text-[12px] text-[#16A34A]">Code validé</p>
          </div>

          <p className="text-[12px] text-[#78716C] italic text-center mt-3">
            Le client trouve ce code dans son SMS de confirmation de commande
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
          <h3 className="text-[14px] font-semibold text-[#1C1917] mb-1">
            Photo de livraison
          </h3>
          <p className="text-[12px] text-[#DC2626] mb-3">
            Photo obligatoire — colis remis au client
          </p>

          {!photoTaken ? (
            <button
              onClick={handleTakePhoto}
              className="w-full h-40 border-2 border-dashed border-[#DC2626] rounded-lg flex flex-col items-center justify-center gap-2"
            >
              <Camera size={32} className="text-[#78716C]" />
              <span className="text-[13px] text-[#78716C]">Prendre une photo</span>
            </button>
          ) : (
            <div className="relative">
              <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                <Camera size={48} className="text-gray-400" />
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#16A34A] rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(`/probleme/${delivery.id}`)}
          className="w-full text-[13px] text-[#DC2626] underline py-2"
        >
          Signaler un problème
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-[375px] mx-auto">
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`w-full h-12 font-semibold rounded-lg transition-colors ${
              isValid
                ? 'bg-[#16A34A] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirmer la livraison
          </button>
        </div>
      </div>
    </div>
  );
};
