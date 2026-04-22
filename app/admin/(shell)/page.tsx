import Link from 'next/link';

/**
 * Admin home — P0 placeholder. Real content (stat cards, queue snapshots)
 * ships in P1 once metrics are available.
 */
export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-8 pt-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1C1917]">Accueil</h1>
        <p className="mt-1 text-[13px] text-[#78716C]">
          Vue d&apos;ensemble de la plateforme. Les indicateurs arriveront en
          Phase 1.
        </p>
      </div>
      <div className="rounded-[8px] border border-dashed border-[#D6D3D1] bg-white p-12 text-center">
        <p className="text-[14px] text-[#78716C]">
          P0 — cette page est un placeholder. Accède à la{' '}
          <Link
            href="/admin/drivers/pending"
            className="font-medium text-[#2563EB] hover:underline"
            data-testid="admin-home-drivers-pending-link"
          >
            file d&apos;attente des livreurs
          </Link>{' '}
          pour commencer les approbations.
        </p>
      </div>
    </div>
  );
}
