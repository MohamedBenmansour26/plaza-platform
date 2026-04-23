'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { getSlugByOrderNumber } from '@/app/_actions/trackOrder';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim().toUpperCase();
    if (!trimmed) {
      setError(true);
      setErrorMessage('Veuillez entrer un numéro de commande.');
      return;
    }
    if (!/^PLZ-\d{3,}$/i.test(trimmed)) {
      setError(true);
      setErrorMessage('Format invalide. Exemple : PLZ-1042');
      return;
    }
    setError(false);
    setLoading(true);

    try {
      const result = await getSlugByOrderNumber(trimmed);
      if (!result) {
        setError(true);
        setErrorMessage('Commande introuvable. Vérifiez le numéro et réessayez.');
        setLoading(false);
        return;
      }
      router.push(`/store/${result.slug}/commande/${result.orderId}`);
    } catch {
      setError(true);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <div className="bg-white border-b border-[#E2E8F0] h-14 flex items-center justify-center px-4">
        <div className="w-20 h-8">
          <svg viewBox="0 0 80 32" className="w-full h-full">
            <rect x="0" y="0" width="32" height="32" rx="6" fill="var(--color-primary)" />
            <text x="16" y="22" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
              P
            </text>
            <text x="40" y="22" fill="#1C1917" fontSize="16" fontWeight="600">
              LAZA
            </text>
          </svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)' }}>
              <Package className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 className="font-bold text-[28px]">Suivre ma commande</h1>
            <p className="text-[15px] text-[#78716C]">
              Entrez votre numéro de commande pour suivre son état en temps réel
            </p>
          </div>

          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Numéro de commande
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value.toUpperCase());
                    setError(false);
                  }}
                  placeholder="PLZ-1042"
                  className={`storefront-input w-full h-14 pl-4 pr-12 text-[17px] font-medium tracking-wide border-2 rounded-lg transition-colors ${
                    error
                      ? 'border-[#DC2626] bg-red-50'
                      : 'border-[#E2E8F0] bg-white'
                  }`}
                  data-testid="customer-track-order-number-input"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-[#DC2626] mt-2"
                >
                  {errorMessage}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-white rounded-lg font-medium text-[16px] transition-all hover:brightness-[0.92] active:scale-[0.98] disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
              data-testid="customer-track-submit-btn"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recherche...
                </>
              ) : (
                'Suivre ma commande'
              )}
            </button>
          </form>

          <div className="rounded-xl p-5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
            <h3 className="font-medium text-[15px] mb-2">💡 Où trouver mon numéro ?</h3>
            <p className="text-[13px] text-[#78716C] leading-relaxed">
              Votre numéro de commande vous a été fourni lors de la confirmation. Il commence par{' '}
              <span className="font-medium" style={{ color: 'var(--color-primary)' }}>PLZ-</span> suivi de chiffres (ex: PLZ-1042).
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="text-[14px] transition-opacity hover:underline hover:opacity-80 active:scale-[0.97]"
              style={{ color: 'var(--color-primary)' }}
              data-testid="customer-track-back-btn"
            >
              ← Retour
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
