'use client';

import { useState } from 'react';
import { StatusChip } from '../StatusChip';
import { StatCard } from '../StatCard';
import { DataTable, type DataTableColumn } from '../DataTable';
import { FilterBar } from '../FilterBar';
import { ConfirmDialog } from '../ConfirmDialog';
import { DocumentViewer } from '../DocumentViewer';
import { DesktopRequired } from '../DesktopRequired';

type DemoRow = {
  id: string;
  name: string;
  city: string;
  vehicle: string;
  submitted: string;
};

const SAMPLE_ROWS: DemoRow[] = [
  { id: 'r1', name: 'Hassan Benjelloun', city: 'Casablanca', vehicle: 'Moto', submitted: 'Il y a 2h' },
  { id: 'r2', name: 'Fatima El Amrani', city: 'Rabat', vehicle: 'Moto', submitted: 'Il y a 5h' },
  { id: 'r3', name: 'Youssef Mansouri', city: 'Casablanca', vehicle: 'Voiture', submitted: 'Hier' },
];

const SAMPLE_COLUMNS: DataTableColumn<DemoRow>[] = [
  { key: 'name', label: 'Livreur', render: (row) => row.name },
  { key: 'city', label: 'Ville', width: '140px', render: (row) => row.city },
  { key: 'vehicle', label: 'Véhicule', width: '120px', render: (row) => row.vehicle },
  { key: 'submitted', label: 'Soumis', width: '120px', render: (row) => row.submitted },
];

const SAMPLE_DOCS = [
  {
    id: 'd1',
    name: 'Permis de conduire',
    url: 'https://placehold.co/800x500/1C1917/FFFFFF?text=Permis',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    name: 'Assurance',
    url: 'https://placehold.co/800x500/1C1917/FFFFFF?text=Assurance',
    uploadedAt: new Date().toISOString(),
  },
];

export function DemoClient() {
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState<
    null | 'neutral' | 'destructive' | 'destructive-reason'
  >(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-8 py-10">
      <div className="mx-auto max-w-[1120px]">
        <h1 className="text-[28px] font-bold text-[#1C1917]">
          Admin components demo
        </h1>
        <p className="mt-1 text-[14px] text-[#78716C]">
          Dev-only preview of every P0 component. <code>NODE_ENV</code>-gated.
        </p>

        <Section title="StatusChip">
          <div className="flex flex-wrap gap-3">
            <StatusChip variant="pending">En attente</StatusChip>
            <StatusChip variant="approved">Approuvé</StatusChip>
            <StatusChip variant="rejected">Rejeté</StatusChip>
            <StatusChip variant="resubmit">Resoumission</StatusChip>
            <StatusChip variant="suspended">Suspendu</StatusChip>
            <StatusChip variant="neutral">Neutre</StatusChip>
            <StatusChip variant="info">En cours</StatusChip>
          </div>
        </Section>

        <Section title="StatCard">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Dossiers en attente" value="12" />
            <StatCard
              label="Revenus du jour"
              value="1 284 MAD"
              delta={{ value: '+12%', direction: 'up' }}
            />
            <StatCard
              label="Taux de complétion"
              value="92%"
              delta={{ value: '-2%', direction: 'down' }}
            />
          </div>
        </Section>

        <Section title="FilterBar">
          <FilterBar
            search={{
              value: search,
              onChange: setSearch,
              placeholder: 'Rechercher un livreur…',
            }}
            chips={[
              { key: 'all', label: 'Tous', active: true },
              { key: 'active', label: 'Actifs' },
              { key: 'archived', label: 'Archivés' },
            ]}
            rightSlot={
              <button
                type="button"
                className="h-9 rounded-[6px] border border-[#E7E5E4] bg-white px-3 text-[13px] font-medium text-[#1C1917] hover:bg-[#F5F5F4]"
              >
                Exporter
              </button>
            }
          />
        </Section>

        <Section title="DataTable — loaded">
          <DataTable
            columns={SAMPLE_COLUMNS}
            rows={SAMPLE_ROWS}
            onRowClick={() => undefined}
            ariaLabel="Exemple"
          />
        </Section>

        <Section title="DataTable — loading">
          <DataTable
            columns={SAMPLE_COLUMNS}
            rows={[]}
            loading
            skeletonRows={4}
            ariaLabel="Exemple en chargement"
          />
        </Section>

        <Section title="DataTable — empty">
          <DataTable
            columns={SAMPLE_COLUMNS}
            rows={[]}
            emptyState={
              <div className="py-12 text-center text-[13px] text-[#78716C]">
                Aucun résultat à afficher.
              </div>
            }
            ariaLabel="Exemple vide"
          />
        </Section>

        <Section title="ConfirmDialog">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen('neutral')}
              className="h-9 rounded-[6px] border border-[#E7E5E4] bg-white px-3 text-[13px] font-medium text-[#1C1917] hover:bg-[#F5F5F4]"
            >
              Neutral
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen('destructive')}
              className="h-9 rounded-[6px] border border-[#DC2626] bg-white px-3 text-[13px] font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              Destructive
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen('destructive-reason')}
              className="h-9 rounded-[6px] border border-[#DC2626] bg-white px-3 text-[13px] font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              Destructive + reason
            </button>
          </div>
          <ConfirmDialog
            open={confirmOpen === 'neutral'}
            onClose={() => setConfirmOpen(null)}
            variant="neutral"
            title="Confirmer l'action ?"
            body="Cette action est réversible."
            confirmLabel="Confirmer"
            onConfirm={() => setConfirmOpen(null)}
          />
          <ConfirmDialog
            open={confirmOpen === 'destructive'}
            onClose={() => setConfirmOpen(null)}
            variant="destructive"
            title="Supprimer l'élément ?"
            body="Cette action est irréversible."
            confirmLabel="Supprimer"
            onConfirm={() => setConfirmOpen(null)}
          />
          <ConfirmDialog
            open={confirmOpen === 'destructive-reason'}
            onClose={() => setConfirmOpen(null)}
            variant="destructive"
            requireReason
            minReasonLength={10}
            title="Rejeter le dossier ?"
            body="Le livreur sera notifié et ne pourra pas utiliser l'app."
            reasonLabel="Motif du rejet (obligatoire)"
            reasonPlaceholder="Ex: Documents non conformes…"
            confirmLabel="Confirmer le rejet"
            onConfirm={() => setConfirmOpen(null)}
          />
        </Section>

        <Section title="DocumentViewer">
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            className="h-9 rounded-[6px] bg-[#2563EB] px-3 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Ouvrir le visionneur
          </button>
          <DocumentViewer
            open={viewerOpen}
            onClose={() => setViewerOpen(false)}
            docs={SAMPLE_DOCS}
          />
        </Section>

        <Section title="DesktopRequired">
          <div className="rounded-[8px] border border-dashed border-[#D6D3D1] p-4">
            <p className="mb-4 text-[12px] text-[#78716C]">
              Preview (always visible here — normally driven by a @media
              query below 1024px).
            </p>
            <div className="admin-scope">
              {/*
                Force-show the DesktopRequired card regardless of viewport
                width by overriding its default `hidden` visibility with
                an inline style.
              */}
              <div style={{ display: 'flex' }}>
                <DesktopRequired />
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-[15px] font-semibold uppercase tracking-wider text-[#78716C]">
        {title}
      </h2>
      <div className="rounded-[8px] border border-[#E7E5E4] bg-white p-6">
        {children}
      </div>
    </section>
  );
}
