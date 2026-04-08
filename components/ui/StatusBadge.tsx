'use client';

import { useTranslations } from 'next-intl';
import type { OrderStatus } from '@/types/supabase';

const config: Record<OrderStatus, { bg: string; text: string }> = {
  pending:    { bg: '#F5F5F4', text: '#78716C' },
  confirmed:  { bg: '#EFF6FF', text: '#2563EB' },
  dispatched: { bg: '#FFF7ED', text: '#E8632A' },
  delivered:  { bg: '#F0FDF4', text: '#16A34A' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626' },
};

type Props = { status: OrderStatus };

export function StatusBadge({ status }: Props) {
  const t = useTranslations('orders.status');
  const { bg, text } = config[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: text }}
    >
      {t(status)}
    </span>
  );
}
