'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Copy, CheckCheck, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../_components/CartProvider';
import { getDeliveryFee } from '../_lib/deliveryUtils';
import type { CartItem } from '../_components/CartProvider';

interface ConfirmedOrder {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryDisplayDate?: string;
  deliveryDisplayTime?: string;
  paymentMethod?: string;
  orderNumber?: string;
  merchantId?: string;
  deliveryFeeThreshold?: number | null;
  merchantSlug?: string;
}

export default function ConfirmationPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [order, setOrder] = useState<ConfirmedOrder>({});
  const [animate, setAnimate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snapshotItems, setSnapshotItems] = useState<CartItem[]>([]);
  const [snapshotTotal, setSnapshotTotal] = useState(0);

  useEffect(() => {
    setSnapshotItems([...items]);
    setSnapshotTotal(total);
    const stored = sessionStorage.getItem('plaza_pending_order');
    if (stored) {
      try {
        setOrder(JSON.parse(stored) as ConfirmedOrder);
      } catch {
        // ignore
      }
    }
    clearCart();
    sessionStorage.removeItem('plaza_pending_order');
    setTimeout(() => setAnimate(true), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderNumber = order.orderNumber ?? 'PLZ-???';
  const deliveryFee = getDeliveryFee(snapshotTotal, order.deliveryFeeThreshold ?? undefined);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderNumber);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = orderNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch {
          // ignore
        }
        textArea.remove();
      }
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="bg-[#16A34A] h-28 -mx-4 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: animate ? 1 : 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: animate ? 1 : 0 }}
              transition={{ delay: 0.4 }}
            >
              <Check className="w-10 h-10 text-[#16A34A]" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>

        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bold text-[26px]"
          >
            Commande confirmée !
          </motion.h1>

          {order.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-[15px] text-[#78716C]"
            >
              Merci, <span className="font-medium text-[#1C1917]">{order.name}</span> !
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-5 border-2 border-[#2563EB] shadow-sm"
          >
            <div className="text-[13px] text-[#78716C] mb-2 font-medium">
              📋 Votre numéro de commande
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-bold text-[28px] text-[#2563EB] tracking-wide">
                {orderNumber}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCheck className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <Copy className="w-5 h-5 text-[#78716C]" />
                )}
              </button>
            </div>
            <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg px-4 py-3">
              <p className="text-[13px] text-[#92400E] font-medium">
                ⚠️ Conservez ce numéro pour suivre votre commande
              </p>
            </div>
          </motion.div>

          {/* TODO: show customer_pin here after schema migration */}

          {order.paymentMethod === 'cash' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-start gap-3 p-4 bg-[#F0FDF4] border border-[#16A34A]/30 rounded-xl"
            >
              <svg
                className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[14px] text-[#78716C]">
                Vous paierez <span className="font-semibold text-[#1C1917]">{snapshotTotal + deliveryFee} MAD</span> en espèces à la livraison.
              </p>
            </motion.div>
          )}

          {order.paymentMethod === 'card-delivery' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-start gap-3 p-4 bg-[#F0FDF4] border border-[#16A34A]/30 rounded-xl"
            >
              <svg
                className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[14px] text-[#78716C]">
                Vous paierez <span className="font-semibold text-[#1C1917]">{snapshotTotal + deliveryFee} MAD</span> par carte à la livraison.
              </p>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[15px] text-[#78716C] px-4"
          >
            Nous vous contacterons dans les{' '}
            <span className="font-medium text-[#1C1917]">30 minutes</span> pour confirmer la
            livraison.
          </motion.p>

          {order.deliveryDisplayDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-[14px] font-medium mt-3"
            >
              <Clock className="w-4 h-4" />
              Livraison prévue le {order.deliveryDisplayDate}
              {order.deliveryDisplayTime ? ` · ${order.deliveryDisplayTime}` : ''}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-5 border border-[#E2E8F0]"
        >
          <h2 className="font-bold text-[16px] mb-4">Résumé de commande</h2>
          <div className="space-y-3 mb-4">
            {snapshotItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{item.name}</p>
                  <p className="text-[13px] text-[#78716C]">Qté {item.quantity}</p>
                </div>
                <span className="text-[14px] font-medium">
                  {item.price * item.quantity} MAD
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Sous-total</span>
              <span className="font-medium">{snapshotTotal} MAD</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-[#78716C]">Livraison</span>
              <span
                className={deliveryFee === 0 ? 'text-[#16A34A] font-medium' : 'font-medium'}
              >
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee} MAD`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0] text-[15px]">
              <span className="font-bold">Total</span>
              <span className="font-bold">{snapshotTotal + deliveryFee} MAD</span>
            </div>
            {order.address && (
              <div className="flex items-start gap-2 text-[13px] text-[#78716C] pt-2 mt-2 border-t border-[#E2E8F0]">
                <svg
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  {order.address}
                  {order.city ? `, ${order.city}` : ''}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push(`/store/${slug}/commande/${orderNumber}`)}
            className="w-full h-12 bg-[#2563EB] text-white rounded-lg font-medium text-[15px] hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            Suivre ma commande
          </button>

          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="w-full h-12 border border-[#E2E8F0] text-[#78716C] rounded-lg font-medium text-[15px] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            Retour à la boutique
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
