'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  ArrowLeft,
  Bike,
  Car,
  ChevronLeft,
  CreditCard,
  FileText,
  MoreHorizontal,
  MoreVertical,
  Shield,
  Truck,
} from 'lucide-react';
import { ConfirmDialog } from '../../../_components/ConfirmDialog';
import {
  DocumentViewer,
  type ViewerDoc,
} from '../../../_components/DocumentViewer';
import { StatusChip, type StatusChipVariant } from '../../../_components/StatusChip';
import {
  approveDriver,
  approveDriverWithOverride,
  rejectDriver,
  requestDocResubmit,
  rejectSingleDoc,
  type DocumentKey,
} from './actions';
import type { DriverDetail } from './page';
import { MOROCCO_TZ } from '@/lib/timezone';

type DocStatus = 'pending' | 'approved' | 'rejected' | 'resubmit';

const DOC_META: Array<{
  key: DocumentKey;
  label: string;
  icon: typeof FileText;
}> = [
  { key: 'license', label: 'Permis de conduire', icon: FileText },
  { key: 'insurance', label: 'Assurance véhicule', icon: Shield },
  { key: 'id_front', label: 'CIN — Recto', icon: CreditCard },
  { key: 'id_back', label: 'CIN — Verso', icon: CreditCard },
];

const VEHICLE_ICONS = { moto: Bike, velo: Bike, voiture: Car, autre: Truck };
const VEHICLE_LABELS = {
  moto: 'Moto',
  velo: 'Vélo',
  voiture: 'Voiture',
  autre: 'Autre',
};

const STATUS_TO_CHIP: Record<DocStatus, { variant: StatusChipVariant; label: string }> =
  {
    pending: { variant: 'pending', label: 'À vérifier' },
    approved: { variant: 'approved', label: 'Conforme' },
    rejected: { variant: 'rejected', label: 'Rejeté' },
    resubmit: { variant: 'resubmit', label: 'Resoumission' },
  };

type DialogState =
  | { kind: 'closed' }
  | { kind: 'approve-override' }
  | { kind: 'reject-driver' }
  | { kind: 'reject-doc'; doc: DocumentKey }
  | { kind: 'resubmit-doc'; doc: DocumentKey };

