'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { checkDriverPhoneAction } from './actions';

export default function DriverPhonePage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strip leading 0 so '0611111111' → '+212611111111' (E.164 Morocco)
  const formattedPhone = '+212' + phone.replace(/^\s*0/, '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await checkDriverPhoneAction(formattedPhone);
      if (result?.error) {
        setError('Numéro invalide — vérifiez le format');
      }
    } finally {
      setLoading(false);
    }
  }

  const isValid = phone.replace(/\D/g, '').length >= 9;

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center pt-[72px] px-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-[32px] font-bold" style={{ color: 'var(--color-primary)' }}>Plaza</div>
        <div className="text-[22px] font-bold text-[#1C1917] mt-1">Espace Livreur</div>
        <div className="text-sm text-[#78716C] mt-2">Connectez-vous pour voir vos livraisons</div>
      </div>

      {/* Form card */}
      <div className="w-full bg-white rounded-2xl shadow-md mt-10 p-6">
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[#1C1917] mb-2">
            Numéro de téléphone
          </label>
          <div className="flex h-[52px] border border-gray-300 rounded-xl overflow-hidden focus-within:border-2 focus-within:border-[var(--color-primary)]">
            <div className="flex items-center px-3 text-[#78716C] text-sm font-medium border-r border-gray-200 bg-gray-50 select-none">
              +212
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="06 XX XX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
              className="flex-1 px-3 text-[15px] text-[#1C1917] outline-none bg-transparent"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[13px] text-[#DC2626] mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="mt-4 w-full h-[52px] rounded-xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all disabled:bg-gray-200 disabled:text-gray-400"
            style={isValid && !loading ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Recevoir un code <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      <p className="text-xs text-[#78716C] mt-auto mb-8">
        Problèmes ? Contactez le support Plaza
      </p>
    </main>
  );
}
