'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { DocumentUpload } from '../../_components/DocumentUpload';
import { StickyCTA } from '../../_components/StickyCTA';
import { uploadDriverDocumentAction, saveDocumentUrlAction } from '../actions';

export default function InsurancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    const result = await uploadDriverDocumentAction(fd, 'insurance');
    if ('error' in result) { setLoading(false); return; }
    await saveDocumentUrlAction('insurance_url', result.url, '/driver/onboarding/identity');
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] pb-24">
      <div className="w-full h-1 bg-gray-200">
        <div className="h-1 w-3/4" style={{ backgroundColor: 'var(--color-primary)' }} />
      </div>
      <p className="text-xs text-[#78716C] text-right pr-4 pt-1">Étape 3 sur 4</p>

      <div className="px-6 pt-6">
        <h1 className="text-[22px] font-bold text-[#1C1917]">Assurance véhicule</h1>
        <p className="text-sm text-[#78716C] mt-1">Photographiez votre attestation d&apos;assurance en cours de validité</p>

        <div className="mt-4 rounded-xl p-3 flex gap-2 items-start"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, white)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, white)' }}>
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <p className="text-[13px]" style={{ color: 'color-mix(in srgb, var(--color-primary) 80%, #1C1917)' }}>
            Vos documents sont chiffrés et sécurisés. Ils ne seront jamais partagés.
          </p>
        </div>

        <div className="mt-4">
          <DocumentUpload label="Attestation d'assurance" sublabel="Vérifiez que la date d'expiration est visible" value={file} onChange={setFile} testId="driver-onboarding-insurance-upload-input" />
        </div>
        <p className="text-xs text-[#78716C] mt-2">Votre assurance doit être en cours de validité</p>
      </div>

      <StickyCTA label="Continuer" disabled={!file} loading={loading} onClick={handleContinue} testId="driver-onboarding-insurance-continue-btn" />
    </main>
  );
}
