'use client';
// OfflineBanner — amber banner shown when driver is offline.

type Props = { onGoOnline: () => void };

export function OfflineBanner({ onGoOnline }: Props) {
  return (
    <div className="w-full bg-[#FEF3C7] px-4 py-3 flex items-center gap-3">
      <p className="flex-1 text-[13px] text-[#92400E]">
        Vous êtes hors ligne — aucune commande ne vous sera assignée
      </p>
      <button
        onClick={onGoOnline}
        className="text-[13px] font-semibold flex-shrink-0"
        style={{ color: 'var(--color-primary)' }}
      >
        Aller en ligne
      </button>
    </div>
  );
}
