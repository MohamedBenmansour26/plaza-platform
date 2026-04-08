import { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';

export const HistoriqueScreen = () => {
  const { completedDeliveries } = useAppContext();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Mock history data
  const historyItems = [
    { id: '1', orderNumber: '#PLZ-042', merchant: 'Boutique Fatima', customer: 'Fatima Z.', amount: 35, time: '14:32', status: 'completed' },
    { id: '2', orderNumber: '#PLZ-041', merchant: 'Pâtisserie Benkirane', customer: 'Leila A.', amount: 35, time: '13:45', status: 'completed' },
    { id: '3', orderNumber: '#PLZ-040', merchant: 'Electronique Bennis', customer: 'Ahmed T.', amount: 42, time: '12:18', status: 'completed' },
    { id: '4', orderNumber: '#PLZ-039', merchant: 'Pharmacie Al Amal', customer: 'Samira E.', amount: 25, time: '11:30', status: 'completed' },
    { id: '5', orderNumber: '#PLZ-038', merchant: 'Boutique Fatima', customer: 'Omar B.', amount: 35, time: '10:52', status: 'completed' },
    { id: '6', orderNumber: '#PLZ-037', merchant: 'Librairie Al Kitab', customer: 'Yassine M.', amount: 28, time: '10:15', status: 'completed' },
    { id: '7', orderNumber: '#PLZ-036', merchant: 'Café Maure', customer: 'Hassan K.', amount: 18, time: '09:45', status: 'failed' },
    { id: '8', orderNumber: '#PLZ-035', merchant: 'Boulangerie Benkirane', customer: 'Nadia F.', amount: 32, time: '09:12', status: 'completed' },
  ];

  const completedCount = historyItems.filter(i => i.status === 'completed').length;
  const totalDistance = '48 km';
  const totalEarnings = historyItems.filter(i => i.status === 'completed').reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <div className="min-h-screen pb-20" style={{ backgroundColor: '#FAFAF9', maxWidth: '375px', margin: '0 auto' }}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-4 py-3">
          <h1 className="text-lg font-semibold" style={{ color: '#1C1917' }}>
            Historique
          </h1>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center gap-2 px-4 mt-3">
          <button
            onClick={() => setPeriod('today')}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: period === 'today' ? '#2563EB' : 'white',
              color: period === 'today' ? 'white' : '#78716C',
              border: period === 'today' ? 'none' : '1px solid #E2E8F0',
            }}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setPeriod('week')}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: period === 'week' ? '#2563EB' : 'white',
              color: period === 'week' ? 'white' : '#78716C',
              border: period === 'week' ? 'none' : '1px solid #E2E8F0',
            }}
          >
            Cette semaine
          </button>
          <button
            onClick={() => setPeriod('month')}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: period === 'month' ? '#2563EB' : 'white',
              color: period === 'month' ? 'white' : '#78716C',
              border: period === 'month' ? 'none' : '1px solid #E2E8F0',
            }}
          >
            Ce mois
          </button>
        </div>

        {/* Summary Card */}
        <div className="px-4 mt-3">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: '#78716C' }}>
                  Livraisons
                </p>
                <p className="text-lg font-semibold" style={{ color: '#1C1917' }}>
                  {completedCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: '#78716C' }}>
                  Distance
                </p>
                <p className="text-lg font-semibold" style={{ color: '#1C1917' }}>
                  {totalDistance}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: '#78716C' }}>
                  Gains
                </p>
                <p className="text-lg font-semibold" style={{ color: '#16A34A' }}>
                  {totalEarnings} MAD
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="px-4 mt-4">
          <div className="space-y-2">
            {historyItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
                {/* Status Icon */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: item.status === 'completed' ? '#F0FDF4' : '#FEF2F2',
                  }}
                >
                  {item.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#16A34A' }} />
                  ) : (
                    <XCircle className="w-5 h-5" style={{ color: '#DC2626' }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold mb-0.5" style={{ color: '#1C1917' }}>
                    {item.orderNumber}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#78716C' }}>
                    {item.merchant} → {item.customer}
                  </div>
                </div>

                {/* Amount & Time */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: item.status === 'completed' ? '#16A34A' : '#DC2626' }}
                  >
                    {item.status === 'completed' ? `${item.amount} MAD` : '0 MAD'}
                  </div>
                  <div className="text-xs" style={{ color: '#78716C' }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State (shown when no history) */}
        {historyItems.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 pt-16">
            <Clock className="w-16 h-16 mb-4" style={{ color: '#E2E8F0' }} />
            <h3 className="text-base font-semibold text-center" style={{ color: '#1C1917' }}>
              Aucune livraison ce jour
            </h3>
          </div>
        )}
      </div>

      <BottomNav />
    </>
  );
};
