import { Clock, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

export default function PendingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-8">
      {/* Icon with pulse ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: 'var(--color-primary)' }} />
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, white)' }}>
          <Clock className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>

      <h1 className="text-[24px] font-bold text-[#1C1917] mt-6">Dossier soumis !</h1>
      <p className="text-[15px] text-[#78716C] mt-2 text-center">
        Votre dossier est en cours de vérification par l&apos;équipe Plaza.
        Ce processus prend généralement 24 à 48 heures.
      </p>

      {/* Status card */}
      <div className="w-full mt-8 bg-white rounded-2xl shadow-sm p-5 space-y-3">
        {[
          { icon: CheckCircle2, color: 'text-green-600', label: 'Téléphone vérifié', badge: 'Validé', badgeColor: 'text-green-600 bg-green-50' },
          { icon: CheckCircle2, color: 'text-green-600', label: 'Documents soumis', badge: 'Reçu', badgeColor: 'text-green-600 bg-green-50' },
          { icon: Clock, color: '', label: 'Vérification en cours', badge: 'En cours', badgeColor: '' },
          { icon: Circle, color: 'text-[#A8A29E]', label: 'Activation du compte', badge: null, badgeColor: '' },
        ].map(({ icon: Icon, color, label, badge, badgeColor }, i) => (
          <div key={i} className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} style={i === 2 ? { color: 'var(--color-primary)' } : {}} />
            <span className={`flex-1 text-sm ${i === 3 ? 'text-[#A8A29E]' : 'text-[#1C1917]'}`}>{label}</span>
            {badge && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}
                style={i === 2 ? { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, white)' } : {}}>
                {badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-[13px] text-[#78716C] mt-8 text-center">
        Vous recevrez un SMS dès que votre compte est activé
      </p>
      <Link href="#" className="text-[14px] mt-4 underline" style={{ color: 'var(--color-primary)' }}>
        Contacter le support
      </Link>
    </main>
  );
}
