'use client';

import { useTransition, useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createTicketAction } from '@/app/dashboard/support/actions';

type Props = {
  order: { id: string; order_number: string };
  onClose: () => void;
};

const MAX_DESC = 1000;

export function ReportIssueSheet({ order, onClose }: Props) {
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
        onClose();
        window.location.assign('/dashboard/support');
      }, 1200);
    });
  };

  return (
    <>
      {/* Backdrop — above the parent OrderDetailSheet (z-50) */}
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onClose} />

      {/* Sheet */}
      <div
        className="fixed end-0 top-0 h-screen w-full max-w-[480px] bg-card shadow-xl z-[70] flex flex-col"
        data-testid="merchant-order-report-issue-sheet"
      >

        {/* Header */}
        <div className="h-16 border-b border-border px-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Signaler un problème</h2>
            <p className="text-xs text-muted-foreground">{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ticket créé</h3>
              <p className="text-sm text-muted-foreground">
                Votre signalement a été transmis à l&apos;équipe Plaza.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Pre-filled subject — read-only info */}
              <div className="bg-muted/40 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">Sujet</p>
                <p className="text-sm font-medium text-foreground">{subject}</p>
              </div>

              {/* Description — brief §2.2 input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description{' '}
                  <span className="text-muted-foreground font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder="Décrivez le problème rencontré avec cette commande…"
                  rows={6}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                  data-testid="merchant-order-report-issue-description-textarea"
                />
                <div className="text-xs text-muted-foreground text-end mt-1">
                  {description.length}/{MAX_DESC}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — mobile primary keeps inline `var(--color-primary)` per PLZ-088 */}
        {!submitted && (
          <div className="border-t border-border px-6 py-4 flex-shrink-0">
            <button
              disabled={isPending || submitted}
              onClick={handleSubmit}
              className="w-full h-11 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
              data-testid="merchant-order-report-issue-submit-btn"
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
