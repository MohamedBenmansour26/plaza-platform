'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { DocumentUpload } from '../../_components/DocumentUpload';
import { StickyCTA } from '../../_components/StickyCTA';
import { uploadDriverDocumentAction, saveIdentityAndSubmitAction } from '../actions';

export default function IdentityPage() {
  const [front, setFront] = useState<File | null>(null);
  const [back,  setBack]  = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const bothReady = front !== null && back !== null;

  async function handleSubmit() {
    if (!front || !back) return;
    setLoading(true);

    const fd1 = new FormData(); fd1.append('file', front);
    const fd2 = new FormData(); fd2.append('file', back);

    const [r1, r2] = await Promise.all([
      uploadDriverDocumentAction(fd1, 'id_front'),
      uploadDriverDocumentAction(fd2, 'id_back'),
    ]);
    if ('error' in r1 || 'error' in r2) { setLoading(false); return; }

    await saveIdentityAndSubmitAction(r1.url, r2.url);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] pb-24">
      <div className="w-full h-1 bg-gray-200">
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-primary)' }} />
      </div>
      <p className="text-xs text-[#78716C] text-right pr-4 pt-1">Étape 4 sur 4</p>

      <div className="px-6 pt-6">
        <h1 className="text-[22px] font-bold text-[#1C1917]">Carte nationale d&apos;identité</h1>
        <p className="text-sm text-[#78716C] mt-1">Photographiez votre CINE recto et verso</p>

        <div className="mt-4 rounded-xl p-3 flex gap-2 items-start"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, white)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, white)' }}>
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <p className="text-[13px]" style={{ color: 'color-mix(in srgb, var(--color-primary) 80%, #1C1917)' }}>
            Vos documents sont chiffrés et sécurisés. Ils ne seront jamais partagés.
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1">
            <DocumentUpload label="Recto" value={front} onChange={setFront} height={140} testId="driver-onboarding-cine-front-upload-input" />
          </div>
          <div className="flex-1">
            <DocumentUpload label="Verso" value={back} onChange={setBack} height={140} testId="driver-onboarding-cine-back-upload-input" />
          </div>
        </div>
        <p className="text-xs text-[#78716C] mt-2">Assurez-vous que les 4 coins de la carte sont visibles</p>
      </div>

      <StickyCTA label="Soumettre mon dossier" disabled={!bothReady} loading={loading} onClick={handleSubmit} testId="driver-onboarding-identity-submit-btn" />
    </main>
  );
}
