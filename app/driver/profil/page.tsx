import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryHistory } from '@/lib/db/driver';
import { redirect } from 'next/navigation';
import { BottomNav } from '../_components/BottomNav';
import { LogoutButton } from '../_components/LogoutButton';
import { Bike, FileText, Shield, CreditCard, Settings, HelpCircle, ChevronRight, TrendingUp, Calendar } from 'lucide-react';

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/driver/auth/phone');

  const driver = await getDriverProfile(user.id);
  if (!driver) redirect('/driver/auth/phone');
  if (driver.onboarding_status !== 'active') redirect('/driver/onboarding/pending');

  const history = await getDeliveryHistory(driver.id);
  const totalEarnings = history.reduce((sum, d) => sum + d.earnings, 0);
  const onTimeRate = history.length > 0 ? Math.round((history.filter(d => d.on_time).length / history.length) * 100) : 0;

  const vehicleLabel = { moto: 'Moto', velo: 'Vélo', voiture: 'Voiture', autre: 'Autre' }[driver.vehicle_type ?? 'moto'] ?? 'N/A';

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3.5">
        <h1 className="text-[20px] font-bold text-[#1C1917]">Mon profil</h1>
      </header>

      <div className="px-4 pt-4 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-2 flex-shrink-0"
              style={{ borderColor: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, white)', color: 'var(--color-primary)' }}>
              {driver.full_name[0]?.toUpperCase() ?? 'L'}
            </div>
            <div className="flex-1">
              <p className="text-[18px] font-bold text-[#1C1917]">{driver.full_name}</p>
              <p className="text-sm text-[#78716C] mt-0.5">{driver.phone}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-600">Compte actif</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-[#1C1917]">{history.length}</p>
              <p className="text-[11px] text-[#78716C]">Livraisons</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{totalEarnings}</p>
              <p className="text-[11px] text-[#78716C]">MAD Gains</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{onTimeRate}%</p>
              <p className="text-[11px] text-[#78716C]">Taux réussite</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, black) 100%)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="text-base font-semibold">Ce mois-ci</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xl font-bold">{history.length} livraisons</span>
            <span className="text-xl font-bold">{onTimeRate}% à l&apos;heure</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#78716C]">Véhicule & Documents</p>
          </div>
          {[
            { Icon: Bike,     label: 'Informations véhicule', badge: vehicleLabel },
            { Icon: FileText, label: 'Permis de conduire',    badge: 'Validé ✓' },
            { Icon: Shield,   label: 'Assurance',             badge: 'Validé ✓' },
            { Icon: CreditCard, label: 'Carte nationale',     badge: 'Validé ✓' },
          ].map(({ Icon, label, badge }, i, arr) => (
            <div key={label} className={`px-4 flex items-center gap-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
              style={{ height: 52 }}>
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span className="flex-1 text-[15px] text-[#1C1917]">{label}</span>
              <span className="text-xs text-green-600 font-medium">{badge}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { Icon: Calendar,   label: 'Mes horaires',   color: 'var(--color-primary)', href: '/driver/profil/horaires', testId: 'driver-profil-horaires-link' },
            { Icon: Settings,   label: 'Paramètres',     color: '#78716C', href: '/driver/parametres', testId: 'driver-profil-parametres-link' },
            { Icon: HelpCircle, label: 'Aide & Support', color: '#78716C', href: '/driver/support',    testId: 'driver-profil-support-link' },
          ].map(({ Icon, label, color, href, testId }) => (
            <a key={label} href={href}
              className="px-4 flex items-center gap-3 border-b border-gray-100"
              style={{ height: 52 }}
              data-testid={testId}>
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
              <span className="flex-1 text-[15px]" style={{ color }}>{label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </a>
          ))}
          <LogoutButton />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
