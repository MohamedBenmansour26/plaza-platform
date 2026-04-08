'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  createTicket,
  sendMessage,
  getTicketMessages,
  type CreateTicketData,
  type SupportMessage,
} from '@/lib/db/support';
import type { Merchant } from '@/types/supabase';

async function getMerchantId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<Pick<Merchant, 'id'>>();

  if (!data) redirect('/onboarding');
  return data.id;
}

/** Send a merchant reply on a ticket. */
export async function sendMessageAction(
  ticketId: string,
  content: string,
): Promise<void> {
  await getMerchantId(); // auth guard
  await sendMessage(ticketId, content);
  revalidatePath('/dashboard/support');
}

/** Create a new support ticket, optionally with a first message (description). */
export async function createTicketAction(
  data: CreateTicketData,
  description: string,
): Promise<{ id: string; ticket_number: string }> {
  const merchantId = await getMerchantId();
  const ticket = await createTicket(merchantId, data);
  if (description.trim()) {
    await sendMessage(ticket.id, description.trim());
  }
  revalidatePath('/dashboard/support');
  return { id: ticket.id, ticket_number: ticket.ticket_number };
}

/** Fetch messages for a ticket (used from client components). */
export async function fetchTicketMessagesAction(
  ticketId: string,
): Promise<SupportMessage[]> {
  await getMerchantId(); // auth guard
  return getTicketMessages(ticketId);
}
