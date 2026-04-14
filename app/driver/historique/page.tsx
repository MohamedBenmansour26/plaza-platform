import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryHistory } from '@/lib/db/driver';
import { redirect } from 'next/navigation';
import { BottomNav } from '../_components/BottomNav';

export default async function HistoriquePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/driver/auth/phone');

  const driver = await getDriverProfile(user.id);
  if (!driver) redirect('/driver/auth/phone');
  if (driver.onboarding_status !== 'active') redirect('/driver/onboarding/pending');

  const history = await getDeliveryHistory(driver.id);

  const totalEarnings = history.reduce((sum, d) => sum + d.earnings, 0);
  const onTimeCount = history.filter(d => d.on_time).length;
  const onTimeRate = history.length > 0 ? Math.round((onTimeCount / history.length) * 100) : 0;

  const grouped: Record<string, typeof history> = {};
  history.forEach(d => {
    const dateKey = d.delivered_at
      ? new Date(d.delivered_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'Date inconnue';
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(d);
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3.5">
        <h1 className="text-[20px] font-bold text-[#1C1917]">Historique</h1>
      </header>

      <div className="px-4 pt-3">
        <div className="rounded-2xl p-5 mb-5 text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, black) 100%)' }}>
          <p className="text-xs opacity-80 mb-3">Cette semaine</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{history.length}</p>
              <p className="text-xs opacity-70 mt-0.5">Livraisons</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEarnings}</p>
              <p className="text-xs opacity-70 mt-0.5">MAD Gains</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{onTimeRate}%</p>
              <p className="text-xs opacity-70 mt-0.5">À l&apos;heure</p>
            </div>
          </div>
        </div>

        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-4">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#78716C] mb-2">{date}</p>
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm mb-2 flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-[#1C1917]">{item.order_number}</p>
                  <p className="text-[13px] text-[#78716C] mt-0.5">{item.customer_name}</p>
                  {item.city && <p className="text-xs text-[#A8A29E] mt-0.5">📍 {item.city}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-bold text-green-600">+{item.earnings} MAD</p>
                  <span className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${item.on_time ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {item.on_time ? "À l'heure ✓" : 'En retard'}
                  </span>
                  {item.payment_method === 'cod' && (
                    <p className="mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#E8632A]">COD</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-[#78716C]">Aucune livraison terminée pour l&apos;instant</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
