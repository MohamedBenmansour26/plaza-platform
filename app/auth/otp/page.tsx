'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

function OTPContent() {
  const t = useTranslations('auth.otp');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';

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
    if (otp.every((digit) => digit !== '') && !isChecking) {
      setIsChecking(true);
      // MVP stub — any 6-digit code is accepted until a real SMS provider is wired up
      setTimeout(() => {
        const isCorrect = otp.every(d => d !== '') && otp.join('').length === 6;
        if (isCorrect) {
          setIsSuccess(true);
          // Pass phone through to pin-setup so it can create the Supabase user
          const params = new URLSearchParams({ phone });
          setTimeout(() => router.push(`/auth/pin-setup?${params.toString()}`), 1000);
        } else {
          const newAttempts = attempts - 1;
          setAttempts(newAttempts);
          setError(true);
          setIsChecking(false);
          setOtp(['', '', '', '', '', '']);
          if (newAttempts === 0) setIsLocked(true);
          setTimeout(() => setError(false), 3000);
        }
      }, 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  function handleChange(index: number, value: string) {
    if (isLocked || isChecking) return;
    const newValue = value.replace(/\D/g, '');

    // Handle paste of full 6-digit code
    if (newValue.length > 1) {
      const digits = newValue.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
      return;
    }

    if (newValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = newValue;
      setOtp(newOtp);
      if (newValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleResend() {
    if (countdown === 0) {
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError(false);
      // TODO: [SMS stub — implement real OTP resend via SMS provider]
      inputRefs.current[0]?.focus();
    }
  }

  function formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8">
        {/* TODO PLZ-033: migrate to i18n */}
        <button
          onClick={() => router.back()}
          className="w-11 h-11 flex items-center justify-center hover:bg-[#F5F5F4] rounded-lg transition-colors -ms-2 mb-4"
          aria-label="Retour"
          data-testid="merchant-otp-back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
        </button>

        <h1 className="text-2xl font-semibold text-[#1C1917]">{t('title')}</h1>
        <p className="text-sm text-[#78716C] mt-2">
          {t('subtitle')} <span className="text-[#1C1917]">{phone}</span>
        </p>

        {/* 6-box OTP input */}
        <div className="flex justify-center gap-2 mt-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => {
                e.preventDefault();
                handleChange(index, e.clipboardData.getData('text'));
              }}
              disabled={isLocked || isChecking}
              className={`w-12 h-14 text-xl font-semibold text-center rounded-xl transition-all outline-none ${
                isSuccess
                  ? 'border-2 border-[#16A34A] bg-[#F0FDF4]'
                  : error
                  ? 'border border-[#DC2626] bg-[#FEF2F2]'
                  : digit
                  ? 'bg-[#F8FAFC] border border-[#E2E8F0]'
                  : 'border-2 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
              } ${isLocked ? 'bg-[#F5F5F4] text-[#A8A29E]' : 'text-[#1C1917]'}`}
              data-testid={`merchant-otp-digit-${index + 1}-input`}
            />
          ))}
        </div>

        {isChecking && (
          <div className="flex items-center justify-center gap-2 mt-4 text-[13px] text-[#78716C]">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('checking')}
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center justify-center gap-2 mt-4 text-[13px] text-[#16A34A]">
            <CheckCircle2 className="w-4 h-4" />
            {t('success')}
          </div>
        )}

        {error && !isLocked && (
          <div className="text-[13px] text-[#DC2626] text-center mt-4">
            {t('error', { attempts })}
          </div>
        )}

        {isLocked && (
          <div className="text-[13px] text-[#DC2626] text-center mt-4 font-medium">
            {t('locked')}
          </div>
        )}

        {!isLocked && (
          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <div className="text-[13px] text-[#A8A29E]">
                {t('resendCountdown', { time: formatCountdown(countdown) })}
              </div>
            ) : (
              <button
                onClick={handleResend}
                className="text-[13px] underline"
                style={{ color: 'var(--color-primary)' }}
                data-testid="merchant-otp-resend-btn"
              >
                {t('resend')}
              </button>
            )}
          </div>
        )}

        <button className="text-[13px] text-[#78716C] text-center mt-4 w-full" data-testid="merchant-otp-wrong-number-btn">
          {t('wrongNumber')}
        </button>

        <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
          <p className="text-[13px] text-[#78716C] text-center">
            Mode MVP — tout code à 6 chiffres est accepté.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function OTPPage() {
  return (
    <Suspense>
      <OTPContent />
    </Suspense>
  );
}
