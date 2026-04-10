import { notFound } from 'next/navigation';
import { getMerchantBySlug, getOrderByNumber } from '../../actions';
import { OrderStatusClient } from '../../_components/OrderStatusClient';

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function OrderStatusPage({ params }: Props) {
  const { slug, id } = await params;
  const [merchant, order] = await Promise.all([
    getMerchantBySlug(slug),
    getOrderByNumber(id),
  ]);
  if (!order) notFound();
  return (
    <OrderStatusClient order={order} merchantPhone={merchant?.phone ?? null} />
  );
}
