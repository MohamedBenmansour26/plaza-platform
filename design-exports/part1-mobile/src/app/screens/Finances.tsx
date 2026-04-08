import { BottomNav } from "../components/BottomNav";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export function Finances() {
  const [period, setPeriod] = useState("Cette semaine");

  const chartData = useMemo(() => [
    { id: "mon", day: "Lun", revenue: 2800 },
    { id: "tue", day: "Mar", revenue: 3200 },
    { id: "wed", day: "Mer", revenue: 2500 },
    { id: "thu", day: "Jeu", revenue: 4100 },
    { id: "fri", day: "Ven", revenue: 3800 },
    { id: "sat", day: "Sam", revenue: 5200 },
    { id: "sun", day: "Dim", revenue: 3000 },
  ], []);

  const topProducts = useMemo(() => [
    { rank: 1, name: "Robe d'été", sold: 24, revenue: "8 400 MAD" },
    { rank: 2, name: "Sac cuir", sold: 18, revenue: "10 440 MAD" },
    { rank: 3, name: "Sandales", sold: 15, revenue: "3 300 MAD" },
  ], []);

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="max-w-[375px] mx-auto">
        {/* Top Bar */}
        <div className="bg-white px-4 py-4">
          <h1 className="text-[18px] font-semibold text-[#1C1917]">
            Finances
          </h1>
        </div>

        {/* Period Selector */}
        <div className="py-4 flex justify-center gap-2">
          {["Cette semaine", "Ce mois", "Tout"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 h-8 rounded-full text-[13px] transition-colors ${
                period === p
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#78716C] border border-[#E2E8F0] hover:bg-[#F5F5F4]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Revenue Card */}
        <div className="px-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-[12px] text-[#78716C] uppercase mb-1">
              Revenus totaux
            </div>
            <div className="text-[28px] font-semibold text-[#1C1917] mb-1">
              24 600 MAD
            </div>
            <div className="text-[14px] text-[#16A34A] mb-4">
              +18% vs le mois dernier
            </div>

            {/* Chart */}
            <div className="bg-[#FAFAF9] rounded-lg -mx-2 -mb-2 p-2 h-[160px]" key="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData} 
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#78716C" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#78716C" }}
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
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-4 mt-3 grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-[12px] text-[#78716C] mb-1">Commandes</div>
            <div className="flex items-end gap-2">
              <div className="text-[24px] font-semibold text-[#1C1917]">
                148
              </div>
              <div className="text-[12px] text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full mb-1">
                +12%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-[12px] text-[#78716C] mb-1">
              Panier moyen
            </div>
            <div className="flex items-end gap-2">
              <div className="text-[24px] font-semibold text-[#1C1917]">
                166 MAD
              </div>
              <div className="text-[12px] text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full mb-1">
                +5%
              </div>
            </div>
          </div>
        </div>

        {/* Payment Distribution */}
        <div className="px-4 mt-3">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-4">
              Répartition des paiements
            </h3>
            
            {/* Donut Chart Placeholder */}
            <div className="flex items-center justify-center h-[160px] mb-4">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* COD 65% */}
                  <circle
                    key="cod-segment"
                    cx="50"
                    cy="50"
                    r="30"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="20"
                    strokeDasharray="65 35"
                  />
                  {/* Terminal 28% */}
                  <circle
                    key="terminal-segment"
                    cx="50"
                    cy="50"
                    r="30"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="20"
                    strokeDasharray="28 72"
                    strokeDashoffset="-65"
                  />
                  {/* Carte 7% */}
                  <circle
                    key="card-segment"
                    cx="50"
                    cy="50"
                    r="30"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="20"
                    strokeDasharray="7 93"
                    strokeDashoffset="-93"
                  />
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6B7280]" />
                  <span className="text-[14px] text-[#1C1917]">COD</span>
                </div>
                <span className="text-[14px] font-semibold text-[#1C1917]">
                  65%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
                  <span className="text-[14px] text-[#1C1917]">Terminal</span>
                </div>
                <span className="text-[14px] font-semibold text-[#1C1917]">
                  28%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#7C3AED]" />
                  <span className="text-[14px] text-[#1C1917]">Carte</span>
                </div>
                <span className="text-[14px] font-semibold text-[#1C1917]">
                  7%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="px-4 mt-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-[16px] font-semibold text-[#1C1917] mb-3">
              Meilleures ventes
            </h3>
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product.rank} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-[12px] font-semibold">
                    {product.rank}
                  </div>
                  <div className="w-10 h-10 rounded-md bg-[#F5F5F4]" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-[#1C1917]">
                      {product.name}
                    </div>
                    <div className="text-[12px] text-[#78716C]">
                      {product.sold} vendus
                    </div>
                  </div>
                  <div className="text-[14px] font-semibold text-[#1C1917]">
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}