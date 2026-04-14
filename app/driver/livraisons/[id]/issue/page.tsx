'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, PackageX, MapPin, Package, Banknote, MoreHorizontal } from 'lucide-react';
import { PhotoCapture } from '../../../_components/PhotoCapture';
import { StickyCTA } from '../../../_components/StickyCTA';
import { uploadDriverDocumentAction } from '../../../onboarding/actions';
import { reportIssueAction } from './actions';
import type { IssueType } from '@/lib/db/driver';

const ISSUE_CHIPS: { type: IssueType; label: string; sub: string; Icon: React.ElementType }[] = [
  { type: 'client_absent',   label: 'Client absent',          sub: "Personne à l'adresse",      Icon: AlertCircle   },
  { type: 'client_refuse',   label: 'Client refuse',          sub: 'Refuse le colis',             Icon: PackageX      },
  { type: 'wrong_address',   label: 'Adresse incorrecte',     sub: 'Impossible à trouver',        Icon: MapPin        },
  { type: 'damaged',         label: 'Colis endommagé',        sub: 'Pendant le transport',        Icon: Package       },
  { type: 'payment_issue',   label: 'Problème de paiement',   sub: 'Montant ou refus',            Icon: Banknote      },
  { type: 'other',           label: 'Autre problème',         sub: 'Décrire ci-dessous',          Icon: MoreHorizontal },
];

function IssueContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [selected, setSelected] = useState<IssueType | null>(null);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);

    let photoPath: string | null = null;
    if (photo) {
      const fd = new FormData();
      fd.append('file', photo);
      const r = await uploadDriverDocumentAction(fd, 'issue_photo');
      if (!('error' in r)) photoPath = r.url;
    }

    const result = await reportIssueAction(id, selected, notes, photoPath);
    if (result?.error) { setLoading(false); return; }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-6 h-6 text-[#1C1917]" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-[#1C1917]">Signaler un problème</h1>
        </div>
      </header>

      <div className="px-4 pt-4">
        <p className="text-[15px] font-bold text-[#1C1917] mb-4">Quel est le problème ?</p>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {ISSUE_CHIPS.map(({ type, label, sub, Icon }) => {
            const active = selected === type;
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className="flex flex-col items-center p-3.5 rounded-2xl border-2 text-center transition-all"
                style={{
                  borderColor: active ? 'var(--color-primary)' : '#E2E8F0',
                  background: active ? 'color-mix(in srgb, var(--color-primary) 5%, white)' : 'white',
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={active ? { backgroundColor: 'var(--color-primary)' } : { backgroundColor: '#F5F5F4' }}>
                  <Icon className="w-5 h-5" style={{ color: active ? 'white' : '#78716C' }} />
                </div>
                <span className="text-[13px] font-semibold text-[#1C1917]">{label}</span>
                <span className="text-[11px] text-[#78716C] mt-0.5">{sub}</span>
              </button>
            );
          })}
        </div>

        {selected === 'other' && (
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Décrivez le problème..."
            rows={4}
            className="w-full border border-gray-300 rounded-xl p-3 text-sm text-[#1C1917] outline-none resize-none mb-4"
          />
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-[#1C1917]">Ajouter une photo</p>
            <span className="text-xs text-[#78716C]">facultatif</span>
          </div>
          <PhotoCapture value={photo} onChange={setPhoto} height={120} />
        </div>
      </div>

      <StickyCTA
        label="Envoyer le rapport"
        variant="danger"
        disabled={!selected}
        loading={loading}
        onClick={handleSubmit}
      />
    </div>
  );
}

export default function IssuePage() {
  return <Suspense><IssueContent /></Suspense>;
}
