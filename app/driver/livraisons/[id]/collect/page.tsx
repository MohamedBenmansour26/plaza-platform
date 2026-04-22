'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Store } from 'lucide-react';
import { OtpBoxes } from '../../../_components/OtpBoxes';
import { PhotoCapture } from '../../../_components/PhotoCapture';
import { StickyCTA } from '../../../_components/StickyCTA';
import { uploadDriverDocumentAction } from '../../../onboarding/actions';
import { confirmCollectionAction } from './actions';

function CollectContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [codeState, setCodeState] = useState<'default' | 'valid' | 'error'>('default');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(3);

  const canConfirm = codeState === 'valid' && photo !== null;

  async function handleCodeChange(val: string[]) {
    setCode(val);
    if (val.every(d => d !== '') && codeState !== 'valid') {
      setCodeState('valid');
    }
  }

  async function handleConfirm() {
    if (!canConfirm || !photo) return;
    setLoading(true);

    const fd = new FormData();
    fd.append('file', photo);
    const uploadResult = await uploadDriverDocumentAction(fd, 'collection_photo');
    if ('error' in uploadResult) { setLoading(false); return; }

    const result = await confirmCollectionAction(id, code.join(''), uploadResult.url);
    if (result && 'invalidCode' in result) {
      setCodeState('error');
      setAttempts(a => a - 1);
      setTimeout(() => { setCode(['', '', '', '', '', '']); setCodeState('default'); }, 1000);
      setLoading(false);
      return;
    }
    if (result?.error) { setLoading(false); return; }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-6 h-6 text-[#1C1917]" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-[#1C1917]">Confirmation de collecte</h1>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div>
          <p className="text-sm font-bold text-[#1C1917]">Étape 1 — Code marchand</p>
          <p className="text-xs text-[#78716C] mt-0.5">Demandez le code au commerçant</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-[#E8632A]" />
            <span className="text-sm font-semibold text-[#1C1917]">Code de collecte</span>
          </div>
          <p className="text-[13px] text-[#78716C] mb-4">Saisissez le code à 6 chiffres</p>
          <OtpBoxes value={code} onChange={handleCodeChange} state={codeState} testIdPrefix="driver-delivery-merchant-code" />
          {codeState === 'valid' && (
            <p className="text-[13px] text-green-600 text-center mt-3">✓ Code validé</p>
          )}
          {codeState === 'error' && (
            <p className="text-[13px] text-red-600 text-center mt-3">Code incorrect — {attempts > 0 ? `réessayez (${attempts} tentative${attempts > 1 ? 's' : ''} restante${attempts > 1 ? 's' : ''})` : 'contactez le support'}</p>
          )}
          <p className="text-xs italic text-[#78716C] text-center mt-3">Le commerçant trouve ce code dans son tableau de bord</p>
        </div>

        <div>
          <p className="text-sm font-bold text-[#1C1917]">Étape 2 — Photo du colis</p>
          <p className="text-xs text-[#78716C] mt-0.5">Photographiez le colis avant de partir</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <PhotoCapture value={photo} onChange={setPhoto} height={160} testId="driver-delivery-collect-photo-input" />
        </div>
      </div>

      <StickyCTA label="Confirmer la collecte" disabled={!canConfirm} loading={loading} onClick={handleConfirm} testId="driver-delivery-collect-submit-btn" />
    </div>
  );
}

export default function CollectPage() {
  return <Suspense><CollectContent /></Suspense>;
}
