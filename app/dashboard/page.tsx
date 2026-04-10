import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ShoppingBag, Banknote, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/ui/PaymentBadge';
import { CopyButton } from './CopyButton';
import { getOnboardingData } from '@/lib/db/onboarding';
import { OnboardingChecklist, OnboardingChecklistSkeleton } from '@/components/onboarding/OnboardingChecklist';
import type { Merchant, Order, OrderStatus, PaymentMethod } from '@/types/supabase';

function formatPrice(centimes: number): string {
  return `${(centimes / 100).toLocaleString('fr-MA')} MAD`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
}

function formatDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

type RecentOrder = Pick<
  Order,
  'id' | 'order_number' | 'customer_id' | 'total' | 'status' | 'payment_method' | 'created_at'
> & {
  customers: { full_name: string | null } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('user_id', user.id)
    .maybeSingle<Pick<Merchant, 'id' | 'store_name' | 'store_slug'>>();

  if (!merchant) redirect('/onboarding');

  const onboardingData = await getOnboardingData(user.id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [
    { count: ordersToday },
    { data: todayOrders },
    { count: pendingCount },
    { count: deliveredToday },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id)
      .gte('created_at', todayIso),

    supabase
      .from('orders')
      .select('total')
      .eq('merchant_id', merchant.id)
      .gte('created_at', todayIso)
      .returns<{ total: number }[]>(),

    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id)
      .eq('status', 'pending'),

    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id)
      .eq('status', 'delivered')
      .gte('created_at', todayIso),

    supabase
      .from('orders')
      .select('id, order_number, customer_id, total, status, payment_method, created_at, customers ( full_name )')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<RecentOrder[]>(),
  ]);

  const revenueToday = (todayOrders ?? []).reduce((sum, o) => sum + o.total, 0);

  const firstName = merchant.store_name.split(/\s+/)[0];
  const storeUrl = `plaza.ma/store/${merchant.store_slug}`;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Mobile top bar */}
      <div className="md:hidden bg-white px-4 py-4 flex items-center justify-between border-b border-[#E2E8F0]">
        <div className="text-[#2563EB] font-bold text-xl">Plaza</div>
        <Link href="/dashboard/compte">
          <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-semibold text-sm">
            {merchant.store_name.slice(0, 2).toUpperCase()}
          </div>
        </Link>
      </div>

      <div className="max-w-[1040px] mx-auto px-4 py-6 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-[#1C1917]">
            Bonjour, {firstName} !
          </h1>
          <p className="text-sm text-[#78716C] mt-1 capitalize">{formatDate()}</p>
        </div>

        {/* Onboarding checklist — shown when store is not yet live OR setup is incomplete.
            New merchants default to is_online=false in the DB, so we must also check
            for incomplete required steps (location, photo, description, category, first product) so the
            checklist renders for brand-new stores that haven't finished setup. */}
        {onboardingData !== null &&
          (!onboardingData.isOnline ||
            !onboardingData.hasLocation ||
            !onboardingData.logoUrl ||
            !onboardingData.hasDescription ||
            !onboardingData.hasCategory ||
            onboardingData.visibleProductCount < 1) && (
          <Suspense fallback={<OnboardingChecklistSkeleton />}>
            <OnboardingChecklist data={onboardingData} />
          </Suspense>
        )}

        {/* Stats grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#2563EB]" />
              </div>
            </div>
            <div className="text-2xl md:text-[28px] font-semibold text-[#1C1917] leading-tight">
              {ordersToday ?? 0}
            </div>
            <div className="text-[12px] md:text-[13px] text-[#78716C] mt-1">
              Commandes aujourd&apos;hui
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                <Banknote className="w-5 h-5 text-[#E8632A]" />
              </div>
            </div>
            <div className="text-2xl md:text-[28px] font-semibold text-[#1C1917] leading-tight">
              {formatPrice(revenueToday)}
            </div>
            <div className="text-[12px] md:text-[13px] text-[#78716C] mt-1">
              Revenus aujourd&apos;hui
            </div>
          </div>

          <Link href="/dashboard/commandes?filter=pending" className="block">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 h-full cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#D97706]" />
                </div>
              </div>
              <div className="text-2xl md:text-[28px] font-semibold text-[#1C1917] leading-tight">
                {pendingCount ?? 0}
              </div>
              <div className="text-[12px] md:text-[13px] text-[#78716C] mt-1">En attente</div>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#16A34A]" />
              </div>
            </div>
            <div className="text-2xl md:text-[28px] font-semibold text-[#1C1917] leading-tight">
              {deliveredToday ?? 0}
            </div>
            <div className="text-[12px] md:text-[13px] text-[#78716C] mt-1">
              Livrées aujourd&apos;hui
            </div>
          </div>
        </div>

        {/* Lower section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Recent activity */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[#1C1917] mb-4">Activité récente</h2>

            {/* Mobile: cards */}
            <div className="space-y-2 md:hidden">
              {(recentOrders ?? []).length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-sm text-[#78716C]">
                  Aucune commande pour l&apos;instant
                </div>
              ) : (
                (recentOrders ?? []).map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/commandes/${order.id}`}
                    className="block bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-bold text-sm text-[#1C1917]">
                          {order.order_number}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-[#1C1917]">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={order.status as OrderStatus} />
                      <span className="text-xs text-[#78716C]">
                        Il y a {timeAgo(order.created_at)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 flex items-center">
                <div className="w-[130px] text-[13px] font-medium text-[#78716C] uppercase">Commande</div>
                <div className="w-[160px] text-[13px] font-medium text-[#78716C] uppercase">Client</div>
                <div className="w-[130px] text-[13px] font-medium text-[#78716C] uppercase">Montant</div>
                <div className="w-[140px] text-[13px] font-medium text-[#78716C] uppercase">Statut</div>
                <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Paiement</div>
                <div className="flex-1 text-[13px] font-medium text-[#78716C] uppercase whitespace-nowrap min-w-[60px]">Il y a</div>
              </div>

              {(recentOrders ?? []).length === 0 ? (
                <div className="py-12 text-center text-sm text-[#78716C]">
                  Aucune commande pour l&apos;instant
                </div>
              ) : (
                (recentOrders ?? []).map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/commandes/${order.id}`}
                    className="h-12 px-4 flex items-center border-b border-[#F3F4F6] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <div className="w-[130px] text-sm font-medium text-[#1C1917]">
                      {order.order_number}
                    </div>
                    <div className="w-[160px] text-sm text-[#1C1917]">
                      {order.customers?.full_name ?? '—'}
                    </div>
                    <div className="w-[130px] text-sm text-[#1C1917]">
                      {formatPrice(order.total)}
                    </div>
                    <div className="w-[140px]">
                      <StatusBadge status={order.status as OrderStatus} />
                    </div>
                    <div className="w-[120px]">
                      <PaymentBadge method={order.payment_method as PaymentMethod} />
                    </div>
                    <div className="flex-1 text-sm text-[#78716C] whitespace-nowrap">{timeAgo(order.created_at)}</div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Store link card */}
          <div className="md:w-[320px]">
            {/* Mobile banner */}
            <div className="md:hidden bg-[#FFF7ED] rounded-xl p-4 border-l-4 border-[#E8632A]">
              <div className="text-sm font-semibold text-[#1C1917] mb-1">
                Votre boutique est en ligne !
              </div>
              <div className="text-sm text-[#2563EB] underline mb-3">{storeUrl}</div>
              <CopyButton url={`https://${storeUrl}`} />
            </div>

            {/* Desktop card */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm p-5">
              <div className="text-[13px] text-[#78716C] uppercase mb-2">Votre boutique</div>
              <p className="text-sm text-[#2563EB] underline mb-3">{storeUrl}</p>
              <a
                href={`https://${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-9 border border-[#2563EB] text-[#2563EB] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Voir la boutique
              </a>

              <div className="my-4 border-t border-[#E2E8F0]" />

              <div className="w-[120px] h-[120px] bg-[#F5F5F4] rounded-lg mx-auto flex items-center justify-center mb-3">
                <div className="text-4xl text-[#A8A29E]">QR</div>
              </div>

              <CopyButton url={`https://${storeUrl}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

