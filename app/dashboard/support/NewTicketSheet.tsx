'use client';

import { useTransition, useState } from 'react';
import { X, Loader2, Paperclip } from 'lucide-react';
import { createTicketAction } from './actions';
import type { TicketCategory } from '@/lib/db/support';

type Props = {
  onClose: () => void;
  onCreated: (ticketId: string, ticketNumber: string) => void;
};

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'order_issue',    label: 'Problème de commande' },
  { value: 'payment_issue',  label: 'Problème de paiement' },
  { value: 'technical',      label: 'Bug / problème technique' },
  { value: 'other',          label: 'Autre' },
];

const MAX_DESC = 1000;

export function NewTicketSheet({ onClose, onCreated }: Props) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState<TicketCategory>('order_issue');
  const [subject, setSubject] = useState('');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim()) return;
    startTransition(async () => {
      const result = await createTicketAction(
        {
          subject: subject.trim(),
          category,
          order_id: orderId.trim() || undefined,
        },
        description,
      );
      setSubmitted(true);
      setTimeout(() => {
        onCreated(result.id, result.ticket_number);
        onClose();
      }, 1200);
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-[480px] bg-white shadow-xl z-50 flex flex-col">

        {/* Header */}
        <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-semibold text-[#1C1917]">Nouveau ticket</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-2">Ticket créé !</h3>
              <p className="text-sm text-[#78716C]">Notre équipe vous répond sous 24h.</p>
            </div>
          ) : (
            <>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Sujet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Commande #PLZ-042 non livrée"
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Order number (conditional) */}
              {category === 'order_issue' && (
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    N° commande concernée <span className="text-[#A8A29E] font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="PLZ-042"
                    className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder="Décrivez votre problème en détail..."
                  rows={5}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
                <div className="text-xs text-[#A8A29E] text-right mt-1">
                  {description.length}/{MAX_DESC}
                </div>
              </div>

              {/* File upload zone (UI only — storage not yet configured) */}
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Pièce jointe <span className="text-[#A8A29E] font-normal">(optionnel)</span>
                </label>
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-5 flex flex-col items-center gap-2 text-center">
                  <Paperclip className="w-6 h-6 text-[#A8A29E]" />
                  <p className="text-sm text-[#78716C]">
                    Glissez un fichier ou{' '}
                    <span className="text-[#2563EB] cursor-pointer hover:underline">parcourez</span>
                  </p>
                  <p className="text-xs text-[#A8A29E]">PNG, JPG, PDF — max 10 Mo</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="border-t border-[#E2E8F0] px-6 py-4 flex-shrink-0">
            <button
              disabled={isPending || !subject.trim()}
              onClick={handleSubmit}
              className="w-full h-11 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Envoyer le ticket
            </button>
          </div>
        )}
      </div>
    </>
  );
}
