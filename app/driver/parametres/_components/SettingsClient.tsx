'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Key, Loader2, ChevronRight, Lock, X } from 'lucide-react';
import { BottomNav } from '../../_components/BottomNav';
import { LogoutButton } from '../../_components/LogoutButton';
import { updateDriverProfileAction, changeDriverPinAction } from '../actions';

type Props = {
  initialDriver: {
    full_name: string;
    phone: string;
    city: string | null;
  };
};

// ─── Change-PIN modal (UI shipped, server stubbed — see actions.ts) ──────────

function ChangePinModal({ onClose }: { onClose: () => void }) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onlyDigits(v: string, max = 4): string {
    return v.replace(/\D/g, '').slice(0, max);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (currentPin.length !== 4) { setError('Entrez votre PIN actuel (4 chiffres)'); return; }
    if (newPin.length !== 4)     { setError('Le nouveau PIN doit comporter 4 chiffres'); return; }
    if (newPin !== confirmPin)   { setError('Les nouveaux PIN ne correspondent pas'); return; }
    if (newPin === currentPin)   { setError('Le nouveau PIN doit être différent'); return; }

    startTransition(async () => {
      const result = await changeDriverPinAction({ current_pin: currentPin, new_pin: newPin });
      if ('error' in result) {
        // Server action is a TODO stub for Hamza — message is explicit rather
        // than masking as "unknown error" so QA knows what's actually happening.
        if (result.error === 'not_implemented') {
          setError('La modification du PIN sera disponible prochainement. Contactez le support pour l’instant.');
        } else {
          setError('Erreur technique. Réessayez dans un instant.');
        }
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-pin-title"
    >
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Fermer"
          data-testid="driver-parametres-change-pin-close-btn"
        >
          <X className="w-5 h-5 text-[#78716C]" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Key className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h2 id="change-pin-title" className="text-[18px] font-bold text-[#1C1917]">Modifier mon PIN</h2>
        </div>
        <p className="text-[13px] text-[#78716C] mb-4">
          Entrez votre PIN actuel, puis votre nouveau PIN à 4 chiffres.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">PIN actuel</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={currentPin}
              onChange={(e) => setCurrentPin(onlyDigits(e.target.value))}
              className="w-full h-12 px-3 border border-gray-300 rounded-xl text-[15px] text-[#1C1917] outline-none focus:border-[var(--color-primary)]"
              placeholder="••••"
              data-testid="driver-parametres-current-pin-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">Nouveau PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={newPin}
              onChange={(e) => setNewPin(onlyDigits(e.target.value))}
              className="w-full h-12 px-3 border border-gray-300 rounded-xl text-[15px] text-[#1C1917] outline-none focus:border-[var(--color-primary)]"
              placeholder="••••"
              data-testid="driver-parametres-new-pin-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">Confirmer le nouveau PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={confirmPin}
              onChange={(e) => setConfirmPin(onlyDigits(e.target.value))}
              className="w-full h-12 px-3 border border-gray-300 rounded-xl text-[15px] text-[#1C1917] outline-none focus:border-[var(--color-primary)]"
              placeholder="••••"
              data-testid="driver-parametres-confirm-pin-input"
            />
          </div>

          {error && <p className="text-[13px] text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white font-semibold flex items-center justify-center disabled:opacity-60"
            data-testid="driver-parametres-change-pin-submit-btn"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Valider'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main settings screen ────────────────────────────────────────────────────

export function SettingsClient({ initialDriver }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialDriver.full_name);
  const [city, setCity] = useState(initialDriver.city ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPinModal, setShowPinModal] = useState(false);

  const dirty =
    fullName.trim() !== initialDriver.full_name.trim() ||
    (city.trim() || null) !== (initialDriver.city?.trim() || null);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateDriverProfileAction({ full_name: fullName, city });
      if ('error' in result) {
        setError(
          result.error === 'name_too_short'
            ? 'Le nom est trop court'
            : 'Erreur technique. Réessayez dans un instant.',
        );
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl"
          aria-label="Retour"
          data-testid="driver-parametres-back-btn"
        >
          <ArrowLeft className="w-6 h-6 text-[#1C1917]" />
        </button>
        <h1 className="text-[20px] font-bold text-[#1C1917]">Paramètres</h1>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {/* ── Profile edit card ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <div className="px-0 py-0 mb-3">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#78716C]">
              Mes informations
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-xl text-[15px] text-[#1C1917] outline-none focus:border-[var(--color-primary)]"
                data-testid="driver-parametres-full-name-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">Numéro de téléphone</label>
              <div className="relative">
                <input
                  type="tel"
                  value={initialDriver.phone}
                  readOnly
                  aria-readonly
                  className="w-full h-11 px-3 pr-9 border border-gray-200 rounded-xl text-[15px] text-[#78716C] outline-none bg-gray-50"
                  data-testid="driver-parametres-phone-input"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              </div>
              <p className="mt-1 text-[11px] text-[#A8A29E]">
                Le téléphone est votre identifiant de connexion. Contactez le support pour le modifier.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Casablanca, Rabat, ..."
                className="w-full h-11 px-3 border border-gray-300 rounded-xl text-[15px] text-[#1C1917] outline-none focus:border-[var(--color-primary)]"
                data-testid="driver-parametres-city-input"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}

          <button
            onClick={handleSave}
            disabled={!dirty || isPending}
            className="mt-4 w-full h-12 rounded-xl bg-[var(--color-primary)] text-white font-semibold flex items-center justify-center disabled:opacity-60"
            data-testid="driver-parametres-save-btn"
          >
            {isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : saved
                ? 'Enregistré ✓'
                : 'Enregistrer'}
          </button>
        </section>

        {/* ── Schedule shortcut + Change PIN ─────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Link
            href="/driver/profil/horaires"
            className="px-4 flex items-center gap-3 border-b border-gray-100"
            style={{ height: 56 }}
            data-testid="driver-parametres-horaires-link"
          >
            <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            <div className="flex-1">
              <span className="block text-[15px] text-[#1C1917]">Mes horaires</span>
              <span className="block text-[12px] text-[#78716C]">Disponibilité hebdomadaire</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>

          <button
            onClick={() => setShowPinModal(true)}
            className="w-full px-4 flex items-center gap-3 text-left"
            style={{ height: 56 }}
            data-testid="driver-parametres-change-pin-btn"
          >
            <Key className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            <div className="flex-1">
              <span className="block text-[15px] text-[#1C1917]">Modifier mon PIN</span>
              <span className="block text-[12px] text-[#78716C]">Code de connexion à 4 chiffres</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </section>

        {/* ── Logout ────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <LogoutButton />
        </section>
      </div>

      <BottomNav />

      {showPinModal && <ChangePinModal onClose={() => setShowPinModal(false)} />}
    </div>
  );
}