export function DriverDetailClient({ driver }: { driver: DriverDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Local optimistic per-doc statuses — will sync with server after Youssef
  // wires real actions.
  const [docStatuses, setDocStatuses] = useState<Record<DocumentKey, DocStatus>>({
    license: driver.docs.license.status,
    insurance: driver.docs.insurance.status,
    id_front: driver.docs.id_front.status,
    id_back: driver.docs.id_back.status,
  });

  const docs = DOC_META.map(({ key, label, icon }) => ({
    key,
    label,
    icon,
    url: driver.docs[key].url,
    status: docStatuses[key],
    uploadedAt: driver.docs[key].uploadedAt,
  }));

  const hasMixedState = useMemo(
    () => Object.values(docStatuses).some((s) => s === 'resubmit' || s === 'rejected'),
    [docStatuses],
  );

  const viewerDocs: ViewerDoc[] = docs.map((d) => ({
    id: d.key,
    name: d.label,
    url: d.url,
    uploadedAt: d.uploadedAt,
  }));

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprovePrimary = () => {
    if (hasMixedState) {
      setDialog({ kind: 'approve-override' });
      return;
    }
    startTransition(async () => {
      const res = await approveDriver(driver.id);
      if ('error' in res) {
        showToast('Erreur lors de l&apos;approbation. Réessaye.');
        return;
      }
      showToast(`Dossier de ${driver.fullName} approuvé.`);
      setTimeout(() => router.push('/admin/drivers/pending'), 600);
    });
  };

  const handleApproveOverride = () => {
    startTransition(async () => {
      const res = await approveDriverWithOverride(driver.id);
      setDialog({ kind: 'closed' });
      if ('error' in res) {
        showToast('Erreur lors de l&apos;approbation. Réessaye.');
        return;
      }
      setDocStatuses({
        license: 'approved',
        insurance: 'approved',
        id_front: 'approved',
        id_back: 'approved',
      });
      showToast(`Dossier de ${driver.fullName} approuvé (remplacement forcé).`);
      setTimeout(() => router.push('/admin/drivers/pending'), 600);
    });
  };

  const handleRejectDriver = (reason?: string) => {
    if (!reason) return;
    startTransition(async () => {
      const res = await rejectDriver(driver.id, reason);
      setDialog({ kind: 'closed' });
      if ('error' in res) {
        showToast('Impossible de rejeter. Réessaye.');
        return;
      }
      showToast(`Dossier de ${driver.fullName} rejeté.`);
      setTimeout(() => router.push('/admin/drivers/pending'), 600);
    });
  };

  const handleRequestResubmit = (doc: DocumentKey, reason?: string) => {
    if (!reason) return;
    startTransition(async () => {
      const res = await requestDocResubmit(driver.id, doc, reason);
      setDialog({ kind: 'closed' });
      if ('error' in res) {
        showToast('Action impossible. Réessaye.');
        return;
      }
      setDocStatuses((prev) => ({ ...prev, [doc]: 'resubmit' }));
      showToast('Demande de resoumission envoyée.');
    });
  };

  const handleRejectDoc = (doc: DocumentKey, reason?: string) => {
    if (!reason) return;
    startTransition(async () => {
      const res = await rejectSingleDoc(driver.id, doc, reason);
      setDialog({ kind: 'closed' });
      if ('error' in res) {
        showToast('Action impossible. Réessaye.');
        return;
      }
      setDocStatuses((prev) => ({ ...prev, [doc]: 'rejected' }));
      showToast('Document rejeté.');
    });
  };

  const formattedSubmittedAt = new Date(driver.submittedAt).toLocaleDateString(
    'fr-FR',
    { day: '2-digit', month: 'short', year: 'numeric', timeZone: MOROCCO_TZ },
  );

  const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];

  return (
    <>
      {/* Desktop detail */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1280px] px-8 pb-16 pt-6">
          <div className="mb-4 flex items-center gap-2 text-[13px] text-[#78716C]">
            <button
              type="button"
              onClick={() => router.push('/admin/drivers/pending')}
              className="flex items-center gap-1 hover:text-[#1C1917]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Livreurs
            </button>
            <span>/</span>
            <span className="text-[#1C1917]">En attente</span>
            <span>/</span>
            <span className="text-[#1C1917]">{driver.fullName}</span>
          </div>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-semibold text-[#1C1917]">
                  {driver.fullName}
                </h1>
                <StatusChip variant="pending">En attente</StatusChip>
              </div>
              <p className="mt-1 text-[13px] text-[#78716C]">
                Soumis le {formattedSubmittedAt} · {driver.phone}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_400px] gap-6">
            {/* Left: info + docs grid */}
            <div className="flex flex-col gap-4">
              <div className="rounded-[8px] border border-[#E7E5E4] bg-white p-5">
                <h2 className="text-[15px] font-semibold text-[#1C1917]">
                  Informations livreur
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3">
                  <InfoRow label="Email" value={driver.email} />
                  <InfoRow label="Téléphone" value={driver.phone} />
                  <InfoRow label="Ville" value={driver.city} />
                  <InfoRow
                    label="Véhicule"
                    value={
                      <span className="flex items-center gap-1.5">
                        <VehicleIcon className="h-3.5 w-3.5 text-[#78716C]" />
                        {VEHICLE_LABELS[driver.vehicleType]}
                      </span>
                    }
                  />
                  <InfoRow label="Inscription" value={formattedSubmittedAt} />
                </dl>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {docs.map((doc, index) => {
                  const Icon = doc.icon;
                  const chip = STATUS_TO_CHIP[doc.status];
                  return (
                    <DocCard
                      key={doc.key}
                      title={doc.label}
                      icon={Icon}
                      imageUrl={doc.url}
                      chip={chip}
                      onOpen={() => {
                        setViewerIndex(index);
                        setViewerOpen(true);
                      }}
                      onRequestResubmit={() =>
                        setDialog({ kind: 'resubmit-doc', doc: doc.key })
                      }
                      onReject={() =>
                        setDialog({ kind: 'reject-doc', doc: doc.key })
                      }
                    />
                  );
                })}
              </div>
            </div>
            {/* Right: action card */}
            <div>
              <div className="sticky top-20 rounded-[8px] border border-[#E7E5E4] bg-white p-5">
                <button
                  type="button"
                  onClick={handleApprovePrimary}
                  disabled={pending}
                  className="h-11 w-full rounded-[6px] bg-[var(--admin-color-primary)] text-[14px] font-semibold text-white hover:bg-[var(--admin-color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="admin-driver-dossier-approve-btn"
                >
                  Approuver le dossier
                </button>
                <p className="mt-2 text-center text-[12px] text-[#78716C]">
                  En un clic, les 4 documents seront validés.
                </p>
                <button
                  type="button"
                  onClick={() => setDialog({ kind: 'reject-driver' })}
                  className="mt-3 h-11 w-full rounded-[6px] border border-[#DC2626] bg-white text-[14px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
                  data-testid="admin-driver-dossier-reject-btn"
                >
                  Rejeter le dossier
                </button>
                <button
                  type="button"
                  className="mt-3 w-full text-center text-[13px] text-[#78716C] hover:text-[#1C1917]"
                >
                  Voir l&apos;historique complet →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile M2 */}
      <div className="block lg:hidden">
        <MobileDetail
          driver={driver}
          docs={docs}
          onOpenViewer={(i) => {
            setViewerIndex(i);
            setViewerOpen(true);
          }}
          onApprovePrimary={handleApprovePrimary}
          onOpenReject={() => setDialog({ kind: 'reject-driver' })}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMenu={() => setMobileMenuOpen((v) => !v)}
        />
      </div>

      {/* Viewer */}
      <DocumentViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        docs={viewerDocs}
        initialIndex={viewerIndex}
      />

      {/* Approve override */}
      <ConfirmDialog
        open={dialog.kind === 'approve-override'}
        onClose={() => setDialog({ kind: 'closed' })}
        variant="confirm"
        title="Approuver malgré un document marqué à resoumettre ?"
        body={
          <>
            Tu es sur le point d&apos;approuver ce dossier alors qu&apos;au
            moins un document est marqué comme à resoumettre ou rejeté.
            L&apos;approbation va passer tous les documents en conforme.
            Continuer ?
          </>
        }
        cancelLabel="Annuler"
        confirmLabel="Confirmer l'approbation"
        onConfirm={handleApproveOverride}
        testIdPrefix="admin-driver-dossier-approve-override"
      />

      {/* Reject driver */}
      <ConfirmDialog
        open={dialog.kind === 'reject-driver'}
        onClose={() => setDialog({ kind: 'closed' })}
        variant="destructive"
        requireReason
        minReasonLength={10}
        title={`Rejeter le dossier de ${driver.fullName} ?`}
        body="Le livreur sera notifié et ne pourra pas utiliser l'application. Cette action est irréversible."
        reasonLabel="Motif du rejet (obligatoire)"
        reasonPlaceholder="Ex: Documents non conformes, identité non vérifiable…"
        cancelLabel="Annuler"
        confirmLabel="Confirmer le rejet"
        onConfirm={handleRejectDriver}
        testIdPrefix="admin-driver-dossier-reject"
      />

      {/* Resubmit single doc */}
      <ConfirmDialog
        open={dialog.kind === 'resubmit-doc'}
        onClose={() => setDialog({ kind: 'closed' })}
        variant="destructive"
        requireReason
        minReasonLength={10}
        title="Demander une nouvelle soumission"
        body="Le livreur recevra une notification et devra re-téléverser ce document."
        reasonLabel="Motif (obligatoire)"
        reasonPlaceholder="Ex: Photo floue, texte illisible, document expiré…"
        cancelLabel="Annuler"
        confirmLabel="Envoyer la demande"
        onConfirm={(reason) => {
          if (dialog.kind === 'resubmit-doc') {
            handleRequestResubmit(dialog.doc, reason);
          }
        }}
        testIdPrefix="admin-driver-dossier-resubmit-doc"
      />

      {/* Reject single doc */}
      <ConfirmDialog
        open={dialog.kind === 'reject-doc'}
        onClose={() => setDialog({ kind: 'closed' })}
        variant="destructive"
        requireReason
        minReasonLength={10}
        title="Rejeter ce document"
        body="Le document sera marqué comme rejeté. Tu peux ensuite ajuster le statut global du dossier."
        reasonLabel="Motif du rejet (obligatoire)"
        reasonPlaceholder="Ex: Document falsifié, ne correspond pas…"
        cancelLabel="Annuler"
        confirmLabel="Rejeter le document"
        onConfirm={(reason) => {
          if (dialog.kind === 'reject-doc') {
            handleRejectDoc(dialog.doc, reason);
          }
        }}
        testIdPrefix="admin-driver-dossier-reject-doc"
      />

      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[8px] bg-[#1C1917] px-4 py-3 text-[13px] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[12px] text-[#78716C]">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-[#1C1917]">{value}</dd>
    </div>
  );
}

