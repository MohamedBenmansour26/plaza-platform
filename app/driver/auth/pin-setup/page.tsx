'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Key, Delete, Loader2 } from 'lucide-react';
import { PinBoxes } from '../../_components/PinBoxes';
import { completeDriverPinSetupAction } from './actions';

const NUMPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function PinSetupContent() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';

  const [step, setStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Synchronous step mirror — `press()` reads this to route to pin vs confirm
  // without waiting for React to flush the `step` state. Without it, rapid
  // successive clicks (including programmatic `.click()`) that arrive during
  // the 300 ms pin→confirm transition or within the same React batch silently
  // drop, because the closure still sees step === 1 && pin.length === 4.
  const stepRef = useRef<1 | 2>(1);

  useEffect(() => {
    if (pin.length === 4 && step === 1) {
      const t = setTimeout(() => setStep(2), 300);
      return () => clearTimeout(t);
    }
  }, [pin, step]);

  useEffect(() => { stepRef.current = step; }, [step]);

  useEffect(() => {
    if (confirm.length === 4) {
      if (confirm === pin) {
        setLoading(true);
        completeDriverPinSetupAction({ phone, pin }).then(res => {
          if ('error' in res) {
            setLoading(false);
            setError(true);
            setConfirm('');
            return;
          }
          router.push(res.redirect);
        });
      } else {
        setError(true);
        setTimeout(() => { setError(false); setConfirm(''); }, 1500);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm]);

  const current = step === 1 ? pin : confirm;

  function press(n: string) {
    if (loading) return;
    // Route via stepRef so rapid clicks see the latest routing target.
    // Functional updaters guarantee we always append to the latest buffer
    // and never exceed 4 digits even if multiple clicks land in one React batch.
    if (stepRef.current === 1) {
      setPin(prev => {
        if (prev.length >= 4) return prev;
        const next = prev + n;
        // Flip routing synchronously the moment pin fills, so the next
        // click in the same event-loop tick routes to confirm, not a
        // dropped-on-the-floor pin append.
        if (next.length === 4) stepRef.current = 2;
        return next;
      });
    } else {
      setConfirm(prev => (prev.length < 4 ? prev + n : prev));
    }
  }

  function del() {
    if (loading) return;
    if (stepRef.current === 1) setPin(p => p.slice(0, -1));
    else setConfirm(c => c.slice(0, -1));
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center px-6 pt-12">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, white)' }}>
        <Key className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
      </div>
      <h1 className="text-[18px] font-semibold text-[#1C1917] mt-4">
        {step === 1 ? 'Créez votre code PIN' : 'Confirmez votre code PIN'}
      </h1>
      <p className="text-[13px] text-[#78716C] mt-1 text-center">
        Ce code sécurise l&apos;accès à votre espace livreur
      </p>

      <div className={`mt-8 ${error ? 'animate-bounce' : ''}`}>
        <PinBoxes
          value={current}
          onChange={step === 1 ? setPin : setConfirm}
          state={error ? 'error' : 'default'}
          disabled={loading}
          testIdPrefix={step === 1 ? 'driver-pin-setup-create' : 'driver-pin-setup-confirm'}
        />
      </div>

      {error && <p className="text-[13px] text-red-600 mt-3">Les codes ne correspondent pas</p>}
      {loading && <Loader2 className="w-5 h-5 mt-3 animate-spin" style={{ color: 'var(--color-primary)' }} />}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 mt-8 w-[280px]">
        {NUMPAD.map(n => (
          <button key={n} onClick={() => press(String(n))} disabled={loading}
            data-testid={`driver-pin-setup-keypad-${n}-btn`}
            className="h-16 rounded-2xl bg-white border border-gray-200 text-xl font-medium text-[#1C1917] hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50">
            {n}
          </button>
        ))}
        <div />
        <button onClick={() => press('0')} disabled={loading}
          data-testid="driver-pin-setup-keypad-0-btn"
          className="h-16 rounded-2xl bg-white border border-gray-200 text-xl font-medium text-[#1C1917] hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50">
          0
        </button>
        <button onClick={del} disabled={loading}
          data-testid="driver-pin-setup-keypad-backspace-btn"
          className="h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
          aria-label="Effacer">
          <Delete className="w-5 h-5 text-[#1C1917]" />
        </button>
      </div>
    </main>
  );
}

export default function DriverPinSetupPage() {
  return <Suspense><PinSetupContent /></Suspense>;
}
