'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Info, X } from 'lucide-react';
import { checkDriverPhoneAction } from './actions';
import { createClient } from '@/lib/supabase/client';

export default function DriverPhonePage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMerchantWarning, setShowMerchantWarning] = useState(false);

  // Check on mount whether the browser already has an active Supabase session
  // that belongs to a merchant (not a driver). If so, warn the user that
  // completing driver login will replace their current session (SAAD-034).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: driverRecord } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      // No drivers record → existing session belongs to a merchant or admin
      if (!driverRecord) {
        setShowMerchantWarning(true);
      }
    });
  }, []);

  // Normalise raw digits to 9-digit local format:
  // +212612345678 → 612345678, 0612345678 → 612345678, 612345678 → 612345678
  function normalizeForDisplay(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('212')) return digits.slice(3);
    if (digits.startsWith('0')) return digits.slice(1);
    return digits;
  }

  // Always prepend +212 for the server — phone state is the 9-digit local form
  const formattedPhone = '+212' + phone;

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

  // phone is always the 9-digit normalised local format — valid if exactly 9
  // digits starting with 6, 7, or 5 (Moroccan mobile prefixes)
  const isValid = /^[567]\d{8}$/.test(phone);

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center pt-[72px] px-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-[32px] font-bold" style={{ color: 'var(--color-primary)' }}>Plaza</div>
        <div className="text-[22px] font-bold text-[#1C1917] mt-1">Espace Livreur</div>
        <div className="text-sm text-[#78716C] mt-2">Connectez-vous pour voir vos livraisons</div>
      </div>

      {/* Merchant session warning banner (SAAD-034) */}
      {showMerchantWarning && (
        <div className="w-full mt-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
          <p className="flex-1 text-[13px] text-blue-800 leading-snug">
            <span className="font-semibold">Connexion en tant que livreur</span>
            <br />
            Si vous êtes connecté en tant que marchand, votre session marchande sera remplacée.
          </p>
          <button
            onClick={() => setShowMerchantWarning(false)}
            aria-label="Fermer"
            className="shrink-0 text-blue-500 hover:text-blue-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
              placeholder="6X XX XX XX XX"
              value={phone}
              onChange={(e) => setPhone(normalizeForDisplay(e.target.value))}
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
