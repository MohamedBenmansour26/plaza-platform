import { useState } from 'react';

interface PhoneEntryProps {
  onSubmit: (phone: string) => void;
}

export default function PhoneEntry({ onSubmit }: PhoneEntryProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(false);

  const validatePhone = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    return cleaned.length === 9 && cleaned.startsWith('6');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhone(value);
      setError(false);
    }
  };

  const handleSubmit = () => {
    if (validatePhone(phone)) {
      onSubmit(phone);
    } else {
      setError(true);
    }
  };

  const formatPhoneDisplay = (value: string) => {
    if (!value) return '';
    const groups = value.match(/.{1,2}/g) || [];
    return groups.join(' ');
  };

  const isValid = validatePhone(phone);

  return (
    <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
      <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        <div className="flex-[0.3] flex flex-col items-center justify-center pt-12 md:pt-0">
          <div className="text-[28px] font-bold text-[#2563EB]">Plaza</div>
          <div className="text-sm text-[#78716C] text-center mt-2">
            Votre boutique en ligne, en 5 minutes.
          </div>
        </div>

        <div className="flex-[0.4] px-4 mt-8">
          <label className="block text-[13px] font-medium text-[#78716C] mb-2">
            Votre numéro de téléphone
          </label>
          <div
            className={`flex items-center h-14 rounded-xl bg-white ${
              error ? 'border-2 border-[#DC2626]' : 'border border-[#E2E8F0]'
            }`}
          >
            <button className="flex items-center justify-center gap-1 w-20 h-full border-r border-[#E2E8F0] px-2">
              <span className="text-lg">🇲🇦</span>
              <span className="text-sm font-medium text-[#1C1917]">+212</span>
            </button>
            <input
              type="tel"
              value={formatPhoneDisplay(phone)}
              onChange={handlePhoneChange}
              placeholder="6 XX XX XX XX"
              className="flex-1 h-full px-4 text-base bg-transparent outline-none text-[#1C1917]"
            />
          </div>
          <div className={`text-xs mt-2 ${error ? 'text-[#DC2626]' : 'text-[#78716C]'}`}>
            {error ? 'Numéro invalide. Format: 6XX XX XX XX' : 'Nous enverrons un code de vérification par SMS'}
          </div>
        </div>

        <div className="flex-[0.3] px-4 pb-8 flex flex-col justify-end">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`h-14 w-full rounded-xl text-base font-semibold transition-colors ${
              isValid
                ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                : 'bg-[#E2E8F0] text-[#A8A29E] cursor-not-allowed'
            }`}
          >
            Continuer
          </button>
          <div className="text-[11px] text-[#A8A29E] text-center mt-4 leading-relaxed">
            En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
          </div>
        </div>
      </div>
    </div>
  );
}
