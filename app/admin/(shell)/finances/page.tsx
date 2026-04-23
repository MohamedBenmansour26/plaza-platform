import { ArrowDownRight, ArrowUpRight, FileText } from 'lucide-react';

import { StatusChip } from '../../_components/StatusChip';

/**
 * Admin — Finances (P0 placeholder).
 *
 * Renders the refreshed visual shell (KPI strip + sub-nav tabs + subscriptions
 * table) per design-refresh brief §2.3/§2.4 with admin density and
 * primary-only accent (§3.2). All data is mock — no server actions, no
 * queries. Real wiring ships in a later phase.
 */
export default function AdminFinancesPage() {
  const kpis = [
    { label: 'MRR total', value: '22 150 MAD', delta: { value: '+4,2%', direction: 'up' as const } },
    { label: 'ARR projeté', value: '265 800 MAD', delta: null },
    { label: 'Commissions livraison MTD', value: '5 100 MAD', delta: { value: '+8,1%', direction: 'up' as const } },
    { label: 'Marge nette MTD', value: '18 250 MAD', delta: { value: '-1,4%', direction: 'down' as const } },
  ];

  const tabs = [
    { key: 'overview', label: "Vue d'ensemble", active: true },
    { key: 'subscriptions', label: 'Abonnements' },
    { key: 'commissions', label: 'Commissions livraison' },
    { key: 'expenses', label: 'Dépenses' },
    { key: 'payouts', label: 'Virements livreurs' },
  ];

  const subscriptions = [
    {
      id: 's1',
      store: 'Épicerie Al Baraka',
      plan: 'Pro',
      amount: '699 MAD',
      date: '1 mars 2026',
      status: 'Payé',
      statusTone: 'approved' as const,
    },
    {
      id: 's2',
      store: 'Tajine & Co',
      plan: 'Starter',
      amount: '299 MAD',
      date: '5 mars 2026',
      status: 'Payé',
      statusTone: 'approved' as const,
    },
    {
      id: 's3',
      store: 'Boulangerie Nour',
      plan: 'Starter',
      amount: '299 MAD',
      date: '10 mars 2026',
      status: 'En retard',
      statusTone: 'rejected' as const,
    },
    {
      id: 's4',
      store: 'Café des Oudayas',
      plan: 'Pro',
      amount: '699 MAD',
      date: '12 mars 2026',
      status: 'Payé',
      statusTone: 'approved' as const,
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-8 pt-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1C1917]">Finances</h1>
        <p className="mt-1 text-[13px] text-[#78716C]">
          Revenus, abonnements et virements livreurs. Indicateurs de
          démonstration — les chiffres réels seront connectés en Phase 1.
        </p>
      </div>

      {/* KPI row — admin, no coloured icons (brief §3.2) */}
      <div
        className="mb-6 grid gap-4"
        style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
        data-testid="admin-finances-kpi-grid"
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[8px] border border-[#E7E5E4] bg-white p-5"
          >
            <div className="text-[13px] text-[#78716C]">{kpi.label}</div>
            <div className="mt-1 text-[28px] font-semibold leading-tight text-[#1C1917] tabular-nums">
              {kpi.value}
            </div>
            {kpi.delta ? (
              <div
                className={
                  kpi.delta.direction === 'up'
                    ? 'mt-1 flex items-center gap-1 text-[12px] font-medium text-[#15803D] tabular-nums'
                    : 'mt-1 flex items-center gap-1 text-[12px] font-medium text-[#B91C1C] tabular-nums'
                }
              >
                {kpi.delta.direction === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {kpi.delta.value}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Sub-nav tabs — primary accent only */}
      <div
        className="mb-4 flex gap-1 border-b border-[#E7E5E4]"
        data-testid="admin-finances-tabs"
      >
        {tabs.map((tab) => (
          <span
            key={tab.key}
            className={
              tab.active
                ? 'border-b-2 border-[var(--admin-color-primary)] px-4 py-3 text-[13px] font-medium text-[var(--admin-color-primary)]'
                : 'border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-[#78716C]'
            }
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* Subscriptions table — py-3 admin density */}
      <div
        className="overflow-hidden rounded-[8px] border border-[#E7E5E4] bg-white"
        role="region"
        aria-label="Abonnements récents"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr
              className="h-10 border-b border-[#E7E5E4]"
              style={{ backgroundColor: 'var(--admin-color-row-hover)' }}
            >
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Boutique
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Plan
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Montant
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Date facturation
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Statut
              </th>
              <th className="px-4 text-right text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Facture
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#F5F5F4] py-3 last:border-b-0 hover:bg-[var(--admin-color-row-hover)]"
                data-testid="admin-finances-subscription-row"
                data-id={row.id}
              >
                <td className="px-4 py-3 text-[14px] font-medium text-[var(--admin-color-primary)]">
                  {row.store}
                </td>
                <td className="px-4 py-3 text-[14px] text-[#1C1917]">
                  <span className="inline-flex items-center rounded-full bg-[var(--admin-color-primary-tint)] px-[10px] py-[2px] text-[12px] font-medium leading-[18px] text-[var(--admin-color-primary)]">
                    {row.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-[14px] font-medium text-[#1C1917] tabular-nums">
                  {row.amount}
                </td>
                <td className="px-4 py-3 text-[14px] text-[#78716C]">
                  {row.date}
                </td>
                <td className="px-4 py-3">
                  <StatusChip variant={row.statusTone}>{row.status}</StatusChip>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-[13px] text-[#78716C]">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    PDF
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[12px] text-[#78716C]">
        Phase 0 — données d&apos;illustration. Les montants réels seront
        synchronisés depuis Stripe en Phase 1.
      </p>
    </div>
  );
}
