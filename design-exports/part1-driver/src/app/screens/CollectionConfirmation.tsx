import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Store, Camera, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const CollectionConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries, updateDelivery } = useApp();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [codeStatus, setCodeStatus] = useState<'empty' | 'typing' | 'valid' | 'invalid'>('empty');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const delivery = deliveries.find(d => d.id === id);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      setActiveIndex(index + 1);
    }

    if (newCode.every(digit => digit !== '')) {
      const enteredCode = newCode.join('');
      if (enteredCode === delivery.merchantCode) {
        setCodeStatus('valid');
      } else {
        setCodeStatus('invalid');
      }
    } else {
      setCodeStatus('typing');
    }
  };

  const handleTakePhoto = () => {
    setPhotoTaken(true);
  };

  const handleConfirm = () => {
    updateDelivery(delivery.id, { 
      status: 'in_delivery',
      packagePhoto: 'taken'
    });
    toast.success(`Collecte confirmée ! En route vers ${delivery.customerName.split(' ')[0]}.`);
    navigate('/livraisons');
  };

  const isValid = codeStatus === 'valid' && photoTaken;

  const getBoxStyle = (index: number) => {
    if (codeStatus === 'valid') {
      return 'border-2 border-[#16A34A] bg-[#F0FDF4]';
    }
    if (codeStatus === 'invalid') {
      return 'border-2 border-[#DC2626]';
    }
    if (index === activeIndex) {
      return 'border-2 border-[#2563EB]';
    }
    return 'border-2 border-[#E2E8F0]';
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
          <p className="text-[13px] text-[#78716C]">Confirmation de collecte</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-[#1C1917]">
            Confirmer la collecte
          </h2>
          <p className="text-[14px] text-[#78716C] mt-1">
            Demandez le code au marchand
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <Store size={18} className="text-[#E8632A]" />
            <h3 className="text-[14px] font-semibold text-[#1C1917]">
              Code de collecte — {delivery.pickupShop}
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
                className={`w-12 h-14 text-center text-[20px] font-semibold text-[#1C1917] rounded-lg focus:outline-none ${getBoxStyle(index)}`}
              />
            ))}
          </div>

          {codeStatus === 'invalid' && (
            <p className="text-[12px] text-[#DC2626] text-center mt-2">
              Code incorrect. Réessayez.
            </p>
          )}

          {codeStatus === 'valid' && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <CheckCircle size={16} className="text-[#16A34A]" />
              <p className="text-[12px] text-[#16A34A]">Code validé</p>
            </div>
          )}

          <p className="text-[12px] text-[#78716C] italic text-center mt-3">
            Le marchand trouve ce code dans son application
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#1C1917] mb-1">
            Photo du colis
          </h3>
          <p className="text-[12px] text-[#78716C] mb-3">
            Prenez une photo avant de partir
          </p>

          {!photoTaken ? (
            <button
              onClick={handleTakePhoto}
              className="w-full h-36 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#2563EB] transition-colors"
            >
              <Camera size={32} className="text-[#78716C]" />
              <span className="text-[13px] text-[#78716C]">Prendre une photo</span>
            </button>
          ) : (
            <div className="relative">
              <div className="w-full h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                <Camera size={48} className="text-gray-400" />
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#16A34A] rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-[375px] mx-auto">
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`w-full h-12 font-semibold rounded-lg transition-colors ${
              isValid
                ? 'bg-[#E8632A] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirmer la collecte
          </button>
        </div>
      </div>
    </div>
  );
};
