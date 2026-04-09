'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Delete, Fingerprint } from 'lucide-react';
import { completePinSetupAction } from './actions';

type Step = 1 | 2;

const NUMPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function PINSetupContent() {
  const t = useTranslations('auth.pin');
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const submitting = useRef(false);

  const [step, setStep] = useState<Step>(1);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // Auto-advance when PIN is complete
  useEffect(() => {
    if (pin.length === 4 && step === 1) {
      const timer = setTimeout(() => setStep(2), 300);
      return () => clearTimeout(timer);
    }
  }, [pin, step]);

  // Validate confirm PIN
  useEffect(() => {
    if (confirmPin.length === 4 && !submitting.current) {
      if (pin === confirmPin) {
        submitting.current = true;
        // Create Supabase auth user and establish session, then redirect to /dashboard.
        completePinSetupAction({ phone, pin }).then((result) => {
          if (result?.error) {
            submitting.current = false;
            setError(true);
            setConfirmPin('');
          }
          // On success the server action calls redirect() which throws NEXT_REDIRECT —
          // the browser follows the redirect automatically.
        });
      } else {
        setError(true);
        setShake(true);
        const clearShake = setTimeout(() => {
          setShake(false);
          setConfirmPin('');
        }, 600);
        const clearError = setTimeout(() => setError(false), 3000);
        return () => {
          clearTimeout(clearShake);
          clearTimeout(clearError);
        };
      }
    }
  }, [confirmPin, pin, phone]);

  function handleNumberPress(num: string) {
    if (step === 1 && pin.length < 4) setPin(pin + num);
    else if (step === 2 && confirmPin.length < 4) setConfirmPin(confirmPin + num);
  }

  function handleBackspace() {
    if (step === 1) setPin(pin.slice(0, -1));
    else setConfirmPin(confirmPin.slice(0, -1));
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
      setConfirmPin('');
      setError(false);
    }
  }

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* TODO PLZ-033: migrate to i18n */}
          <button
            onClick={handleBack}
            className={`w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors ${
              step === 1 ? 'invisible' : ''
            }`}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
          </button>
          {/* Step dots */}
          <div className="flex gap-2">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
          </div>
          <div className="w-11" />
        </div>

        <div className="text-xs text-[#78716C] uppercase tracking-wide">{t('secureLabel')}</div>
        <h1 className="text-[22px] font-semibold text-[#1C1917] mt-2">
          {step === 1 ? t('createTitle') : t('confirmTitle')}
        </h1>
        <p className="text-sm text-[#78716C] mt-2">{t('subtitle')}</p>

        {/* PIN dots — mobile only */}
        <div className="lg:hidden">
          <div className={`flex justify-center gap-4 mt-8 ${shake ? 'animate-bounce' : ''}`}>
            {([0, 1, 2, 3] as const).map((index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full transition-all ${
                  currentPin.length > index
                    ? error ? 'bg-[#DC2626]' : 'bg-[#2563EB]'
                    : 'border-2 border-[#E2E8F0] bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: 4 separate input fields */}
        <div className="hidden lg:flex justify-center gap-3 mt-8">
          {([0, 1, 2, 3] as const).map((index) => (
            <input
              key={index}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={currentPin[index] ?? ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(-1);
                const arr = (currentPin + '    ').slice(0, 4).split('');
                arr[index] = val;
                const newPin = arr.join('').trimEnd();
                if (step === 1) setPin(newPin);
                else setConfirmPin(newPin);
                if (val && index < 3) {
                  const next = document.getElementById(`pin-input-${index + 1}`);
                  if (next) (next as HTMLInputElement).focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
                  const prev = document.getElementById(`pin-input-${index - 1}`);
                  if (prev) (prev as HTMLInputElement).focus();
                }
              }}
              id={`pin-input-${index}`}
              className={`w-12 h-12 text-center text-xl border-2 rounded-lg outline-none transition-all ${
                error ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-[13px] text-[#DC2626] text-center mt-4">{t('mismatch')}</div>
        )}

        {/* Custom numpad — mobile only */}
        <div className="lg:hidden">
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-[280px] mx-auto">
            {NUMPAD.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num.toString())}
                className="h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            {/* Bottom row */}
            <div />
            <button
              onClick={() => handleNumberPress('0')}
              className="h-16 rounded-2xl bg-white border border-[#E2E8F0] text-xl font-medium text-[#1C1917] hover:bg-[#F0F4FF] active:scale-95 transition-all"
            >
              0
            </button>
            {/* TODO PLZ-033: migrate to i18n */}
            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F0F4FF] active:scale-95 transition-all"
              aria-label="Effacer"
            >
              <Delete className="w-5 h-5 text-[#1C1917]" />
            </button>
          </div>
        </div>

        {/* Biometric (disabled, coming soon) — mobile only */}
        <div className="lg:hidden">
          <div className="flex items-center gap-3 mt-6 p-4 bg-[#FAFAF9] rounded-xl">
            <Fingerprint className="w-5 h-5 text-[#A8A29E] flex-shrink-0" />
            <span className="text-[13px] text-[#78716C] flex-1">{t('biometricLabel')}</span>
            <div className="flex items-center gap-2">
              <div className="w-10 h-6 rounded-full bg-[#E2E8F0] relative">
                <div className="w-5 h-5 rounded-full bg-white absolute start-0.5 top-0.5" />
              </div>
              <span className="text-xs text-[#A8A29E] bg-[#F5F5F4] px-2 py-1 rounded-full">
                {t('biometricSoon')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PINSetupPage() {
  return (
    <Suspense>
      <PINSetupContent />
    </Suspense>
  );
}
