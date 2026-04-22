'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Key, Delete } from 'lucide-react';
import { PinBoxes } from '../../_components/PinBoxes';
import { verifyDriverPinAction } from './actions';

const NUMPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function PinLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') ?? '';
  const name  = params.get('name') ?? 'Livreur';

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState(false);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pin.length === 4 && !submitting) {
      setSubmitting(true);
      verifyDriverPinAction(phone, pin).then(res => {
        if ('error' in res) {
          const left = attempts - 1;
          setAttempts(left);
          setError(true);
          setPin('');
          setSubmitting(false);
          if (left === 0) setLocked(true);
          setTimeout(() => setError(false), 3000);
          return;
        }
        router.push(res.redirect);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function press(n: string) {
    if (!locked && !submitting && pin.length < 4) setPin(p => p + n);
  }

  function del() {
    if (!locked && !submitting) setPin(p => p.slice(0, -1));
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center px-6 pt-12">
      <div className="text-[28px] font-bold" style={{ color: 'var(--color-primary)' }}>Plaza</div>

      {/* Driver card */}
      <div className="mt-6 bg-white rounded-2xl p-4 flex flex-col items-center w-full shadow-sm">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, white)', color: 'var(--color-primary)' }}>
          {name[0]?.toUpperCase() ?? 'L'}
        </div>
        <div className="text-[17px] font-semibold text-[#1C1917] mt-2">{name}</div>
        <div className="text-[13px] text-[#78716C]">{phone}</div>
      </div>

      <div className="mt-6 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, white)' }}>
        <Key className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
      </div>
      <h1 className="text-[18px] font-semibold text-[#1C1917] mt-3">Saisissez votre code PIN</h1>

      <div className="mt-6">
        <PinBoxes value={pin} onChange={setPin} state={error ? 'error' : locked ? 'error' : 'default'} disabled={locked || submitting} testIdPrefix="driver-auth-pin" />
      </div>

      {error && !locked && (
        <p className="text-[13px] text-red-600 mt-3">Code incorrect — {attempts} tentative{attempts > 1 ? 's' : ''} restante{attempts > 1 ? 's' : ''}</p>
      )}
      {locked && (
        <p className="text-[13px] text-red-600 mt-3 font-medium">Compte bloqué — contactez le support</p>
      )}

      <div className="grid grid-cols-3 gap-3 mt-8 w-[280px]">
        {NUMPAD.map(n => (
          <button key={n} onClick={() => press(String(n))} disabled={locked || submitting}
            className="h-16 rounded-2xl bg-white border border-gray-200 text-xl font-medium text-[#1C1917] hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50">
            {n}
          </button>
        ))}
        <div />
        <button onClick={() => press('0')} disabled={locked || submitting}
          className="h-16 rounded-2xl bg-white border border-gray-200 text-xl font-medium text-[#1C1917] hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50">
          0
        </button>
        <button onClick={del} disabled={locked || submitting}
          className="h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
          aria-label="Effacer">
          <Delete className="w-5 h-5 text-[#1C1917]" />
        </button>
      </div>
    </main>
  );
}

export default function DriverPinPage() {
  return <Suspense><PinLoginContent /></Suspense>;
}
