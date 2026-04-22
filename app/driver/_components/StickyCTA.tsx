// StickyCTA — fixed bottom CTA bar with a single primary button.

import { Loader2 } from 'lucide-react';

type Props = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'danger';
  testId?: string;
};

export function StickyCTA({ label, onClick, disabled, loading, variant = 'primary', testId }: Props) {
  const bg = disabled
    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
    : variant === 'danger'
    ? 'bg-[#DC2626] text-white active:brightness-90'
    : 'text-white active:brightness-90';

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 p-4 z-30">
      <button
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        className={`w-full h-[52px] rounded-xl text-base font-bold flex items-center justify-center transition-all ${bg}`}
        style={!disabled && variant === 'primary' ? { backgroundColor: 'var(--color-primary)' } : {}}
        data-testid={testId}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
      </button>
    </div>
  );
}