function DocCard({
  title,
  icon: Icon,
  imageUrl,
  chip,
  onOpen,
  onRequestResubmit,
  onReject,
}: {
  title: string;
  icon: typeof FileText;
  imageUrl: string;
  chip: { variant: StatusChipVariant; label: string };
  onOpen: () => void;
  onRequestResubmit: () => void;
  onReject: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#E7E5E4] bg-white">
      <button
        type="button"
        onClick={onOpen}
        className="group relative block h-40 w-full bg-[#1C1917]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
        />
      </button>
      <div className="flex items-center gap-2 border-t border-[#E7E5E4] px-4 py-3">
        <Icon className="h-4 w-4 text-[#78716C]" />
        <span className="flex-1 truncate text-[13px] font-medium text-[#1C1917]">
          {title}
        </span>
        <StatusChip variant={chip.variant}>{chip.label}</StatusChip>
        <div className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            aria-label="Actions"
            className="rounded p-1 text-[#78716C] hover:bg-[#F5F5F4]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-8 z-10 w-[260px] rounded-[6px] border border-[#E7E5E4] bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onRequestResubmit();
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-[13px] text-[#1C1917] hover:bg-[#F5F5F4]"
              >
                Demander une nouvelle soumission
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onReject();
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-[13px] text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                Rejeter ce document
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MobileDetail({
  driver,
  docs,
  onOpenViewer,
  onApprovePrimary,
  onOpenReject,
  mobileMenuOpen,
  onToggleMenu,
}: {
  driver: DriverDetail;
  docs: {
    key: DocumentKey;
    label: string;
    icon: typeof FileText;
    url: string;
    status: DocStatus;
    uploadedAt: string;
  }[];
  onOpenViewer: (index: number) => void;
  onApprovePrimary: () => void;
  onOpenReject: () => void;
  mobileMenuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const router = useRouter();
  const VehicleIcon = VEHICLE_ICONS[driver.vehicleType];
  const formattedSubmittedAt = new Date(driver.submittedAt).toLocaleDateString(
    'fr-FR',
    { day: '2-digit', month: 'short', year: 'numeric', timeZone: MOROCCO_TZ },
  );

  return (
    <div
      className="min-h-screen pb-[120px]"
      style={{ backgroundColor: 'var(--admin-color-bg)' }}
    >
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#E7E5E4] bg-white px-2">
        <button
          type="button"
          onClick={() => router.push('/admin/drivers/pending')}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1C1917] hover:bg-[#F5F5F4]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 truncate px-2 text-center text-[16px] font-semibold text-[#1C1917]">
          {driver.fullName}
        </h1>
        <div className="relative">
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label="Plus d'actions"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#1C1917] hover:bg-[#F5F5F4]"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {mobileMenuOpen ? (
            <div className="absolute right-2 top-12 z-20 w-[240px] rounded-[6px] border border-[#E7E5E4] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={() => {
                  onOpenReject();
                  onToggleMenu();
                }}
                className="block w-full px-4 py-3 text-left text-[14px] text-[#DC2626] hover:bg-[#FEF2F2]"
                data-testid="admin-driver-dossier-reject-mobile-btn"
              >
                Rejeter le dossier
              </button>
              <button
                type="button"
                className="block w-full px-4 py-3 text-left text-[14px] text-[#1C1917] hover:bg-[#F5F5F4]"
              >
                Voir l&apos;historique complet
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-[12px] border border-[#E7E5E4] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-color-primary-tint)] text-[13px] font-semibold text-[var(--admin-color-primary)]">
              {driver.fullName
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? '')
                .join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[16px] font-semibold text-[#1C1917]">
                {driver.fullName}
              </div>
              <div className="truncate text-[13px] text-[#78716C]">
                {driver.phone}
              </div>
            </div>
            <StatusChip variant="pending">En attente</StatusChip>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#F5F5F4] pt-4 text-[13px]">
            <div>
              <div className="text-[12px] text-[#78716C]">Véhicule</div>
              <div className="mt-0.5 flex items-center gap-1 text-[#1C1917]">
                <VehicleIcon className="h-3.5 w-3.5 text-[#78716C]" />
                {VEHICLE_LABELS[driver.vehicleType]}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-[#78716C]">Ville</div>
              <div className="mt-0.5 text-[#1C1917]">{driver.city}</div>
            </div>
            <div>
              <div className="text-[12px] text-[#78716C]">Inscription</div>
              <div className="mt-0.5 text-[#1C1917]">
                {formattedSubmittedAt}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] text-[#78716C]">Email</div>
              <div className="mt-0.5 truncate text-[#1C1917]">
                {driver.email}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {docs.map((doc, index) => {
            const Icon = doc.icon;
            const chip = STATUS_TO_CHIP[doc.status];
            return (
              <button
                key={doc.key}
                type="button"
                onClick={() => onOpenViewer(index)}
                className="overflow-hidden rounded-[12px] border border-[#E7E5E4] bg-white text-left"
              >
                <div className="h-32 w-full bg-[#1C1917]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.url}
                    alt={doc.label}
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  <Icon className="h-3.5 w-3.5 text-[#78716C]" />
                  <div className="flex-1 truncate text-[12px] font-medium text-[#1C1917]">
                    {doc.label}
                  </div>
                </div>
                <div className="border-t border-[#F5F5F4] px-3 pb-3">
                  <StatusChip variant={chip.variant}>{chip.label}</StatusChip>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E7E5E4] bg-white px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4">
        <button
          type="button"
          onClick={onApprovePrimary}
          className="h-12 w-full rounded-[6px] bg-[var(--admin-color-primary)] text-[15px] font-semibold text-white hover:bg-[var(--admin-color-primary-dark)]"
          data-testid="admin-driver-dossier-approve-mobile-btn"
        >
          Approuver le dossier
        </button>
      </div>
    </div>
  );
}
