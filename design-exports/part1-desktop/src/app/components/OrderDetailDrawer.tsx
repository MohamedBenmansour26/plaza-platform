import { X, User, Phone, MapPin, CheckCircle, Circle } from "lucide-react";
import { Badge } from "./Badge";
import { toast } from "sonner";

interface OrderDetailDrawerProps {
  order: any;
  onClose: () => void;
}

export function OrderDetailDrawer({ order, onClose }: OrderDetailDrawerProps) {
  const handleConfirm = () => {
    toast.success('Commande confirmee !');
    onClose();
  };

  const handleCancel = () => {
    if (confirm('Etes-vous sur de vouloir annuler cette commande ?')) {
      toast.success('Commande annulee');
      onClose();
    }
  };

  const handleMarkAsDispatched = () => {
    toast.success('Commande marquee comme expediee !');
    onClose();
  };

  const handleMarkAsDelivered = () => {
    toast.success('Commande marquee comme livree !');
    onClose();
  };

  const subtotal = order.items.reduce((sum: number, item: any) => {
    const price = parseFloat(item.price.replace(' MAD', ''));
    return sum + price;
  }, 0);

  const delivery = 29;
  const total = subtotal + delivery;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-[560px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-[#1C1917]">{order.id}</span>
            <Badge variant={order.statusVariant}>{order.statusLabel}</Badge>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          <div className="flex gap-4">
            {/* Left Column */}
            <div className="flex-1 space-y-3">
              {/* Client Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase mb-2">Client</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#78716C]" />
                    <span className="text-sm font-semibold text-[#1C1917]">{order.clientFull}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#78716C]" />
                    <a href={`tel:${order.phone}`} className="text-sm text-[#2563EB]" dir="ltr">
                      {order.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#78716C] mt-0.5" />
                    <span className="text-sm text-[#78716C]">{order.address}</span>
                  </div>
                </div>
              </div>

              {/* Articles Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase mb-2">Articles</div>
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[#F5F5F4]"></div>
                      <div className="flex-1 text-sm font-medium text-[#1C1917]">
                        {item.name}
                      </div>
                      <div className="text-sm text-[#78716C]">x{item.qty}</div>
                      <div className="text-sm font-medium text-[#1C1917]">{item.price}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E2E8F0] my-3"></div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78716C]">Sous-total</span>
                    <span className="text-[#1C1917]">{subtotal} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78716C]">Livraison</span>
                    <span className="text-[#E8632A]">{delivery} MAD</span>
                  </div>
                </div>

                <div className="border-t-2 border-[#E2E8F0] my-3"></div>

                <div className="flex justify-between">
                  <span className="text-base font-semibold text-[#1C1917]">Total</span>
                  <span className="text-lg font-semibold text-[#1C1917]">{total} MAD</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-[200px] space-y-3">
              {/* Status Timeline */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase mb-3">Livraison</div>
                <div className="space-y-6">
                  {/* Done */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      {order.status !== 'cancelled' && <div className="w-0.5 h-6 bg-[#E2E8F0] my-1"></div>}
                    </div>
                    <div>
                      <div className="text-[13px] text-[#1C1917]">Commande recue</div>
                      <div className="text-[11px] text-[#A8A29E]">Il y a 2h</div>
                    </div>
                  </div>

                  {/* Current or Done */}
                  {order.status === 'pending' && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full border-2 border-[#2563EB] flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></div>
                        </div>
                        <div className="w-0.5 h-6 bg-[#E2E8F0] my-1"></div>
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#2563EB]">En attente</div>
                      </div>
                    </div>
                  )}

                  {(order.status === 'confirmed' || order.status === 'dispatched' || order.status === 'delivered') && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <div className="w-0.5 h-6 bg-[#E2E8F0] my-1"></div>
                      </div>
                      <div>
                        <div className="text-[13px] text-[#1C1917]">Confirmee</div>
                        <div className="text-[11px] text-[#A8A29E]">Il y a 1h</div>
                      </div>
                    </div>
                  )}

                  {/* Future steps */}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <Circle className="w-5 h-5 text-[#A8A29E] flex-shrink-0" />
                          <div className="w-0.5 h-6 bg-[#E2E8F0] my-1"></div>
                        </div>
                        <div className="text-[13px] text-[#A8A29E]">Expediee</div>
                      </div>
                      <div className="flex gap-3">
                        <Circle className="w-5 h-5 text-[#A8A29E] flex-shrink-0" />
                        <div className="text-[13px] text-[#A8A29E]">Livree</div>
                      </div>
                    </>
                  )}

                  {order.status === 'dispatched' && (
                    <>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full border-2 border-[#E8632A] flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-[#E8632A] animate-pulse"></div>
                          </div>
                          <div className="w-0.5 h-6 bg-[#E2E8F0] my-1"></div>
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[#E8632A]">Expediee</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Circle className="w-5 h-5 text-[#A8A29E] flex-shrink-0" />
                        <div className="text-[13px] text-[#A8A29E]">Livree</div>
                      </div>
                    </>
                  )}

                  {order.status === 'delivered' && (
                    <>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <div className="w-0.5 h-6 bg-[#E2E8F0] my-1"></div>
                        </div>
                        <div>
                          <div className="text-[13px] text-[#1C1917]">Expediee</div>
                          <div className="text-[11px] text-[#A8A29E]">Hier</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="text-[13px] text-[#1C1917]">Livree</div>
                          <div className="text-[11px] text-[#A8A29E]">Aujourd'hui</div>
                        </div>
                      </div>
                    </>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="flex gap-3">
                      <X className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
                      <div className="text-[13px] text-[#DC2626]">Annulee</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-4">
                <div className="text-[13px] text-[#78716C] uppercase mb-2">Paiement</div>
                <div className="flex items-center gap-2">
                  <Badge variant={order.paymentVariant}>{order.payment}</Badge>
                </div>
                <p className="text-[13px] text-[#78716C] mt-2">
                  {order.payment === 'COD' ? 'Paiement a la livraison' : 'Paiement par ' + order.payment}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-18 border-t border-[#E2E8F0] px-6 py-4 flex gap-3 flex-shrink-0 bg-white">
          {order.status === 'pending' && (
            <>
              <button
                onClick={handleConfirm}
                className="flex-1 h-10 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                Confirmer
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 h-10 border-[1.5px] border-[#DC2626] text-[#DC2626] bg-white rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors"
              >
                Annuler
              </button>
            </>
          )}

          {order.status === 'confirmed' && (
            <button
              onClick={handleMarkAsDispatched}
              className="flex-1 h-10 bg-[#E8632A] text-white rounded-lg text-sm font-medium hover:bg-[#d45424] transition-colors"
            >
              Marquer comme expediee
            </button>
          )}

          {order.status === 'dispatched' && (
            <button
              onClick={handleMarkAsDelivered}
              className="flex-1 h-10 bg-[#16A34A] text-white rounded-lg text-sm font-medium hover:bg-[#158a3c] transition-colors"
            >
              Marquer comme livree
            </button>
          )}

          {(order.status === 'delivered' || order.status === 'cancelled') && (
            <div className="flex-1 text-center text-sm text-[#78716C]">
              {order.status === 'delivered' ? 'Commande terminee' : 'Commande annulee'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
