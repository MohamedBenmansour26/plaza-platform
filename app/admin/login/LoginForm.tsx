'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { requestAdminMagicLink, signInWithPasswordAction } from './actions';

type FormState =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'sent'; email: string };

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);
  const [usePassword, setUsePassword] = useState(false);
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState({ kind: 'error', message: 'Adresse email invalide.' });
      return;
    }
    setState({ kind: 'idle' });

    if (usePassword) {
      startTransition(async () => {
        const result = await signInWithPasswordAction(trimmed, password, trustDevice);
        if (result && 'error' in result) {
          setState({
            kind: 'error',
            message:
              result.error === 'invalid_email'
                ? 'Adresse email invalide.'
                : result.error === 'not_admin'
                  ? 'Accès non autorisé.'
                  : 'Identifiants incorrects.',
          });
        }
      });
      return;
    }

    startTransition(async () => {
      const result = await requestAdminMagicLink(trimmed, trustDevice);
      if ('error' in result) {
        setState({
          kind: 'error',
          message:
            result.error === 'invalid_email'
              ? 'Adresse email invalide.'
              : "Impossible d'envoyer le lien. Réessayez dans un instant.",
        });
        return;
      }
      setState({ kind: 'sent', email: trimmed });
    });
  };

  if (state.kind === 'sent') {
    return <SentState email={state.email} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <label
        htmlFor="admin-email"
        className="text-[13px] font-semibold text-[#1C1917]"
      >
        Adresse email
      </label>
      <input
        ref={inputRef}
        id="admin-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="vous@plaza.ma"
        autoComplete="email"
        aria-invalid={state.kind === 'error'}
        aria-describedby={state.kind === 'error' ? 'admin-email-error' : undefined}
        className="mt-2 h-10 w-full rounded-[6px] border border-[#E7E5E4] px-3 text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF]"
        data-testid="admin-login-email-input"
      />
      {usePassword && (
        <>
          <label
            htmlFor="admin-password"
            className="mt-3 text-[13px] font-semibold text-[#1C1917]"
          >
            Mot de passe
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="mt-2 h-10 w-full rounded-[6px] border border-[#E7E5E4] px-3 text-[14px] text-[#1C1917] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF]"
            data-testid="admin-login-password-input"
          />
        </>
      )}
      {state.kind === 'error' ? (
        <p
          id="admin-email-error"
          className="mt-2 text-[12px] text-[#DC2626]"
        >
          {state.message}
        </p>
      ) : null}
      <div className="mt-4 flex items-start gap-2">
        <input
          id="admin-trust-device"
          type="checkbox"
          checked={trustDevice}
          onChange={(event) => setTrustDevice(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded-[4px] border border-[#D6D3D1] text-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
          data-testid="admin-login-trust-device-checkbox"
        />
        <div>
          <label
            htmlFor="admin-trust-device"
            className="text-[14px] text-[#1C1917]"
          >
            Faire confiance à cet appareil
          </label>
          <p className="mt-1 text-[12px] text-[#78716C]">
            Reste connecté pendant 30 jours sur ce navigateur.
          </p>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="mt-5 h-10 w-full rounded-[6px] bg-[#2563EB] text-[14px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#E7E5E4] disabled:text-[#A8A29E]"
        data-testid="admin-login-submit-btn"
      >
        {pending
          ? usePassword ? 'Connexion…' : 'Envoi en cours…'
          : usePassword ? 'Se connecter' : 'Recevoir le lien magique'}
      </button>
      <button
        type="button"
        onClick={() => { setUsePassword((v) => !v); setState({ kind: 'idle' }); }}
        className="mt-3 text-center text-[12px] text-[#78716C] hover:text-[#2563EB] hover:underline"
        data-testid="admin-login-toggle-mode-btn"
      >
        {usePassword ? 'Revenir au lien magique' : 'Connexion par mot de passe'}
      </button>
    </form>
  );
}

function SentState({ email }: { email: string }) {
  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4]">
        <CheckCircle2 className="h-6 w-6 text-[#16A34A]" />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold text-[#1C1917]">
        Lien envoyé
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#78716C]">
        Vérifie ta boîte de réception <strong>{email}</strong> et clique sur le
        lien pour te connecter. Le lien est valable 15 minutes.
      </p>
      <button
        type="button"
        disabled={countdown > 0}
        className="mt-6 h-9 rounded-[6px] px-3 text-[13px] font-medium text-[#2563EB] hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:text-[#A8A29E] disabled:hover:bg-transparent"
      >
        {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le lien'}
      </button>
    </div>
  );
}
