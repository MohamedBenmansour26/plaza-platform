import type { OrderStatus } from '@/types/supabase';

const config: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending:    { bg: '#F5F5F4', text: '#78716C', label: 'En attente' },
  confirmed:  { bg: '#EFF6FF', text: '#2563EB', label: 'Confirmée' },
  dispatched: { bg: '#FFF7ED', text: '#E8632A', label: 'Expédiée' },
  delivered:  { bg: '#F0FDF4', text: '#16A34A', label: 'Livrée' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626', label: 'Annulée' },
};

type Props = { status: OrderStatus };

export function StatusBadge({ status }: Props) {
  const { bg, text, label } = config[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}
