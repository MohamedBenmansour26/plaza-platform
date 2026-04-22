'use client';
// PinBoxes — 4-digit PIN entry with box-per-digit UI.
// Used on: /driver/auth/pin, /driver/auth/pin-setup, /driver/livraisons/[id]/deliver

import { useRef } from 'react';

type State = 'default' | 'active' | 'valid' | 'error';

type Props = {
  value: string;           // current PIN string, up to 4 chars
  onChange: (val: string) => void;
  state?: State;
  disabled?: boolean;
  testIdPrefix?: string;   // if set, each box gets `${testIdPrefix}-digit-${i+1}-input`
};

export function PinBoxes({ value, onChange, state = 'default', disabled = false, testIdPrefix }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, raw: string) {
    if (disabled) return;
    const digit = raw.replace(/\D/g, '').slice(-1);
    const arr = (value + '    ').slice(0, 4).split('');
    arr[index] = digit;
    const newVal = arr.join('').trimEnd();
    onChange(newVal);
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const arr = (value + '    ').slice(0, 4).split('');
      arr[index - 1] = '';
      onChange(arr.join('').trimEnd());
    }
  }

  const boxClass = (index: number) => {
    const filled = !!value[index];
    const base = 'w-16 h-[72px] text-2xl font-bold text-center rounded-xl border-2 outline-none transition-all';
    if (state === 'valid') return `${base} border-green-500 bg-green-50 text-green-700`;
    if (state === 'error') return `${base} border-red-500 bg-red-50 text-red-600`;
    if (filled) return `${base} border-gray-300 bg-[#FAFAF9] text-[#1C1917]`;
    return `${base} border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_5%,white)]`;
  };

  return (
    <div className="flex gap-3 justify-center">
      {([0, 1, 2, 3] as const).map((i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ? '●' : ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={boxClass(i)}
          data-testid={testIdPrefix ? `${testIdPrefix}-digit-${i + 1}-input` : undefined}
        />
      ))}
    </div>
  );
}
