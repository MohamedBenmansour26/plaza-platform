'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Phone, HelpCircle, ChevronRight, FileText, Clock } from 'lucide-react';
import { BottomNav } from '../../_components/BottomNav';

// Plaza support contact channels — sourced from founder's published contact
// info for launch. If these change, update here (single source of truth on
// the driver side until the driver ticketing inbox lands).
const SUPPORT_WHATSAPP = '+212600000000'; // placeholder — replace with real line
const SUPPORT_PHONE    = '+212600000000';
const SUPPORT_HOURS    = 'Lundi — Dimanche, 9h — 21h';

const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Comment accepter une livraison ?',
    answer:
      'Activez votre disponibilité depuis l\'écran « Mes livraisons ». Les livraisons de votre zone apparaissent dans « Dans votre zone ». Appuyez sur « Accepter » pour prendre une livraison.',
  },
  {
    question: 'Je n\'arrive pas à valider la collecte',
    answer:
      'Demandez le code marchand au commerçant (6 chiffres, visible dans son tableau de bord). Si le code est refusé, vérifiez les chiffres un par un. Après 3 échecs, contactez le support.',
  },
  {
    question: 'Quand suis-je payé ?',
    answer:
      'Les gains sont calculés chaque lundi et versés par virement en début de semaine suivante. Vous pouvez suivre vos gains dans « Historique ».',
  },
  {
    question: 'Comment signaler un problème de livraison ?',
    answer:
      'Sur l\'écran de livraison, utilisez le bouton « Signaler un problème » en bas. Sélectionnez le motif, ajoutez une photo si nécessaire, puis envoyez le rapport.',
  },
];

type Props = {
  driverName: string;
  driverPhone: string;
};

export function SupportClient({ driverName, driverPhone }: Props) {
  const router = useRouter();

  const whatsappHref = `https://wa.me/${SUPPORT_WHATSAPP.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    `Bonjour, je suis ${driverName} (${driverPhone}). J'ai besoin d'aide avec...`,
  )}`;

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl"
          aria-label="Retour"
          data-testid="driver-support-back-btn"
        >
          <ArrowLeft className="w-6 h-6 text-[#1C1917]" />
        </button>
        <h1 className="text-[20px] font-bold text-[#1C1917]">Aide & Support</h1>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {/* ── Intro card ─────────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, black) 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5" />
            <span className="text-[14px] font-semibold">Besoin d&apos;aide ?</span>
          </div>
          <p className="text-[13px] opacity-90 leading-relaxed">
            L&apos;équipe Plaza est à votre disposition pour toute question sur les livraisons,
            les paiements ou votre compte livreur.
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-[12px] opacity-80">
            <Clock className="w-3.5 h-3.5" />
            <span>{SUPPORT_HOURS}</span>
          </div>
        </section>

        {/* ── Contact channels ───────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#78716C]">
              Nous contacter
            </p>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 flex items-center gap-3 border-b border-gray-100"
            style={{ height: 56 }}
            data-testid="driver-support-whatsapp-link"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <span className="block text-[15px] text-[#1C1917]">WhatsApp</span>
              <span className="block text-[12px] text-[#78716C]">Réponse rapide, en journée</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </a>

          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="px-4 flex items-center gap-3"
            style={{ height: 56 }}
            data-testid="driver-support-phone-link"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, white)' }}
            >
              <Phone className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="flex-1">
              <span className="block text-[15px] text-[#1C1917]">Téléphone</span>
              <span className="block text-[12px] text-[#78716C]">{SUPPORT_PHONE}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </a>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#78716C]" />
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#78716C]">
              Questions fréquentes
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {FAQ.map((item, i) => (
              <details key={i} className="group">
                <summary
                  className="px-4 py-3.5 flex items-center gap-3 cursor-pointer list-none"
                  data-testid={`driver-support-faq-q-${i}`}
                >
                  <span className="flex-1 text-[14px] font-medium text-[#1C1917]">
                    {item.question}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-[13px] text-[#78716C] leading-relaxed">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Footer note ────────────────────────────────────────────── */}
        <p className="text-center text-[11px] text-[#A8A29E] pt-2">
          Plaza livreur — support dédié aux partenaires de livraison
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
