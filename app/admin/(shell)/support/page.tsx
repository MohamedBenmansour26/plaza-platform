import { MessageCircle, Search } from 'lucide-react';

import { StatusChip, type StatusChipVariant } from '../../_components/StatusChip';

/**
 * Admin — Support (P0 placeholder).
 *
 * Renders the refreshed ticket list shell per brief §2.4/§2.8: ticket rows
 * with status chips, admin density, primary-accent only. Static mock data,
 * no server actions, no reply composer. Real messaging wires up in a later
 * phase.
 */
export default function AdminSupportPage() {
  const tabs = [
    { key: 'all', label: 'Tous', count: 12, active: true },
    { key: 'open', label: 'Ouverts', count: 5 },
    { key: 'in_progress', label: 'En cours', count: 4 },
    { key: 'resolved', label: 'Résolus', count: 3 },
  ];

  const tickets: Array<{
    id: string;
    requester: string;
    requesterType: string;
    subject: string;
    category: string;
    priority: string;
    priorityTone: StatusChipVariant;
    status: string;
    statusTone: StatusChipVariant;
    ago: string;
  }> = [
    {
      id: 't1',
      requester: 'Ahmed Bennani',
      requesterType: 'Boutique',
      subject: 'Problème de paiement en ligne',
      category: 'Facturation',
      priority: 'Urgent',
      priorityTone: 'rejected',
      status: 'Ouvert',
      statusTone: 'pending',
      ago: 'Il y a 2h',
    },
    {
      id: 't2',
      requester: 'Sara El Amrani',
      requesterType: 'Boutique',
      subject: 'Comment ajouter plus de produits ?',
      category: 'Technique',
      priority: 'Normal',
      priorityTone: 'neutral',
      status: 'En cours',
      statusTone: 'info',
      ago: 'Il y a 4h',
    },
    {
      id: 't3',
      requester: 'Karim Bennani',
      requesterType: 'Livreur',
      subject: 'Demande de changement de zone',
      category: 'Livreurs',
      priority: 'Normal',
      priorityTone: 'neutral',
      status: 'Ouvert',
      statusTone: 'pending',
      ago: 'Il y a 6h',
    },
    {
      id: 't4',
      requester: 'Leila Idrissi',
      requesterType: 'Boutique',
      subject: 'Erreur lors du téléchargement du logo',
      category: 'Technique',
      priority: 'Bas',
      priorityTone: 'neutral',
      status: 'Résolu',
      statusTone: 'approved',
      ago: 'Hier',
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-8 pt-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1C1917]">Support</h1>
          <p className="mt-1 text-[13px] text-[#78716C]">
            Tickets marchands et livreurs. Démonstration visuelle — le flux de
            réponse sera branché en Phase 1.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="mb-4 flex gap-1 border-b border-[#E7E5E4]"
        data-testid="admin-support-tabs"
      >
        {tabs.map((tab) => (
          <span
            key={tab.key}
            className={
              tab.active
                ? 'inline-flex items-center gap-2 border-b-2 border-[var(--admin-color-primary)] px-4 py-3 text-[13px] font-medium text-[var(--admin-color-primary)]'
                : 'inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-[#78716C]'
            }
          >
            {tab.label}
            <span
              className={
                tab.active
                  ? 'inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full bg-[var(--admin-color-primary-tint)] px-1.5 text-[11px] font-semibold text-[var(--admin-color-primary)]'
                  : 'inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full bg-[#F5F5F4] px-1.5 text-[11px] font-semibold text-[#78716C]'
              }
            >
              {tab.count}
            </span>
          </span>
        ))}
      </div>

      {/* Search-row */}
      <div className="mb-4 flex items-center gap-3 rounded-[8px] border border-[#E7E5E4] bg-white p-3">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Rechercher un ticket…"
            aria-label="Rechercher un ticket"
            disabled
            className="h-10 w-full rounded-[8px] border border-[#E7E5E4] bg-[#FAFAF9] pl-9 pr-3 text-[14px] text-[#1C1917] placeholder:text-[#A8A29E]"
          />
        </div>
      </div>

      {/* Ticket table */}
      <div
        className="overflow-hidden rounded-[8px] border border-[#E7E5E4] bg-white"
        role="region"
        aria-label="Tickets support"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr
              className="h-10 border-b border-[#E7E5E4]"
              style={{ backgroundColor: 'var(--admin-color-row-hover)' }}
            >
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Demandeur
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Sujet
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Catégorie
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Priorité
              </th>
              <th className="px-4 text-left text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Statut
              </th>
              <th className="px-4 text-right text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
                Soumis
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#F5F5F4] last:border-b-0 hover:bg-[var(--admin-color-row-hover)]"
                data-testid="admin-support-ticket-row"
                data-id={row.id}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--admin-color-primary-tint)] text-[11px] font-semibold text-[var(--admin-color-primary)]">
                      {row.requester
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase() ?? '')
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[14px] text-[#1C1917]">
                        {row.requester}
                      </div>
                      <div className="truncate text-[12px] text-[#78716C]">
                        {row.requesterType}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[14px] text-[#1C1917]">
                  {row.subject}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#44403C]">
                  {row.category}
                </td>
                <td className="px-4 py-3">
                  <StatusChip variant={row.priorityTone}>{row.priority}</StatusChip>
                </td>
                <td className="px-4 py-3">
                  <StatusChip variant={row.statusTone}>{row.status}</StatusChip>
                </td>
                <td className="px-4 py-3 text-right text-[13px] text-[#78716C]">
                  {row.ago}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-[8px] border border-dashed border-[#D6D3D1] bg-white p-4">
        <MessageCircle className="h-4 w-4 text-[#78716C]" aria-hidden />
        <p className="text-[13px] text-[#78716C]">
          Phase 0 — données d&apos;illustration. Le fil de conversation et les
          réponses seront activés en Phase 1.
        </p>
      </div>
    </div>
  );
}
