'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { BarChart3 as BarChart3Icon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { MerchantMetrics, Period } from '@/lib/db/metrics';
import { MOROCCO_TZ } from '@/lib/timezone';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMAD(centimes: number): string {
  return `${Math.round(centimes / 100).toLocaleString('fr-MA')} MAD`;
}

function formatChartDate(iso: string, period: Period): string {
  const d = new Date(iso);
  if (period === 'week') {
    return d.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: MOROCCO_TZ }).slice(0, 3);
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: MOROCCO_TZ });
}

// ─── Payment colours ──────────────────────────────────────────────────────────

// Note: PAYMENT_COLORS values are used as SVG/Recharts fill colors.
// terminal uses the primary color CSS variable resolved at runtime.
const PAYMENT_COLORS: Record<string, string> = {
  cod:      '#6B7280',
  terminal: 'var(--color-primary)',
  card:     '#7C3AED',
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  metrics: MerchantMetrics;
  period: Period;
};

// ─── Main component ───────────────────────────────────────────────────────────

export function FinancesClient({ metrics, period }: Props) {
  const router = useRouter();
  const t = useTranslations('finances');
  // Guard recharts against SSR hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Arrays with user-facing strings MUST be inside component, after t()
  const PERIODS: { id: Period; label: string }[] = [
    { id: 'week',  label: t('period_week') },
    { id: 'month', label: t('period_month') },
    { id: 'all',   label: t('period_all') },
  ];

  const PAYMENT_LABELS: Record<string, string> = {
    cod:      t('payment_cod'),
    terminal: t('payment_terminal'),
    card:     t('payment_card'),
  };

  const chartData = metrics.revenueByDay.map((p) => ({
    label: formatChartDate(p.date, period),
    revenue: Math.round(p.revenue / 100),
  }));

  const pieData = metrics.paymentBreakdown.map((p) => ({
    name: PAYMENT_LABELS[p.method] ?? p.method,
    value: p.percentage,
    color: PAYMENT_COLORS[p.method] ?? '#A8A29E',
    count: p.count,
  }));

  const isEmpty = metrics.totalOrders === 0;

  const ChartPlaceholder = ({ h }: { h: string }) => (
    <div className={`${h} bg-[#F8FAFC] rounded-lg flex items-center justify-center`}>
      <span className="text-sm text-[#A8A29E]">{t('no_data')}</span>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1040px] mx-auto">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-[#1C1917]">{t('title')}</h1>

        {/* Period selector */}
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`?period=${p.id}`)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white text-[#78716C] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 col-span-2 md:col-span-1">
          <div className="text-[13px] text-[#78716C] mb-2">{t('stat_revenue')}</div>
          <div className="text-xl md:text-2xl font-semibold text-[#1C1917]">
            {isEmpty ? '—' : formatMAD(metrics.totalRevenue)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <div className="text-[13px] text-[#78716C] mb-2">{t('stat_orders')}</div>
          <div className="text-xl md:text-2xl font-semibold text-[#1C1917]">
            {isEmpty ? '—' : metrics.totalOrders}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <div className="text-[13px] text-[#78716C] mb-2">{t('stat_avg_basket')}</div>
          <div className="text-xl md:text-2xl font-semibold text-[#1C1917]">
            {isEmpty ? '—' : formatMAD(metrics.avgBasket)}
          </div>
        </div>
      </div>

      {isEmpty ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div className="bg-white rounded-xl shadow-sm py-20 text-center">
          <BarChart3Icon className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#1C1917] mb-2">
            {t('empty_title')}
          </h3>
          <p className="text-sm text-[#78716C]">
            {t('empty_body')}
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop layout: chart + right column ─────────────────────── */}
          <div className="hidden md:flex gap-6">

            {/* Revenue line chart */}
            <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] mb-4">
                {t('chart_title')}
              </h2>
              <div className="h-[220px]">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#E8632A" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#E8632A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis
                        dataKey="label"
                        stroke="#78716C"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#78716C"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`${value ?? 0} MAD`, t('stat_revenue')]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#E8632A"
                        strokeWidth={2}
                        dot={{ fill: '#E8632A', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartPlaceholder h="h-[220px]" />
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="w-[340px] space-y-4 flex-shrink-0">

              {/* Payment breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-base font-semibold text-[#1C1917] mb-4">
                  {t('payment_title')}
                </h2>
                {mounted && pieData.length > 0 ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="relative w-[180px] h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="text-xl font-bold text-[#1C1917]">
                            {metrics.totalOrders}
                          </div>
                          <div className="text-xs text-[#78716C]">{t('orders_label')}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-[#1C1917]">{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-[#1C1917]">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <ChartPlaceholder h="h-[200px]" />
                )}
              </div>

              {/* Top products */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-base font-semibold text-[#1C1917] mb-3">
                  {t('top_products_title')}
                </h2>
                {metrics.topProducts.length === 0 ? (
                  <p className="text-sm text-[#78716C] text-center py-4">{t('no_products')}</p>
                ) : (
                  <div>
                    {metrics.topProducts.map((p, i) => (
                      <div
                        key={p.product_id ?? p.name_fr}
                        className={`flex items-center gap-3 py-3 -mx-3 px-3 rounded-lg hover:bg-[#F8FAFC] transition-colors ${
                          i < metrics.topProducts.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                        } ${p.product_id ? 'cursor-pointer' : ''}`}
                      >
                        <div className="w-6 text-center text-sm font-semibold text-[#A8A29E]">
                          {i + 1}
                        </div>
                        <div className="w-10 h-10 rounded-md bg-[#F5F5F4] flex-shrink-0 overflow-hidden">
                          {p.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt={p.name_fr} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {p.product_id ? (
                            <Link
                              href={`/dashboard/produits/${p.product_id}`}
                              className="text-sm font-medium text-[#1C1917] truncate hover:text-[var(--color-primary)] block"
                            >
                              {p.name_fr}
                            </Link>
                          ) : (
                            <div className="text-sm font-medium text-[#1C1917] truncate">{p.name_fr}</div>
                          )}
                          <div className="text-xs text-[#78716C]">{t('sold_count', { count: p.sold })}</div>
                        </div>
                        <div className="text-sm font-semibold text-[#1C1917] flex-shrink-0">
                          {formatMAD(p.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Mobile layout ──────────────────────────────────────────────── */}
          <div className="md:hidden space-y-3">

            {/* Revenue card + chart */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="text-[12px] text-[#78716C] uppercase mb-1">{t('stat_revenue')}</div>
              <div className="text-[28px] font-semibold text-[#1C1917] mb-4">
                {formatMAD(metrics.totalRevenue)}
              </div>
              <div className="bg-[#FAFAF9] rounded-lg p-2 h-[160px]">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#78716C' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#78716C' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#E8632A"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-[#F0F0EF] rounded animate-pulse" />
                )}
              </div>
            </div>

            {/* Payment breakdown — mobile uses custom SVG donut */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-[16px] font-semibold text-[#1C1917] mb-4">
                {t('payment_title')}
              </h3>
              {pieData.length > 0 ? (
                <>
                  <DonutChartSVG data={pieData} total={metrics.totalOrders} ordersLabel={t('orders_label')} />
                  <div className="mt-4 space-y-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[14px] text-[#1C1917]">{item.name}</span>
                        </div>
                        <span className="text-[14px] font-semibold text-[#1C1917]">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-center text-[#78716C] py-8">{t('no_data')}</p>
              )}
            </div>

            {/* Top products */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">{t('top_products_title')}</h3>
              {metrics.topProducts.length === 0 ? (
                <p className="text-sm text-center text-[#78716C] py-4">{t('no_products')}</p>
              ) : (
                <div className="space-y-3">
                  {metrics.topProducts.map((p, i) => (
                    <div key={p.product_id ?? p.name_fr} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)', color: 'var(--color-primary)' }}>
                        {i + 1}
                      </div>
                      <div className="w-10 h-10 rounded-md bg-[#F5F5F4] flex-shrink-0 overflow-hidden">
                        {p.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt={p.name_fr} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-[#1C1917] truncate">{p.name_fr}</div>
                        <div className="text-[12px] text-[#78716C]">{t('sold_count', { count: p.sold })}</div>
                      </div>
                      <div className="text-[14px] font-semibold text-[#1C1917]">
                        {formatMAD(p.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}

// ─── SVG donut chart (mobile only, no recharts needed) ────────────────────────

type DonutSegment = { name: string; value: number; color: string };

function DonutChartSVG({ data, total, ordersLabel }: { data: DonutSegment[]; total: number; ordersLabel: string }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 50;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const segments = data.map((d) => {
    const offset = circumference * (1 - cumulative / 100);
    const dashArray = `${(d.value / 100) * circumference} ${circumference}`;
    cumulative += d.value;
    return { ...d, dashArray, offset };
  });

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={`-${(circumference * (segments.slice(0, i).reduce((s, x) => s + parseFloat(x.dashArray), 0) - (i > 0 ? circumference * i : 0))) / circumference}`}
              style={{
                strokeDashoffset: -(circumference * segments.slice(0, i).reduce((s, x) => s + x.value, 0) / 100),
              }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-[#1C1917]">{total}</div>
          <div className="text-xs text-[#78716C]">{ordersLabel}</div>
        </div>
      </div>
    </div>
  );
}
