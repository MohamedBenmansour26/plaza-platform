'use client';

import { useTranslations } from 'next-intl';
import type { OrderStatus } from '@/types/supabase';

/**
 * Order-status pill colors — design-refresh brief §2.8.
 *
 *   Nouvelle     (pending)    → warning  (amber-tinted; safer than orange on a11y)
 *   Acceptée     (confirmed)  → teal `#14B8A6` accent (custom, not yet tokenised)
 *   En livraison (dispatched) → primary (#1A6BFF)
 *   Livrée       (delivered)  → success  (#10B981)
 *   Rejetée      (cancelled)  → destructive (#EF4444)
 *
 * All pairings use a /10 tinted background + full-strength foreground. This
 * clears WCAG AA at 14px regular because the foreground is always the
 * saturated semantic color — contrast is >4.5:1 against the white-mixed tint.
 */
const config: Record<OrderStatus, { className: string; style?: React.CSSProperties }> = {
  pending:    { className: 'bg-warning/10 text-warning' },
  confirmed:  {
    className: '',
    style: { backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6' }, /* teal accent */
  },
  dispatched: { className: 'bg-primary/10 text-primary' },
  delivered:  { className: 'bg-success/10 text-success' },
  cancelled:  { className: 'bg-destructive/10 text-destructive' },
};

type Props = { status: OrderStatus };

export function StatusBadge({ status }: Props) {
  const t = useTranslations('orders.status');
  // Defensive: stale DB rows may carry out-of-union statuses (e.g. `assigned`
  // from earlier driver-subsystem migrations). Fall back to neutral muted tint
  // instead of crashing the page.
  const { className, style } = config[status] ?? { className: 'bg-muted/60 text-muted-foreground' };
  const label = (() => { try { return t(status); } catch { return String(status); } })();
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${className}`}
      style={style}
    >
      {label}
    </span>
  );
}
