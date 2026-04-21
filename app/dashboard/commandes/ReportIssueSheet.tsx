'use client';

import { useTransition, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { createTicketAction } from '@/app/dashboard/support/actions';

type Props = {
  order: { id: string; order_number: string };
  onClose: () => void;
};

const MAX_DESC = 1000;

export function ReportIssueSheet({ order, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel pending close-timer if the component unmounts early
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const subject = `Problème commande ${order.order_number}`;

  const handleSubmit = () => {
    startTransition(async () => {
      await createTicketAction(
        { subject, category: 'order_issue', order_id: order.id },
        description,
      );
      setSubmitted(true);
      timerRef.current = setTimeout(() => {
        router.push('/dashboard/support');
        onClose();
      }, 1200);
    });
  };

  return (
    <>
      {/* Backdrop — above the parent OrderDetailSheet (z-50) */}
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed end-0 top-0 h-screen w-full max-w-[480px] bg-white shadow-xl z-[70] flex flex-col">

        {/* Header */}
        <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[#1C1917]">Signaler un problème</h2>
            <p className="text-xs text-[#78716C]">{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-2">Ticket créé</h3>
              <p className="text-sm text-[#78716C]">
                Votre signalement a été transmis à l&apos;équipe Plaza.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Pre-filled subject — read-only info */}
              <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                <p className="text-xs text-[#78716C] mb-0.5">Sujet</p>
                <p className="text-sm font-medium text-[#1C1917]">{subject}</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Description{' '}
                  <span className="text-[#A8A29E] font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder="Décrivez le problème rencontré avec cette commande…"
                  rows={6}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
                <div className="text-xs text-[#A8A29E] text-end mt-1">
                  {description.length}/{MAX_DESC}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="border-t border-[#E2E8F0] px-6 py-4 flex-shrink-0">
            <button
              disabled={isPending}
              onClick={handleSubmit}
              className="w-full h-11 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer le ticket
            </button>
          </div>
        )}
      </div>
    </>
  );
}
