import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryById } from '@/lib/db/driver';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const driver = await getDriverProfile(user.id);
  if (!driver) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const delivery = await getDeliveryById(params.id, driver.id);
  if (!delivery) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json(delivery);
}
