import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Badge } from "../components/Badge";
import { OrderDetailDrawer } from "../components/OrderDetailDrawer";

const mockOrders = [
  { id: '#PLZ-042', client: 'Fatima Z.', clientFull: 'Fatima Zahra Benali', phone: '06 12 34 56 78', address: '12 Rue Hassan II, Casablanca', articles: 2, amount: '879 MAD', status: 'pending' as const, statusLabel: 'En attente', statusVariant: 'gray' as const, payment: 'COD', paymentVariant: 'gray' as const, date: '7 avr 2026', items: [{ name: "Robe d'ete", qty: 1, price: '250 MAD' }, { name: "Sac cuir", qty: 2, price: '300 MAD' }] },
  { id: '#PLZ-041', client: 'Youssef E.', clientFull: 'Youssef El Amrani', phone: '06 23 45 67 89', address: '45 Avenue Mohammed V, Rabat', articles: 1, amount: '250 MAD', status: 'confirmed' as const, statusLabel: 'Confirmee', statusVariant: 'blue' as const, payment: 'Terminal', paymentVariant: 'blue' as const, date: '7 avr 2026', items: [{ name: "Foulard soie", qty: 1, price: '250 MAD' }] },
  { id: '#PLZ-040', client: 'Meryem A.', clientFull: 'Meryem Alaoui', phone: '06 34 56 78 90', address: '78 Rue de Fes, Marrakech', articles: 5, amount: '1 450 MAD', status: 'dispatched' as const, statusLabel: 'Expediee', statusVariant: 'orange' as const, payment: 'COD', paymentVariant: 'gray' as const, date: '6 avr 2026', items: [{ name: "Robe d'ete", qty: 2, price: '700 MAD' }, { name: "Sandales", qty: 3, price: '750 MAD' }] },
  { id: '#PLZ-039', client: 'Khalid B.', clientFull: 'Khalid Benjelloun', phone: '06 45 67 89 01', address: '23 Boulevard Zerktouni, Casablanca', articles: 2, amount: '600 MAD', status: 'delivered' as const, statusLabel: 'Livree', statusVariant: 'green' as const, payment: 'Carte', paymentVariant: 'purple' as const, date: '6 avr 2026', items: [{ name: "Ceinture", qty: 2, price: '600 MAD' }] },
  { id: '#PLZ-038', client: 'Nadia T.', clientFull: 'Nadia Tazi', phone: '06 56 78 90 12', address: '67 Rue de Tanger, Agadir', articles: 1, amount: '200 MAD', status: 'cancelled' as const, statusLabel: 'Annulee', statusVariant: 'red' as const, payment: 'COD', paymentVariant: 'gray' as const, date: '5 avr 2026', items: [{ name: "Foulard", qty: 1, price: '200 MAD' }] },
  { id: '#PLZ-037', client: 'Hassan M.', clientFull: 'Hassan Mansouri', phone: '06 67 89 01 23', address: '89 Avenue Hassan II, Fes', articles: 3, amount: '450 MAD', status: 'pending' as const, statusLabel: 'En attente', statusVariant: 'gray' as const, payment: 'COD', paymentVariant: 'gray' as const, date: '5 avr 2026', items: [{ name: "Accessoires", qty: 3, price: '450 MAD' }] },
];

export function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId) {
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [searchParams]);

  const filters = [
    { id: 'all', label: 'Toutes', count: mockOrders.length },
    { id: 'pending', label: 'En attente', count: mockOrders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmees', count: mockOrders.filter(o => o.status === 'confirmed').length },
    { id: 'dispatched', label: 'Expediees', count: mockOrders.filter(o => o.status === 'dispatched').length },
    { id: 'delivered', label: 'Livrees', count: mockOrders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Annulees', count: mockOrders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = selectedFilter === 'all' 
    ? mockOrders 
    : mockOrders.filter(o => o.status === selectedFilter);

  const handleOrderClick = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setSearchParams({ order: order.id });
  };

  const handleCloseDrawer = () => {
    setSelectedOrder(null);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-surface relative">
      <div className="max-w-[1040px] mx-auto p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1C1917]">Commandes</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-[#78716C] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 flex items-center">
            <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">N° Commande</div>
            <div className="w-[160px] text-[13px] font-medium text-[#78716C] uppercase">Client</div>
            <div className="w-[100px] text-[13px] font-medium text-[#78716C] uppercase">Articles</div>
            <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Montant</div>
            <div className="w-[140px] text-[13px] font-medium text-[#78716C] uppercase">Statut</div>
            <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Paiement</div>
            <div className="w-[120px] text-[13px] font-medium text-[#78716C] uppercase">Date</div>
            <div className="w-20 text-[13px] font-medium text-[#78716C] uppercase">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOrderClick(order)}
              className="h-14 px-4 flex items-center border-b border-[#F3F4F6] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
            >
              <div className="w-[120px] text-sm font-medium text-[#1C1917]">{order.id}</div>
              <div className="w-[160px] text-sm text-[#1C1917]">{order.client}</div>
              <div className="w-[100px] text-sm text-[#78716C]">{order.articles} articles</div>
              <div className="w-[120px] text-sm text-[#1C1917]">{order.amount}</div>
              <div className="w-[140px]">
                <Badge variant={order.statusVariant}>{order.statusLabel}</Badge>
              </div>
              <div className="w-[120px]">
                <Badge variant={order.paymentVariant}>{order.payment}</Badge>
              </div>
              <div className="w-[120px] text-sm text-[#78716C]">{order.date}</div>
              <div className="w-20">
                <button className="text-sm text-[#2563EB] hover:underline">Voir</button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-base font-semibold text-[#1C1917] mb-2">Aucune commande</h3>
              <p className="text-sm text-[#78716C]">Il n'y a pas de commandes dans cette categorie</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}
