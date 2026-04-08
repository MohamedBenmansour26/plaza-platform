import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router";

const revenueData = [
  { day: 'Lun', revenue: 2800 },
  { day: 'Mar', revenue: 3200 },
  { day: 'Mer', revenue: 2900 },
  { day: 'Jeu', revenue: 3800 },
  { day: 'Ven', revenue: 4200 },
  { day: 'Sam', revenue: 5100 },
  { day: 'Dim', revenue: 2600 },
];

const paymentData = [
  { name: 'COD', value: 65, color: '#6B7280' },
  { name: 'Terminal', value: 28, color: '#2563EB' },
  { name: 'Carte', value: 7, color: '#7C3AED' },
];

const topProducts = [
  { rank: 1, name: "Robe d'ete fleurie", revenue: '8 400 MAD', image: null },
  { rank: 2, name: "Sac a main cuir", revenue: '6 200 MAD', image: null },
  { rank: 3, name: "Sandales dorees", revenue: '4 800 MAD', image: null },
];

export function Finances() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1040px] mx-auto p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1C1917]">Finances</h1>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {[
              { id: 'week', label: 'Cette semaine' },
              { id: 'month', label: 'Ce mois' },
              { id: 'all', label: 'Tout' },
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as any)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white text-[#78716C] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-[13px] text-[#78716C] mb-2">Revenus totaux</div>
            <div className="text-2xl font-semibold text-[#1C1917]">24 600 MAD</div>
            <div className="mt-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A]">
                +18% vs mois dernier
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-[13px] text-[#78716C] mb-2">Commandes</div>
            <div className="text-2xl font-semibold text-[#1C1917]">148</div>
            <div className="mt-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A]">
                +12%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-[13px] text-[#78716C] mb-2">Panier moyen</div>
            <div className="text-2xl font-semibold text-[#1C1917]">166 MAD</div>
            <div className="mt-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A]">
                +5%
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Revenue Chart */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] mb-4">Evolution des revenus</h2>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8632A" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#E8632A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#78716C" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#78716C" 
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: any) => [`${value} MAD`, 'Revenus']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#E8632A" 
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      dot={{ fill: '#E8632A', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[340px] space-y-4">
            {/* Payment Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] mb-4">Repartition des paiements</h2>
              
              <div className="flex justify-center mb-4">
                <div className="relative w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-[#1C1917]">148</div>
                    <div className="text-xs text-[#78716C]">commandes</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {paymentData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-[#1C1917]">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1C1917]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-[#1C1917] mb-3">Meilleures ventes</h2>
              <div className="space-y-0">
                {topProducts.map((product, idx) => (
                  <div
                    key={product.rank}
                    onClick={() => navigate('/dashboard/produits/1')}
                    className={`flex items-center gap-3 py-3 cursor-pointer hover:bg-[#F8FAFC] -mx-3 px-3 rounded-lg transition-colors ${
                      idx < topProducts.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                    }`}
                  >
                    <div className="w-6 text-center text-lg font-semibold text-[#A8A29E]">
                      {product.rank}
                    </div>
                    <div className="w-10 h-10 rounded-md bg-[#F5F5F4]"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1C1917] truncate">{product.name}</div>
                    </div>
                    <div className="text-sm font-semibold text-[#1C1917]">{product.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}