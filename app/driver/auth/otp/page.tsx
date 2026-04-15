'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { OtpBoxes } from '../../_components/OtpBoxes';
import { verifyDriverOtpAction } from './actions';

function OtpContent() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const allFilled = otp.every(d => d !== '');

  async function handleVerify() {
    if (!allFilled || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await verifyDriverOtpAction(phone, otp.join(''));
      if (result?.error) {
        setError('Code incorrect — réessayez');
        setOtp(['', '', '', '', '', '']);
      }
    } finally {
      setLoading(false);
    }
  }

  const masked = phone.slice(0, -2).replace(/\d(?=\d{2})/g, 'X') + phone.slice(-2);

  return (
    <main className="min-h-screen bg-[#FAFAF9] px-6">
      <div className="pt-4">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-xl"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6 text-[#1C1917]" />
        </button>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-[22px] font-bold text-[#1C1917] mt-4">Code de vérification</h1>
        <p className="text-sm text-[#78716C] mt-2 text-center">
          Un code à 6 chiffres a été envoyé au<br />
          <span className="text-[#1C1917]">{masked}</span>
        </p>

        <div className="mt-8 w-full">
          <OtpBoxes value={otp} onChange={setOtp} state={error ? 'error' : 'default'} />
        </div>

        {error && (
          <p className="text-[13px] text-red-600 mt-3">{error}</p>
        )}

        <div className="mt-4 text-center">
          {countdown > 0 ? (
            <p className="text-[13px] text-[#78716C]">Le code expirera dans {String(Math.floor(countdown / 60)).padStart(2,'0')}:{String(countdown % 60).padStart(2,'0')}</p>
          ) : (
            <button
              onClick={() => { setCountdown(60); setOtp(['','','','','','']); }}
              className="text-[14px] underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Renvoyer le code
            </button>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={!allFilled || loading}
          className="mt-8 w-full h-[52px] rounded-xl text-base font-bold text-white flex items-center justify-center transition-all disabled:bg-gray-200 disabled:text-gray-400"
          style={allFilled && !loading ? { backgroundColor: 'var(--color-primary)' } : {}}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vérifier le code'}
        </button>
      </div>
    </main>
  );
}

export default function DriverOtpPage() {
  return <Suspense><OtpContent /></Suspense>;
}
