import { CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function IssueSuccessPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-8">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-[22px] font-bold text-[#1C1917] mt-5">Problème signalé</h1>
      <p className="text-sm text-[#78716C] mt-2 text-center">
        Notre équipe va examiner votre signalement et vous contactera si nécessaire.
      </p>

      <div className="w-full mt-6 bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#78716C]" />
          <span className="text-sm text-[#1C1917]">Référence: Commande #{params.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-[#78716C]" />
          <span className="text-[13px] text-[#78716C]">Réponse sous 2h en heure ouvrée</span>
        </div>
      </div>

      <Link
        href="/driver/livraisons"
        className="mt-8 block w-full h-[52px] rounded-xl text-base font-bold text-white flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        data-testid="driver-issue-success-return-link"
      >
        Retour aux livraisons
      </Link>
    </main>
  );
}
