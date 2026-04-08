'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Delete } from 'lucide-react';
import { verifyPinLoginAction } from './actions';

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

  const merchantName = searchParams.get('name') ?? t('defaultStoreName');
  const phoneNumber = searchParams.get('phone') ?? '';

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pin.length === 4 && !isSubmitting) {
      setIsSubmitting(true);
      const timer = setTimeout(async () => {
        const result = await verifyPinLoginAction({ phone: phoneNumber, pin });
        if (result?.error) {
          const newAttempts = attempts - 1;
          setAttempts(newAttempts);
          setError(true);
          setPin('');
          setIsSubmitting(false);
          if (newAttempts === 0) setIsLocked(true);
          setTimeout(() => setError(false), 3000);
        }
        // On success verifyPinLoginAction redirects to /dashboard — no client code needed.
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function handleNumberPress(num: string) {
    if (!isLocked && !isSubmitting && pin.length < 4) setPin(pin + num);
  }

  function handleBackspace() {
    if (!isLocked && !isSubmitting) setPin(pin.slice(0, -1));
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="pb-6">
          <div className="text-[28px] font-bold text-[#2563EB] text-center">{t('logo')}</div>
        </div>

        {/* Merchant card */}
        <div className="bg-[#FAFAF9] rounded-2xl p-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center">
            <span className="text-xl font-semibold text-[#2563EB]">{getInitials(merchantName)}</span>
          </div>
          <div className="text-lg font-semibold text-[#1C1917] mt-2">{merchantName}</div>
          <div className="text-[13px] text-[#78716C]">{phoneNumber}</div>
        </div>

        {/* PIN input */}
        <div className="mt-8">
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
                disabled={isLocked || isSubmitting}
                className={`h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all ${
                  isLocked || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumberPress('0')}
              disabled={isLocked || isSubmitting}
              className={`h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all ${
                isLocked || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              0
            </button>
            {/* TODO PLZ-033: migrate to i18n */}
            <button
              onClick={handleBackspace}
              disabled={isLocked || isSubmitting}
              className={`h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F0F4FF] active:scale-95 transition-all ${
                isLocked || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
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

        <div className="pt-8 text-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-xs text-[#A8A29E]"
          >
            {t('switchAccount')}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PINLoginPage() {
  return (
    <Suspense>
      <PINLoginContent />
    </Suspense>
  );
}
