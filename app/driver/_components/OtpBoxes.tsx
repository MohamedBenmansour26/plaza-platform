'use client';
// OtpBoxes — 6-digit OTP entry. Used on: /driver/auth/otp
// Also used for 6-digit merchant collection code on /driver/livraisons/[id]/collect

import { useRef } from 'react';

type State = 'default' | 'valid' | 'error';

type Props = {
  value: string[];          // array of 6 digit strings
  onChange: (val: string[]) => void;
  state?: State;
  disabled?: boolean;
};

export function OtpBoxes({ value, onChange, state = 'default', disabled = false }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, raw: string) {
    if (disabled) return;
    const digits = raw.replace(/\D/g, '');
    if (digits.length > 1) {
      // Paste support
      const filled = digits.slice(0, 6).split('');
      const next = [...value];
      filled.forEach((d, i) => { if (i < 6) next[i] = d; });
      onChange(next);
      inputRefs.current[Math.min(filled.length - 1, 5)]?.focus();
      return;
    }
    const next = [...value];
    next[index] = digits.slice(-1);
    onChange(next);
    if (digits && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...value];
      next[index - 1] = '';
      onChange(next);
    }
  }

  const boxClass = (index: number) => {
    const filled = !!value[index];
    const base = 'w-12 h-14 text-xl font-bold text-center rounded-xl border-2 outline-none transition-all';
    if (state === 'valid') return `${base} border-green-500 bg-green-50 text-green-700`;
    if (state === 'error') return `${base} border-red-500 bg-red-50 text-red-600`;
    if (filled) return `${base} border-gray-300 bg-[#FAFAF9] text-[#1C1917]`;
    return `${base} border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_5%,white)]`;
  };

  return (
    <div className="flex gap-2 justify-center">
      {([0, 1, 2, 3, 4, 5] as const).map((i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={value[i] ?? ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => {
            e.preventDefault();
            handleChange(i, e.clipboardData.getData('text'));
          }}
          className={boxClass(i)}
        />
      ))}
    </div>
  );
}
