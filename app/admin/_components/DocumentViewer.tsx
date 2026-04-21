'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Minus,
  Plus,
  RotateCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOROCCO_TZ } from '@/lib/timezone';

export type ViewerDoc = {
  id: string;
  name: string;
  url: string; // signed URL
  uploadedAt?: string; // ISO date
};

type Props = {
  open: boolean;
  onClose: () => void;
  docs: ViewerDoc[];
  initialIndex?: number;
  onDownload?: (doc: ViewerDoc) => void;
};

/**
 * DocumentViewer — fullscreen modal image viewer with:
 * - Zoom (+/- buttons, `+`/`-` keys, mouse wheel)
 * - Rotate
 * - `←` / `→` to cycle through docs
 * - Download button
 * - Caption: filename + uploaded-at
 */
export function DocumentViewer({
  open,
  onClose,
  docs,
  initialIndex = 0,
  onDownload,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setZoom(1);
      setRotate(0);
    }
  }, [open, initialIndex]);

  const prev = useCallback(() => {
    setZoom(1);
    setRotate(0);
    setIndex((i) => (i <= 0 ? docs.length - 1 : i - 1));
  }, [docs.length]);

  const next = useCallback(() => {
    setZoom(1);
    setRotate(0);
    setIndex((i) => (i + 1) % docs.length);
  }, [docs.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft') prev();
      else if (event.key === 'ArrowRight') next();
      else if (event.key === '+' || event.key === '=')
        setZoom((z) => Math.min(z + 0.25, 4));
      else if (event.key === '-' || event.key === '_')
        setZoom((z) => Math.max(z - 0.25, 0.5));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, prev, next]);

  if (!open || docs.length === 0) return null;
  const doc = docs[index];
  if (!doc) return null;

  const formattedDate = doc.uploadedAt
    ? new Date(doc.uploadedAt).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: MOROCCO_TZ,
      })
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Document: ${doc.name}`}
      className="fixed inset-0 z-50 flex flex-col bg-[rgba(28,25,23,0.9)]"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-white">
        <div>
          <div className="text-[14px] font-semibold">{doc.name}</div>
          {formattedDate ? (
            <div className="text-[12px] text-white/60">
              Téléversé le {formattedDate}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            aria-label="Zoom arrière"
            className="rounded-[6px] bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[48px] text-center text-[12px] tabular-nums text-white/80">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
            aria-label="Zoom avant"
            className="rounded-[6px] bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setRotate((r) => (r + 90) % 360)}
            aria-label="Pivoter"
            className="rounded-[6px] bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          {onDownload ? (
            <button
              type="button"
              onClick={() => onDownload(doc)}
              aria-label="Télécharger"
              className="rounded-[6px] bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le visionneur"
            className="rounded-[6px] bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Image area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {docs.length > 1 ? (
          <button
            type="button"
            onClick={prev}
            aria-label="Document précédent"
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : null}
        {/* Using <img> rather than next/image because docs are signed URLs
            with dynamic hostnames we can't pre-register in next.config.mjs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={doc.url}
          alt={doc.name}
          className={cn('max-h-[80vh] max-w-[90vw] object-contain transition-transform')}
          style={{
            transform: `scale(${zoom}) rotate(${rotate}deg)`,
          }}
        />
        {docs.length > 1 ? (
          <button
            type="button"
            onClick={next}
            aria-label="Document suivant"
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        ) : null}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 text-[12px] text-white/70">
        <span>
          {index + 1} / {docs.length}
        </span>
        <span>← → pour naviguer · + − pour zoomer · Échap pour fermer</span>
      </div>
    </div>
  );
}
