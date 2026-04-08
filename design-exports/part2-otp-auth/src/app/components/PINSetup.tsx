import { useState, useEffect } from 'react';
import { ArrowLeft, Delete, Fingerprint } from 'lucide-react';

interface PINSetupProps {
  onComplete: (pin: string) => void;
}

export default function PINSetup({ onComplete }: PINSetupProps) {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (confirmPin.length === 4) {
      if (pin === confirmPin) {
        setTimeout(() => {
          onComplete(pin);
        }, 500);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setConfirmPin('');
        }, 600);
        setTimeout(() => setError(false), 3000);
      }
    }
  }, [confirmPin]);

  useEffect(() => {
    if (pin.length === 4 && step === 1) {
      setTimeout(() => {
        setStep(2);
      }, 300);
    }
  }, [pin]);

  const handleNumberPress = (num: string) => {
    if (step === 1 && pin.length < 4) {
      setPin(pin + num);
    } else if (step === 2 && confirmPin.length < 4) {
      setConfirmPin(confirmPin + num);
    }
  };

  const handleBackspace = () => {
    if (step === 1) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setConfirmPin('');
      setError(false);
    }
  };

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
      <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        <div className="flex items-center justify-between px-4 pt-4 md:pt-0">
          <button
            onClick={handleBack}
            className={`w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors ${
              step === 1 ? 'invisible' : ''
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
          </button>
          <div className="flex gap-2">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
          </div>
          <div className="w-11" />
        </div>

        <div className="flex-1 px-4 mt-8">
          <div className="text-xs text-[#78716C] uppercase tracking-wide">SÉCURISEZ VOTRE COMPTE</div>
          <h1 className="text-[22px] font-semibold text-[#1C1917] mt-2">
            {step === 1 ? 'Créez votre code PIN' : 'Confirmez votre code PIN'}
          </h1>
          <p className="text-sm text-[#78716C] mt-2">Vous l'utiliserez pour vous connecter chaque jour</p>

          <div className={`flex justify-center gap-4 mt-8 ${shake ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full transition-all ${
                  currentPin.length > index
                    ? 'bg-[#2563EB]'
                    : 'border-2 border-[#E2E8F0] bg-white'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="text-[13px] text-[#DC2626] text-center mt-4">
              Les codes ne correspondent pas. Réessayez.
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-[280px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num.toString())}
                className="h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumberPress('0')}
              className="h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F0F4FF] active:scale-95 transition-all"
            >
              <Delete className="w-5 h-5 text-[#1C1917]" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-6 p-4 bg-[#FAFAF9] rounded-xl">
            <Fingerprint className="w-5 h-5 text-[#A8A29E] flex-shrink-0" />
            <span className="text-[13px] text-[#78716C] flex-1">
              Activer Face ID / empreinte digitale
            </span>
            <div className="flex items-center gap-2">
              <div className="w-10 h-6 rounded-full bg-[#E2E8F0] relative">
                <div className="w-5 h-5 rounded-full bg-white absolute left-0.5 top-0.5" />
              </div>
              <span className="text-xs text-[#A8A29E] bg-[#F5F5F4] px-2 py-1 rounded-full">
                Bientôt disponible
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
