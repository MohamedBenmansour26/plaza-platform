'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type BaseProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  /** When set, dialog root gets `${testIdPrefix}-dialog`, textarea gets `${testIdPrefix}-reason-textarea`, buttons get `${testIdPrefix}-cancel-btn` / `${testIdPrefix}-confirm-btn`. */
  testIdPrefix?: string;
};

type NeutralProps = BaseProps & {
  variant: 'neutral' | 'confirm';
  onConfirm: () => void;
  requireReason?: false;
};

type DestructiveProps = BaseProps & {
  variant: 'destructive';
  /** When `requireReason` is true, `onConfirm` receives the reason text. */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  minReasonLength?: number;
  onConfirm: (reason?: string) => void;
};

export type ConfirmDialogProps = NeutralProps | DestructiveProps;

/**
 * ConfirmDialog — variant-aware modal.
 * - `neutral` / `confirm`: simple OK / Cancel.
 * - `destructive`: red primary action, optional mandatory reason textarea
 *   (`requireReason`), min length defaults to 10 chars.
 */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    onClose,
    title,
    body,
    cancelLabel = 'Annuler',
    confirmLabel,
    variant,
    testIdPrefix,
  } = props;

  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setReason('');
    setSubmitted(false);
    // Focus the Cancel button on open (destructive-dialog convention).
    const t = setTimeout(() => cancelRef.current?.focus(), 30);
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', escHandler);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', escHandler);
    };
  }, [open, onClose]);

  if (!open) return null;

  const minLen =
    variant === 'destructive' && 'minReasonLength' in props
      ? (props.minReasonLength ?? 10)
      : 10;
  const requireReason =
    variant === 'destructive' && 'requireReason' in props && !!props.requireReason;
  const reasonTooShort = requireReason && reason.trim().length < minLen;

  const handleConfirm = () => {
    setSubmitted(true);
    if (requireReason) {
      if (reasonTooShort) return;
      (props as DestructiveProps).onConfirm(reason.trim());
    } else {
      (props as NeutralProps).onConfirm();
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,25,23,0.5)] px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-testid={testIdPrefix ? `${testIdPrefix}-dialog` : undefined}
    >
      <div className="w-full max-w-[480px] rounded-[8px] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="confirm-dialog-title"
            className="text-[18px] font-semibold text-[#1C1917]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded p-1 text-[#78716C] hover:bg-[#F5F5F4]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {body ? (
          <div className="mt-2 text-[14px] leading-relaxed text-[#44403C]">
            {body}
          </div>
        ) : null}
        {requireReason ? (
          <div className="mt-5">
            <label
              htmlFor="confirm-reason"
              className="block text-[13px] font-semibold text-[#1C1917]"
            >
              {('reasonLabel' in props && props.reasonLabel) ||
                'Motif (obligatoire)'}{' '}
              <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              id="confirm-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                ('reasonPlaceholder' in props && props.reasonPlaceholder) ||
                'Explique pourquoi…'
              }
              aria-required="true"
              aria-invalid={submitted && reasonTooShort}
              className={cn(
                'mt-2 h-24 w-full rounded-[6px] border p-2.5 text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF]',
                submitted && reasonTooShort
                  ? 'border-[#DC2626]'
                  : 'border-[#E7E5E4] focus:border-[#2563EB]',
              )}
              data-testid={testIdPrefix ? `${testIdPrefix}-reason-textarea` : undefined}
            />
            <div className="mt-1 flex items-center justify-between text-[12px]">
              <span
                className={cn(
                  reasonTooShort && submitted
                    ? 'text-[#DC2626]'
                    : 'text-[#78716C]',
                )}
              >
                {reason.trim().length < minLen
                  ? `Au moins ${minLen} caractères (${reason.trim().length}/${minLen})`
                  : `${reason.trim().length} caractères`}
              </span>
            </div>
          </div>
        ) : null}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="h-10 rounded-[6px] border border-[#E7E5E4] bg-white px-4 text-[14px] font-medium text-[#1C1917] hover:bg-[#F5F5F4]"
            data-testid={testIdPrefix ? `${testIdPrefix}-cancel-btn` : undefined}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={requireReason && submitted && reasonTooShort}
            className={cn(
              'h-10 rounded-[6px] px-4 text-[14px] font-semibold text-white transition-colors',
              variant === 'destructive'
                ? 'bg-[#DC2626] hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:bg-[#F5F5F4] disabled:text-[#A8A29E]'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8]',
            )}
            data-testid={testIdPrefix ? `${testIdPrefix}-confirm-btn` : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
