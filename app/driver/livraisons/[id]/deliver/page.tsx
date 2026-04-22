'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Banknote, User } from 'lucide-react';
import { PinBoxes } from '../../../_components/PinBoxes';
import { PhotoCapture } from '../../../_components/PhotoCapture';
import { StickyCTA } from '../../../_components/StickyCTA';
import { uploadDriverDocumentAction } from '../../../onboarding/actions';
import { confirmDeliveryAction } from './actions';
import type { DriverDelivery } from '@/lib/db/driver';

function DeliverContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [delivery, setDelivery] = useState<DriverDelivery | null>(null);
  const [pin, setPin] = useState('');
  const [pinState, setPinState] = useState<'default' | 'valid' | 'error'>('default');
  const [codChecked, setCodChecked] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(3);

  useEffect(() => {
    fetch(`/api/driver/deliveries/${id}`)
      .then(r => r.json())
      .then((d: DriverDelivery) => setDelivery(d))
      .catch(() => {});
  }, [id]);

  const isCOD = delivery?.order.payment_method === 'cod';
  const codReady = isCOD ? codChecked : true;
  const pinReady = pinState === 'valid';
  const photoReady = photo !== null;
  const canConfirm = pinReady && photoReady && codReady;

  useEffect(() => {
    if (pin.length === 4 && pinState === 'default') {
      setPinState('valid');
    }
  }, [pin, pinState]);

  async function handleConfirm() {
    if (!canConfirm || !photo || !delivery) return;
    setLoading(true);

    const fd = new FormData();
    fd.append('file', photo);
    const uploadResult = await uploadDriverDocumentAction(fd, 'delivery_photo');
    if ('error' in uploadResult) { setLoading(false); return; }

    const result = await confirmDeliveryAction(id, pin, uploadResult.url, codChecked);
    if (result && 'invalidPin' in result) {
      setPinState('error');
      setPinAttempts(a => a - 1);
      setTimeout(() => { setPin(''); setPinState('default'); }, 1000);
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
          <h1 className="text-[18px] font-bold text-[#1C1917]">Confirmation de livraison</h1>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {isCOD && delivery && (
          <div className="bg-white rounded-2xl border-2 border-[#E8632A] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="w-5 h-5 text-[#E8632A]" />
              <span className="text-sm font-bold text-[#1C1917]">Paiement à collecter</span>
            </div>
            <p className="text-[28px] font-bold text-[#E8632A]">{(delivery.order.total / 100).toFixed(2)} MAD</p>
            <label className="flex items-start gap-3 mt-3 cursor-pointer">
              <div
                onClick={() => setCodChecked(c => !c)}
                className="w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5"
                style={{
                  borderColor: '#E8632A',
                  backgroundColor: codChecked ? '#E8632A' : 'white',
                }}
                data-testid="driver-delivery-confirm-cod-checkbox"
              >
                {codChecked && <span className="text-white text-sm font-bold">✓</span>}
              </div>
              <span className="text-sm text-[#1C1917]">
                Je confirme avoir reçu <strong>{(delivery.order.total / 100).toFixed(2)} MAD</strong> en espèces
              </span>
            </label>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-semibold text-[#1C1917]">Code de livraison</span>
          </div>
          <p className="text-[13px] text-[#78716C] mb-4">
            {delivery?.order.customer
              ? `Demandez le code à ${delivery.order.customer.full_name}`
              : 'Demandez le code à 4 chiffres au client'}
          </p>
          <PinBoxes value={pin} onChange={setPin} state={pinState === 'error' ? 'error' : pinState === 'valid' ? 'valid' : 'default'} testIdPrefix="driver-delivery-customer-pin" />
          {pinState === 'error' && (
            <p className="text-[13px] text-red-600 text-center mt-3">
              Code incorrect — {pinAttempts > 0 ? `${pinAttempts} tentative${pinAttempts > 1 ? 's' : ''} restante${pinAttempts > 1 ? 's' : ''}` : 'contactez le support'}
            </p>
          )}
          <p className="text-xs italic text-[#78716C] text-center mt-3">Le client trouve ce code dans son SMS de confirmation</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-bold text-[#1C1917] mb-1">Photo de livraison</p>
          <p className="text-xs text-red-600 mb-3">Obligatoire — colis remis au client</p>
          <PhotoCapture value={photo} onChange={setPhoto} height={160} testId="driver-delivery-deliver-photo-input" />
        </div>

        <button
          onClick={() => router.push(`/driver/livraisons/${id}/issue`)}
          className="w-full h-11 rounded-xl border border-red-200 text-red-600 text-sm"
          data-testid="driver-delivery-report-issue-btn">
          Signaler un problème →
        </button>
      </div>

      <StickyCTA label="Confirmer la livraison" disabled={!canConfirm} loading={loading} onClick={handleConfirm} testId="driver-delivery-deliver-submit-btn" />
    </div>
  );
}

export default function DeliverPage() {
  return <Suspense><DeliverContent /></Suspense>;
}
