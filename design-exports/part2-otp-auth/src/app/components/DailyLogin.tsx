import { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';

interface DailyLoginProps {
  merchantName: string;
  phoneNumber: string;
  onLoginSuccess: () => void;
  onForgotPIN: () => void;
}

export default function DailyLogin({ merchantName, phoneNumber, onLoginSuccess, onForgotPIN }: DailyLoginProps) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    if (pin.length === 4) {
      setTimeout(() => {
        const isCorrect = pin === '1234';
        if (isCorrect) {
          onLoginSuccess();
        } else {
          const newAttempts = attempts - 1;
          setAttempts(newAttempts);
          setError(true);
          setPin('');
          if (newAttempts === 0) {
            setIsLocked(true);
          }
          setTimeout(() => setError(false), 3000);
        }
      }, 500);
    }
  }, [pin]);

  const handleNumberPress = (num: string) => {
    if (!isLocked && pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    if (!isLocked) {
      setPin(pin.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
      <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        <div className="pt-16 px-4">
          <div className="text-[28px] font-bold text-[#2563EB] text-center">Plaza</div>
        </div>

        <div className="px-4 mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-[#2563EB]">{getInitials(merchantName)}</span>
            </div>
            <div className="text-lg font-semibold text-[#1C1917] mt-2">{merchantName}</div>
            <div className="text-[13px] text-[#78716C]">{phoneNumber}</div>
          </div>
        </div>

        <div className="flex-1 px-4 mt-8">
          <div className="text-xs text-[#78716C] uppercase tracking-wide text-center">ENTREZ VOTRE CODE PIN</div>

          <div className="flex justify-center gap-4 mt-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full transition-all ${
                  isLocked
                    ? 'border-2 border-[#A8A29E] bg-[#F5F5F4]'
                    : pin.length > index
                    ? 'bg-[#2563EB]'
                    : 'border-2 border-[#E2E8F0] bg-white'
                }`}
              />
            ))}
          </div>

          {error && !isLocked && (
            <div className="text-[13px] text-[#DC2626] text-center mt-4">
              PIN incorrect. {attempts} tentative(s) restante(s).
            </div>
          )}

          {isLocked && (
            <div className="text-[13px] text-[#DC2626] text-center mt-4 font-medium">
              Compte verrouillé. Utilisez PIN oublié.
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-[280px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num.toString())}
                disabled={isLocked}
                className={`h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumberPress('0')}
              disabled={isLocked}
              className={`h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all ${
                isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              disabled={isLocked}
              className={`h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F0F4FF] active:scale-95 transition-all ${
                isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Delete className="w-5 h-5 text-[#1C1917]" />
            </button>
          </div>

          <button onClick={onForgotPIN} className="text-[13px] text-[#2563EB] text-center mt-4 w-full">
            PIN oublié ?
          </button>
        </div>

        <div className="pb-8 text-center">
          <button className="text-xs text-[#A8A29E]">Changer de compte</button>
        </div>
      </div>
    </div>
  );
}
