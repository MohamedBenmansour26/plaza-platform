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

  // Merchant must resolve first — its id is used to gate the order query (P0 fix).
  const merchant = await getMerchantBySlug(slug);
  if (!merchant) notFound();

  const order = isUuid
    ? await getOrderById(id, merchant.id)
    : await getOrderByNumber(id, merchant.id);

  if (!order) notFound();
  return (
    <OrderStatusClient order={order} merchantPhone={merchant?.phone ?? null} />
  );
}
