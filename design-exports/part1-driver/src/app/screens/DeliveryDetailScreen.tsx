import { useState } from 'react';
import { ArrowLeft, Store, MapPin, Phone, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useAppContext } from '../context/AppContext';

export const DeliveryDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deliveries } = useAppContext();
  const [showItems, setShowItems] = useState(false);

  const delivery = deliveries.find((d) => d.id === id);

  if (!delivery) {
    return <div>Livraison non trouvée</div>;
  }

  const statusLabel =
    delivery.status === 'waiting_pickup'
      ? 'À collecter'
      : delivery.status === 'in_delivery'
      ? 'En livraison'
      : 'Livré';

  const statusColor =
    delivery.status === 'waiting_pickup'
      ? { bg: '#FFF7ED', text: '#E8632A' }
      : { bg: '#EFF6FF', text: '#2563EB' };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: '#FAFAF9', maxWidth: '375px', margin: '0 auto' }}
    >
      {/* Top Bar */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" style={{ color: '#1C1917' }} />
        </button>
        <span className="text-base font-semibold" style={{ color: '#1C1917' }}>
          {delivery.orderNumber}
        </span>
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Map Placeholder */}
      <div
        className="w-full h-48 flex flex-col items-center justify-center"
        style={{ backgroundColor: '#E2E8F0' }}
      >
        <MapPin className="w-12 h-12 mb-2" style={{ color: '#78716C' }} />
        <span className="text-sm" style={{ color: '#78716C' }}>
          Carte de livraison
        </span>
      </div>

      {/* Merchant Section */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1C1917' }}>
            Collecte chez le marchand
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4" style={{ color: '#78716C' }} />
              <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                {delivery.merchantName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" style={{ color: '#78716C' }} />
              <span className="text-sm" style={{ color: '#78716C' }}>
                {delivery.merchantAddress}
              </span>
            </div>

            <a
              href={`tel:${delivery.merchantPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-3"
              style={{ color: '#2563EB' }}
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{delivery.merchantPhone}</span>
            </a>
          </div>

          <button
            className="w-full h-10 mt-3 rounded-lg border-2 font-medium text-sm"
            style={{ borderColor: '#2563EB', color: '#2563EB' }}
          >
            Ouvrir dans Maps
          </button>
        </div>
      </div>

      {/* Customer Section */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1C1917' }}>
            Livraison au client
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4" style={{ color: '#78716C' }} />
              <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                {delivery.customerName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" style={{ color: '#78716C' }} />
              <span className="text-sm" style={{ color: '#78716C' }}>
                {delivery.customerAddress}
              </span>
            </div>

            <a
              href={`tel:${delivery.customerPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-3"
              style={{ color: '#2563EB' }}
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{delivery.customerPhone}</span>
            </a>
          </div>

          <button
            className="w-full h-10 mt-3 rounded-lg border-2 font-medium text-sm"
            style={{ borderColor: '#2563EB', color: '#2563EB' }}
          >
            Ouvrir dans Maps
          </button>
        </div>
      </div>

      {/* Order Details Section */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1C1917' }}>
            Détails de la commande
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#78716C' }}>
                Montant total
              </span>
              <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                {delivery.amount} MAD
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#78716C' }}>
                Paiement
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: delivery.paymentMethod === 'cod' ? '#F3F4F6' : '#EFF6FF',
                  color: delivery.paymentMethod === 'cod' ? '#78716C' : '#2563EB',
                }}
              >
                {delivery.paymentMethod === 'cod' ? 'COD' : 'Terminal'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#78716C' }}>
                Articles
              </span>
              <span className="text-sm" style={{ color: '#78716C' }}>
                {delivery.items.length} articles
              </span>
            </div>

            {/* Expandable Items List */}
            <button
              onClick={() => setShowItems(!showItems)}
              className="flex items-center gap-1 text-sm mt-2"
              style={{ color: '#2563EB' }}
            >
              <span>Voir les articles ({delivery.items.length})</span>
              {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showItems && (
              <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: '#F1F5F9' }}>
                {delivery.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <span style={{ color: '#1C1917' }}>{item.name}</span>
                      <span style={{ color: '#78716C' }}> × {item.qty}</span>
                    </div>
                    <span style={{ color: '#78716C' }}>{item.price} MAD</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4"
        style={{ maxWidth: '375px', margin: '0 auto' }}
      >
        {delivery.status === 'waiting_pickup' ? (
          <button
            onClick={() => navigate(`/driver/livraisons/${delivery.id}/collecte`)}
            className="w-full h-12 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#E8632A' }}
          >
            Confirmer la collecte
          </button>
        ) : (
          <button
            onClick={() => navigate(`/driver/livraisons/${delivery.id}/livraison`)}
            className="w-full h-12 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#16A34A' }}
          >
            Confirmer la livraison
          </button>
        )}
      </div>
    </div>
  );
};
