'use client';

import { LaptopMinimal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/**
 * DesktopRequired — shown on any non-approval admin route below 1024px.
 * Rendered in app/admin/layout.tsx as a sibling of the shell, with CSS
 * media queries controlling which one is visible (see globals.css).
 */
export function DesktopRequired() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div
      data-admin-desktop-required
      role="alert"
      className="hidden min-h-screen items-center justify-center bg-[#FAFAF9] px-6"
    >
      <div className="w-full max-w-[320px] rounded-[12px] border border-[#E7E5E4] bg-white px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-[#2563EB]">Plaza</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
              Admin
            </span>
          </div>
          <LaptopMinimal
            className="mt-6 h-10 w-10 text-[#A8A29E]"
            strokeWidth={1.5}
          />
          <h1 className="mt-4 text-[18px] font-semibold text-[#1C1917]">
            Version bureau requise
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#44403C]">
            La console admin est conçue pour le bureau. Seule l&apos;approbation
            des livreurs est disponible sur mobile.
          </p>
          {!formOpen && !sent ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-6 h-10 w-full rounded-[6px] bg-[#2563EB] text-[14px] font-semibold text-white hover:bg-[#1D4ED8]"
            >
              M&apos;envoyer le lien par email
            </button>
          ) : formOpen && !sent ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  // TODO: wire to real email-forward endpoint once available.
                  setSent(true);
                }
              }}
              className="mt-6 flex w-full items-center gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@plaza.ma"
                className="h-9 flex-1 rounded-[6px] border border-[#E7E5E4] px-3 text-[14px] placeholder:text-[#A8A29E] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF]"
              />
              <button
                type="submit"
                className="h-9 rounded-[6px] bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Envoyer
              </button>
            </form>
          ) : (
            <p className="mt-6 text-[12px] text-[#15803D]">
              Lien envoyé à {email}
            </p>
          )}
          <Link
            href="/admin/drivers/pending"
            className="mt-3 text-[13px] font-medium text-[#2563EB] hover:underline"
          >
            Aller à l&apos;approbation des livreurs →
          </Link>
        </div>
      </div>
    </div>
  );
}
