import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function OTPVerification({ phoneNumber, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [attempts, setAttempts] = useState(3);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (otp.every((digit) => digit !== '')) {
      setIsChecking(true);
      setTimeout(() => {
        const isCorrect = otp.join('') === '123456';
        if (isCorrect) {
          setIsSuccess(true);
          setTimeout(() => {
            onVerified();
          }, 1000);
        } else {
          const newAttempts = attempts - 1;
          setAttempts(newAttempts);
          setError(true);
          setIsChecking(false);
          setOtp(['', '', '', '', '', '']);
          if (newAttempts === 0) {
            setIsLocked(true);
          }
          setTimeout(() => setError(false), 3000);
        }
      }, 1500);
    }
  }, [otp]);

  const handleChange = (index: number, value: string) => {
    if (isLocked || isChecking) return;

    const newValue = value.replace(/\D/g, '');
    if (newValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = newValue;
      setOtp(newOtp);

      if (newValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (countdown === 0) {
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError(false);
      inputRefs.current[0]?.focus();
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
      <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        <button
          onClick={onBack}
          className="w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors mt-4 ml-4 md:mt-0 md:ml-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>

        <div className="flex-1 px-4 mt-12">
          <h1 className="text-2xl font-semibold text-[#1C1917]">Vérifiez votre numéro</h1>
          <p className="text-sm text-[#78716C] mt-2">
            Code envoyé par SMS au <span className="text-[#1C1917]">{phoneNumber}</span>
          </p>

          <div className="flex justify-center gap-2 mt-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLocked || isChecking}
                className={`w-12 h-14 text-xl font-semibold text-center rounded-xl transition-all ${
                  isSuccess
                    ? 'border-2 border-[#16A34A] bg-[#F0FDF4]'
                    : error
                    ? 'border border-[#DC2626] bg-[#FEF2F2]'
                    : digit
                    ? 'bg-[#F8FAFC] border border-[#E2E8F0]'
                    : otp.some((d, i) => d === '' && i === index)
                    ? 'border-2 border-[#2563EB] ring-2 ring-[#2563EB]/20'
                    : 'border border-[#E2E8F0]'
                } ${isLocked ? 'bg-[#F5F5F4] text-[#A8A29E]' : 'text-[#1C1917]'}`}
              />
            ))}
          </div>

          {isChecking && (
            <div className="flex items-center justify-center gap-2 mt-4 text-[13px] text-[#78716C]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Vérification...
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center justify-center gap-2 mt-4 text-[13px] text-[#16A34A]">
              <CheckCircle2 className="w-4 h-4" />
              Code vérifié !
            </div>
          )}

          {error && !isLocked && (
            <div className="text-[13px] text-[#DC2626] text-center mt-4">
              Code incorrect. {attempts} tentative(s) restante(s).
            </div>
          )}

          {isLocked && (
            <div className="text-[13px] text-[#DC2626] text-center mt-4 font-medium">
              Trop de tentatives. Réessayez dans 24h.
            </div>
          )}

          {!isLocked && (
            <div className="mt-6 text-center">
              {countdown > 0 ? (
                <div className="text-[13px] text-[#A8A29E]">Renvoyer le code dans {formatCountdown(countdown)}</div>
              ) : (
                <button onClick={handleResend} className="text-[13px] text-[#2563EB] underline">
                  Renvoyer le code
                </button>
              )}
            </div>
          )}

          <button className="text-[13px] text-[#78716C] text-center mt-4 w-full">Mauvais numéro ?</button>
        </div>
      </div>
    </div>
  );
}
