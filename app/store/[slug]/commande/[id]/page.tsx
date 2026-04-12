import { notFound } from 'next/navigation';
import { getMerchantBySlug, getOrderById, getOrderByNumber } from '../../actions';
import { OrderStatusClient } from '../../_components/OrderStatusClient';

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

// UUID v4 pattern — used to distinguish order UUIDs from PLZ-XXX order numbers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderStatusPage({ params }: Props) {
  const { slug, id } = await params;
  const isUuid = UUID_REGEX.test(id);
  const [merchant, order] = await Promise.all([
    getMerchantBySlug(slug),
    isUuid ? getOrderById(id) : getOrderByNumber(id),
  ]);
  if (!order) notFound();
  return (
    <OrderStatusClient order={order} merchantPhone={merchant?.phone ?? null} />
  );
}
