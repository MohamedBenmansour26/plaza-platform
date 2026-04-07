'use client';

import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProduitsError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[produits] page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h2 className="text-lg font-semibold text-[#1C1917] mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-sm text-[#78716C] mb-6">
          Impossible de charger vos produits. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="h-10 px-6 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
