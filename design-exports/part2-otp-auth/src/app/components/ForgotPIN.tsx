import { ArrowLeft, Lock, Phone } from 'lucide-react';

interface ForgotPINProps {
  phoneNumber: string;
  onSendOTP: () => void;
  onPhoneRecovery: () => void;
  onBack: () => void;
}

export default function ForgotPIN({ phoneNumber, onSendOTP, onPhoneRecovery, onBack }: ForgotPINProps) {
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
            <div className="w-16 h-16 bg-[#FFFBEB] rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#D97706]" />
            </div>
          </div>

          <h1 className="text-[22px] font-semibold text-[#1C1917] text-center mt-4">PIN oublié ?</h1>
          <p className="text-sm text-[#78716C] text-center mt-2 max-w-[280px] mx-auto">
            Nous allons vérifier votre identité via SMS avant de réinitialiser votre PIN.
          </p>

          <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 mt-8">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#78716C]" />
              <span className="text-sm text-[#1C1917]">{phoneNumber}</span>
            </div>
            <p className="text-xs text-[#78716C] mt-2">Un code vous sera envoyé à ce numéro.</p>
          </div>
        </div>

        <div className="px-4 pb-8">
          <button
            onClick={onSendOTP}
            className="h-14 w-full rounded-xl bg-[#2563EB] text-white text-base font-semibold hover:bg-[#1d4ed8] transition-colors"
          >
            Envoyer un code SMS
          </button>
          <button onClick={onPhoneRecovery} className="text-[13px] text-[#78716C] text-center mt-4 w-full">
            Ce n'est pas votre numéro ?
          </button>
        </div>
      </div>
    </div>
  );
}
