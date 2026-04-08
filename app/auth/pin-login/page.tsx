'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Delete } from 'lucide-react';

const NUMPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function PINLoginContent() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();

  const merchantName = searchParams.get('name') ?? 'Marchand';
  const phoneNumber = searchParams.get('phone') ?? '';

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        // DEV stub — PIN verification is server-side
        console.log('[DEV] Verifying PIN for', phoneNumber);
        // Hardcoded PIN for dev: 1234
        const isCorrect = pin === '1234';
        if (isCorrect) {
          router.push('/dashboard');
        } else {
          const newAttempts = attempts - 1;
          setAttempts(newAttempts);
          setError(true);
          setPin('');
          if (newAttempts === 0) setIsLocked(true);
          setTimeout(() => setError(false), 3000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function handleNumberPress(num: string) {
    if (!isLocked && pin.length < 4) setPin(pin + num);
  }

  function handleBackspace() {
    if (!isLocked) setPin(pin.slice(0, -1));
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:items-center md:justify-center md:bg-[#FAFAF9]">
      <div className="flex-1 flex flex-col md:flex-none md:w-full md:max-w-[420px] md:bg-white md:rounded-2xl md:shadow-lg md:p-8">
        {/* Logo */}
        <div className="pt-16 px-4">
          <div className="text-[28px] font-bold text-[#2563EB] text-center">{t('logo')}</div>
        </div>

        {/* Merchant card */}
        <div className="px-4 mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-[#2563EB]">{getInitials(merchantName)}</span>
            </div>
            <div className="text-lg font-semibold text-[#1C1917] mt-2">{merchantName}</div>
            <div className="text-[13px] text-[#78716C]">{phoneNumber}</div>
          </div>
        </div>

        {/* PIN input */}
        <div className="flex-1 px-4 mt-8">
          <div className="text-xs text-[#78716C] uppercase tracking-wide text-center">{t('pinLabel')}</div>

          <div className="flex justify-center gap-4 mt-6">
            {([0, 1, 2, 3] as const).map((index) => (
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
              {t('pinError', { attempts })}
            </div>
          )}

          {isLocked && (
            <div className="text-[13px] text-[#DC2626] text-center mt-4 font-medium">
              {t('locked')}
            </div>
          )}

          {/* Custom numpad */}
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-[280px] mx-auto">
            {NUMPAD.map((num) => (
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
              aria-label="Effacer"
            >
              <Delete className="w-5 h-5 text-[#1C1917]" />
            </button>
          </div>

          <button
            onClick={() => router.push('/auth/forgot-pin')}
            className="text-[13px] text-[#2563EB] text-center mt-4 w-full"
          >
            {t('forgotPin')}
          </button>
        </div>

        <div className="pb-8 text-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-xs text-[#A8A29E]"
          >
            {t('switchAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PINLoginPage() {
  return (
    <Suspense>
      <PINLoginContent />
    </Suspense>
  );
}
