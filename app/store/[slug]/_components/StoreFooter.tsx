'use client';

import { useState } from 'react';
import { Instagram, Facebook, ChevronDown } from 'lucide-react';

// TikTok icon — not in lucide-react, using a minimal custom SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="TikTok"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

interface AccordionSectionProps {
  heading: string;
  links: string[];
}

function AccordionSection({ heading, links }: AccordionSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10">
      <button
        className="w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="text-xs uppercase tracking-wide text-[#78716C]">
          {heading}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#78716C] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <ul className="pb-4 space-y-2">
          {links.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-sm text-white transition-colors block hover:text-[var(--color-orange-accent,#FF6B1A)]"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const MARCHANDS_LINKS = [
  'Ouvrir ma boutique',
  'Comment ça marche',
  'Tarifs et commissions',
  'Devenir partenaire',
];

const LIVREURS_LINKS = ['Devenir coursier', 'Comment ça marche'];

const INFORMATIONS_LINKS = [
  'À propos de Plaza',
  'Nous contacter',
  "Centre d'aide",
];

export function StoreFooter() {
  return (
    <footer className="bg-[#1C1917] text-white pt-16 pb-8 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Desktop grid */}
        <div className="hidden lg:grid grid-cols-4 gap-8">
          {/* Col 1 — Brand */}
          <div>
            <span className="text-2xl font-bold text-white">Plaza</span>
            <p className="text-sm text-[#78716C] mt-2 max-w-[200px]">
              La boutique en ligne de vos commerçants préférés
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="text-white transition-colors cursor-pointer hover:text-[var(--color-orange-accent,#FF6B1A)]"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-white transition-colors cursor-pointer hover:text-[var(--color-orange-accent,#FF6B1A)]"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="text-white transition-colors cursor-pointer hover:text-[var(--color-orange-accent,#FF6B1A)]"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2 — Pour les marchands */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-[#78716C] mb-3">
              Pour les marchands
            </h3>
            <ul className="space-y-2">
              {MARCHANDS_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white transition-colors block mb-2 hover:text-[var(--color-orange-accent,#FF6B1A)]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Pour les livreurs */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-[#78716C] mb-3">
              Pour les livreurs
            </h3>
            <ul className="space-y-2">
              {LIVREURS_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white transition-colors block mb-2 hover:text-[var(--color-orange-accent,#FF6B1A)]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Informations */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-[#78716C] mb-3">
              Informations
            </h3>
            <ul className="space-y-2">
              {INFORMATIONS_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white transition-colors block mb-2 hover:text-[var(--color-orange-accent,#FF6B1A)]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden">
          {/* Brand — always visible */}
          <div className="mb-6">
            <span className="text-2xl font-bold text-white">Plaza</span>
            <p className="text-sm text-[#78716C] mt-2 max-w-[260px]">
              La boutique en ligne de vos commerçants préférés
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="text-white transition-colors cursor-pointer hover:text-[var(--color-orange-accent,#FF6B1A)]"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-white transition-colors cursor-pointer hover:text-[var(--color-orange-accent,#FF6B1A)]"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="text-white transition-colors cursor-pointer hover:text-[var(--color-orange-accent,#FF6B1A)]"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Accordion sections */}
          <AccordionSection
            heading="Pour les marchands"
            links={MARCHANDS_LINKS}
          />
          <AccordionSection
            heading="Pour les livreurs"
            links={LIVREURS_LINKS}
          />
          <AccordionSection
            heading="Informations"
            links={INFORMATIONS_LINKS}
          />
        </div>

        {/* Bottom bar — always visible */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-[13px] text-[#78716C]">
            © 2026 Plaza. Tous droits réservés.
          </p>
          <p className="text-[13px] text-[#78716C]">
            <a href="#" className="hover:text-white transition-colors">
              Conditions d&apos;utilisation
            </a>
            {' · '}
            <a href="#" className="hover:text-white transition-colors">
              Politique de confidentialité
            </a>
            {' · '}
            <a href="#" className="hover:text-white transition-colors">
              Mentions légales
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
