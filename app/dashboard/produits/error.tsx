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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Impossible de charger vos produits. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="h-10 px-6 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
