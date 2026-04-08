import { useState } from 'react';
import { ArrowLeft, MailOpen, CheckCircle2 } from 'lucide-react';

interface PhoneRecoveryProps {
  onBack: () => void;
}

export default function PhoneRecovery({ onBack }: PhoneRecoveryProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = () => {
    if (validateEmail(email)) {
      setIsSuccess(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const handleResend = () => {
    setIsSuccess(false);
    setEmail('');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
        <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
          <button
            onClick={onBack}
            className="w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors mt-4 ml-4 md:mt-0 md:ml-0"
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
          </button>

          <div className="flex-1 px-4 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>

            <h1 className="text-[22px] font-semibold text-[#1C1917] text-center mt-4">Email envoyé !</h1>
            <p className="text-sm text-[#78716C] text-center mt-2 max-w-[280px]">
              Vérifiez votre boîte mail. Le lien vous permettra de changer votre numéro de téléphone.
            </p>

            <p className="text-xs text-[#A8A29E] text-center mt-4">Le lien expire dans 15 minutes.</p>

            <button onClick={handleResend} className="text-[13px] text-[#2563EB] mt-6">
              Renvoyer l'email
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center">
              <MailOpen className="w-8 h-8 text-[#2563EB]" />
            </div>
          </div>

          <h1 className="text-[22px] font-semibold text-[#1C1917] text-center mt-4">Récupérez votre accès</h1>
          <p className="text-sm text-[#78716C] text-center mt-2 max-w-[280px] mx-auto">
            Entrez l'email de récupération que vous avez fourni à l'inscription.
          </p>

          <div className="mt-8">
            <label className="block text-[13px] font-medium text-[#78716C] mb-2">Email de récupération</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(false);
              }}
              placeholder="votre@email.com"
              className={`h-12 w-full border rounded-xl px-4 text-sm text-[#1C1917] outline-none transition-colors ${
                error ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#2563EB]'
              }`}
            />
            {error && (
              <div className="text-[13px] text-[#DC2626] mt-2">
                Email non reconnu. Vérifiez l'adresse ou contactez le support.
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-8">
          <button
            onClick={handleSubmit}
            disabled={!email}
            className={`h-14 w-full rounded-xl text-base font-semibold transition-colors ${
              email
                ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                : 'bg-[#E2E8F0] text-[#A8A29E] cursor-not-allowed'
            }`}
          >
            Recevoir le lien de récupération
          </button>
          <div className="text-xs text-[#78716C] text-center mt-4">
            Vous n'avez pas configuré d'email de récupération ?{' '}
            <button className="text-[#E8632A]">Contacter le support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
