import React from 'react';
import { BottomNav } from '../components/BottomNav';
import { MapPin, CheckCircle, Clock, Calendar } from 'lucide-react';

const completedDeliveries = [
  {
    id: 'c1',
    date: 'Aujourd\'hui, 7 avril',
    orderNumber: 'PZ-2835',
    customerName: 'Karim Benjelloun',
    neighborhood: 'Anfa',
    earnings: 35,
    amount: 280,
    paymentMethod: 'COD',
    time: '11:45',
    onTime: true
  },
  {
    id: 'c2',
    date: 'Aujourd\'hui, 7 avril',
    orderNumber: 'PZ-2828',
    customerName: 'Sara El Amrani',
    neighborhood: 'Gauthier',
    earnings: 35,
    amount: 0,
    paymentMethod: 'PAID',
    time: '10:20',
    onTime: true
  },
  {
    id: 'c3',
    date: 'Hier, 6 avril',
    orderNumber: 'PZ-2801',
    customerName: 'Youssef Tazi',
    neighborhood: 'Maarif',
    earnings: 35,
    amount: 520,
    paymentMethod: 'COD',
    time: '16:30',
    onTime: false
  },
  {
    id: 'c4',
    date: 'Hier, 6 avril',
    orderNumber: 'PZ-2796',
    customerName: 'Nadia Alaoui',
    neighborhood: 'Bourgogne',
    earnings: 35,
    amount: 0,
    paymentMethod: 'PAID',
    time: '14:15',
    onTime: true
  }
];

export const Historique: React.FC = () => {
  const groupedByDate = completedDeliveries.reduce((acc, delivery) => {
    if (!acc[delivery.date]) {
      acc[delivery.date] = [];
    }
    acc[delivery.date].push(delivery);
    return acc;
  }, {} as Record<string, typeof completedDeliveries>);

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-[20px] font-bold text-[#1C1917]">Historique</h1>
        <p className="text-[13px] text-[#78716C]">
          {completedDeliveries.length} livraisons complétées
        </p>
      </div>

      <div className="px-4 py-4">
        {Object.entries(groupedByDate).map(([date, deliveries]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[#78716C]" />
              <h2 className="text-[14px] font-semibold text-[#78716C]">{date}</h2>
            </div>

            <div className="space-y-3">
              {deliveries.map(delivery => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#16A34A] flex-shrink-0" />
                      <span className="text-[14px] font-semibold text-[#1C1917]">
                        {delivery.orderNumber}
                      </span>
                    </div>
                    <span className="text-[12px] text-[#78716C]">{delivery.time}</span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[13px] font-medium text-[#1C1917]">
                        {delivery.customerName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-[#78716C]" />
                        <span className="text-[12px] text-[#78716C]">
                          {delivery.neighborhood}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold text-[#16A34A]">
                        +{delivery.earnings} MAD
                      </p>
                      {delivery.paymentMethod === 'COD' && (
                        <p className="text-[11px] text-[#78716C]">
                          COD: {delivery.amount} MAD
                        </p>
                      )}
                    </div>
                  </div>

                  {delivery.onTime ? (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle size={14} className="text-[#16A34A]" />
                      <span className="text-[11px] text-[#16A34A]">
                        Livré dans le créneau
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-2">
                      <Clock size={14} className="text-[#D97706]" />
                      <span className="text-[11px] text-[#D97706]">
                        Livraison tardive
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] rounded-xl p-6 text-white mt-6">
          <h3 className="text-[14px] font-semibold mb-4">Cette semaine</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] opacity-90 mb-1">Livraisons</p>
              <p className="text-[24px] font-bold">12</p>
            </div>
            <div>
              <p className="text-[12px] opacity-90 mb-1">Gains totaux</p>
              <p className="text-[24px] font-bold">420 MAD</p>
            </div>
            <div>
              <p className="text-[12px] opacity-90 mb-1">Taux dans créneau</p>
              <p className="text-[20px] font-bold">92%</p>
            </div>
            <div>
              <p className="text-[12px] opacity-90 mb-1">Note moyenne</p>
              <p className="text-[20px] font-bold">4.8 ⭐</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
