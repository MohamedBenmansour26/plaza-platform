import { useNavigate } from "react-router";
import { ShoppingBag, Banknote, Clock, CheckCircle, ExternalLink, Copy } from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { Badge } from "../components/Badge";
import { toast } from "sonner";
import { useState } from "react";

const recentOrders = [
  { id: '#PLZ-042', client: 'Fatima Z.', amount: '879 MAD', status: 'En attente', statusVariant: 'gray' as const, payment: 'COD', paymentVariant: 'gray' as const, time: '23 min' },
  { id: '#PLZ-041', client: 'Youssef E.', amount: '250 MAD', status: 'Confirmee', statusVariant: 'blue' as const, payment: 'Terminal', paymentVariant: 'blue' as const, time: '1h' },
  { id: '#PLZ-040', client: 'Meryem A.', amount: '1 450 MAD', status: 'Livree', statusVariant: 'green' as const, payment: 'COD', paymentVariant: 'gray' as const, time: '2h' },
  { id: '#PLZ-039', client: 'Khalid B.', amount: '600 MAD', status: 'Expediee', statusVariant: 'orange' as const, payment: 'Carte', paymentVariant: 'purple' as const, time: '3h' },
  { id: '#PLZ-038', client: 'Nadia T.', amount: '200 MAD', status: 'Annulee', statusVariant: 'red' as const, payment: 'COD', paymentVariant: 'gray' as const, time: '5h' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId);
    navigate(`/dashboard/commandes?order=${orderId}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://plaza.ma/fatima-store');
    toast.success('Lien copié !');
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1040px] mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1C1917]">Bonjour, Fatima !</h1>
          <p className="text-sm text-[#78716C] mt-1">Mardi, 7 avril 2026</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={ShoppingBag}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            value="12"
            label="Commandes aujourd'hui"
            trend="+3 vs hier"
            trendPositive={true}
          />
          <StatsCard
            icon={Banknote}
            iconBg="#FFF7ED"
            iconColor="#E8632A"
            value="1 840 MAD"
            label="Revenus aujourd'hui"
            trend="+15%"
            trendPositive={true}
          />
          <StatsCard
            icon={Clock}
            iconBg="#FFFBEB"
            iconColor="#D97706"
            value="3"
            label="En attente"
            trend="Action requise"
            onClick={() => navigate('/dashboard/commandes')}
          />
          <StatsCard
            icon={CheckCircle}
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            value="9"
            label="Livrees aujourd'hui"
            trend="100%"
            trendPositive={true}
          />
        </div>

        {/* Lower Section */}
        <div className="flex gap-6">
          {/* Recent Activity */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#1C1917] mb-4">Activite recente</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 flex items-center">
                <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Commande</div>
                <div className="w-[160px] text-[13px] font-medium text-[#78716C] uppercase">Client</div>
                <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Montant</div>
                <div className="w-[140px] text-[13px] font-medium text-[#78716C] uppercase">Statut</div>
                <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Paiement</div>
                <div className="flex-1 text-[13px] font-medium text-[#78716C] uppercase">Il y a</div>
              </div>

              {/* Table Rows */}
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="h-12 px-4 flex items-center border-b border-[#F3F4F6] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <div className="w-[120px] text-sm font-medium text-[#1C1917]">{order.id}</div>
                  <div className="w-[160px] text-sm text-[#1C1917]">{order.client}</div>
                  <div className="w-[120px] text-sm text-[#1C1917]">{order.amount}</div>
                  <div className="w-[140px]">
                    <Badge variant={order.statusVariant}>{order.status}</Badge>
                  </div>
                  <div className="w-[120px]">
                    <Badge variant={order.paymentVariant}>{order.payment}</Badge>
                  </div>
                  <div className="flex-1 text-sm text-[#78716C]">{order.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Store Link Card */}
          <div className="w-[320px]">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="text-[13px] text-[#78716C] uppercase mb-2">Votre boutique</div>
              <a
                href="https://plaza.ma/fatima-store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#2563EB] underline block mb-2 hover:opacity-80"
              >
                plaza.ma/fatima-store
              </a>
              <button
                onClick={() => window.open('https://plaza.ma/fatima-store', '_blank')}
                className="w-full h-9 border border-[#2563EB] text-[#2563EB] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Voir la boutique
              </button>

              <div className="my-4 border-t border-[#E2E8F0]"></div>

              <div className="w-[120px] h-[120px] bg-[#F5F5F4] rounded-lg mx-auto flex items-center justify-center mb-3">
                <div className="text-4xl text-[#A8A29E]">QR</div>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full h-9 border border-[#E2E8F0] text-[#1C1917] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copier le lien
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
