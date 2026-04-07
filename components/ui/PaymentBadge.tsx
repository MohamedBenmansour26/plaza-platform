import type { PaymentMethod } from '@/types/supabase';

const config: Record<PaymentMethod, { bg: string; text: string; label: string }> = {
  cod:           { bg: '#F5F5F4', text: '#78716C', label: 'COD' },
  card_terminal: { bg: '#EFF6FF', text: '#2563EB', label: 'Terminal' },
  card:          { bg: '#F5F3FF', text: '#7C3AED', label: 'Carte' },
};

type Props = { method: PaymentMethod };

export function PaymentBadge({ method }: Props) {
  const { bg, text, label } = config[method];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}
