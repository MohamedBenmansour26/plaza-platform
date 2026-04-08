import { ShoppingBag, Banknote, Clock, Check } from "lucide-react";
import { Link } from "react-router";
import { BottomNav } from "../components/BottomNav";

export function Dashboard() {
  const orders = [
    {
      id: "PLZ-042",
      customer: "Fatima Z.",
      amount: "879 MAD",
      status: "En attente",
      time: "Il y a 23 min",
      statusColor: "bg-[#F3F4F6] text-[#6B7280]",
    },
    {
      id: "PLZ-041",
      customer: "Youssef E.",
      amount: "250 MAD",
      status: "Confirmée",
      time: "Il y a 1h",
      statusColor: "bg-[#EFF6FF] text-[#2563EB]",
    },
    {
      id: "PLZ-040",
      customer: "Meryem A.",
      amount: "1 450 MAD",
      status: "Livrée",
      time: "Il y a 2h",
      statusColor: "bg-[#F0FDF4] text-[#16A34A]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="max-w-[375px] mx-auto">
        {/* Top Bar */}
        <div className="bg-white px-4 py-4 flex items-center justify-between">
          <div className="text-[#2563EB] font-bold text-xl">Plaza</div>
          <Link to="/dashboard/compte">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-semibold text-sm">
              FA
            </div>
          </Link>
        </div>

        {/* Greeting */}
        <div className="px-4 pt-6 pb-4">
          <div className="text-[20px] font-semibold text-[#1C1917]">
            Bonjour, Fatima ! 👋
          </div>
          <div className="text-[14px] text-[#78716C] mt-1">
            Mardi, 7 avril 2026
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <ShoppingBag size={20} className="text-[#2563EB] mb-2" />
            <div className="text-[12px] text-[#78716C]">
              Commandes aujourd'hui
            </div>
            <div className="text-[28px] font-semibold text-[#1C1917] mt-1">
              12
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Banknote size={20} className="text-[#E8632A] mb-2" />
            <div className="text-[12px] text-[#78716C]">
              Revenus aujourd'hui
            </div>
            <div className="text-[22px] font-semibold text-[#1C1917] mt-1">
              1 840 MAD
            </div>
          </div>

          <Link to="/dashboard/commandes?filter=pending">
            <div className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <Clock size={20} className="text-[#D97706] mb-2" />
              <div className="text-[12px] text-[#78716C]">En attente</div>
              <div className="text-[28px] font-semibold text-[#1C1917] mt-1">
                3
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Check size={20} className="text-[#16A34A] mb-2" />
            <div className="text-[12px] text-[#78716C]">Livrées</div>
            <div className="text-[28px] font-semibold text-[#1C1917] mt-1">
              9
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 mt-6">
          <h2 className="text-[18px] font-semibold text-[#1C1917] mb-3">
            Activité récente
          </h2>

          <div className="space-y-2">
            {orders.map((order) => (
              <Link key={order.id} to={`/dashboard/commandes/${order.id}`}>
                <div className="bg-white rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-bold text-[#1C1917]">
                        #{order.id}
                      </span>
                      <span className="text-[14px] text-[#78716C] ml-2">
                        {order.customer}
                      </span>
                    </div>
                    <div className="text-[14px] font-semibold text-[#1C1917]">
                      {order.amount}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[12px] ${order.statusColor}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-[12px] text-[#78716C]">
                      {order.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className="px-4 mt-6 mb-4">
          <div className="bg-[#FFF7ED] rounded-xl p-4 border-l-4 border-[#E8632A]">
            <div className="text-[14px] font-semibold text-[#1C1917] mb-1">
              Votre boutique est en ligne !
            </div>
            <div className="text-[13px] text-[#2563EB] underline mb-3">
              plaza.ma/fatima-store
            </div>
            <button className="w-full h-8 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#1C1917] hover:bg-[#FAFAF9] transition-colors">
              Copier le lien
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
