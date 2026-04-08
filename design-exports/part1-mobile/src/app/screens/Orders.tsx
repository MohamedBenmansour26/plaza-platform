import { Link } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { useState } from "react";

export function Orders() {
  const [activeTab, setActiveTab] = useState("Toutes");

  const tabs = [
    "Toutes",
    "En attente",
    "Confirmées",
    "Expédiées",
    "Livrées",
    "Annulées",
  ];

  const orders = [
    {
      id: "PLZ-045",
      customer: "Rachid M.",
      amount: "420 MAD",
      time: "Il y a 15 min",
      status: "En attente",
      statusBg: "#F3F4F6",
      statusText: "#6B7280",
      payment: "COD",
      paymentBg: "#F3F4F6",
      paymentText: "#6B7280",
    },
    {
      id: "PLZ-044",
      customer: "Sara L.",
      amount: "890 MAD",
      time: "Il y a 45 min",
      status: "Confirmée",
      statusBg: "#EFF6FF",
      statusText: "#2563EB",
      payment: "Terminal",
      paymentBg: "#EFF6FF",
      paymentText: "#2563EB",
    },
    {
      id: "PLZ-043",
      customer: "Hassan K.",
      amount: "1 200 MAD",
      time: "Il y a 1h",
      status: "Expédiée",
      statusBg: "#FFF7ED",
      statusText: "#E8632A",
      payment: "Carte",
      paymentBg: "#F3E8FF",
      paymentText: "#7C3AED",
    },
    {
      id: "PLZ-042",
      customer: "Fatima Z.",
      amount: "879 MAD",
      time: "Il y a 2h",
      status: "Livrée",
      statusBg: "#F0FDF4",
      statusText: "#16A34A",
      payment: "COD",
      paymentBg: "#F3F4F6",
      paymentText: "#6B7280",
    },
    {
      id: "PLZ-041",
      customer: "Mohamed B.",
      amount: "350 MAD",
      time: "Il y a 3h",
      status: "Annulée",
      statusBg: "#FEF2F2",
      statusText: "#DC2626",
      payment: "Terminal",
      paymentBg: "#EFF6FF",
      paymentText: "#2563EB",
    },
    {
      id: "PLZ-040",
      customer: "Amina S.",
      amount: "670 MAD",
      time: "Il y a 5h",
      status: "En attente",
      statusBg: "#F3F4F6",
      statusText: "#6B7280",
      payment: "COD",
      paymentBg: "#F3F4F6",
      paymentText: "#6B7280",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="max-w-[375px] mx-auto">
        {/* Top Bar */}
        <div className="bg-white px-4 py-4">
          <h1 className="text-[18px] font-semibold text-[#1C1917]">
            Commandes
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-[#E2E8F0] flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 h-11 text-[14px] whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-[#2563EB] border-[#2563EB] font-medium"
                  : "text-[#78716C] border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="p-4 space-y-2">
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
                  <div className="text-right">
                    <div className="text-[14px] font-semibold text-[#1C1917]">
                      {order.amount}
                    </div>
                    <div className="text-[12px] text-[#78716C] mt-0.5">
                      {order.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[12px]"
                    style={{
                      backgroundColor: order.statusBg,
                      color: order.statusText,
                    }}
                  >
                    {order.status}
                  </span>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[12px]"
                    style={{
                      backgroundColor: order.paymentBg,
                      color: order.paymentText,
                    }}
                  >
                    {order.payment}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
