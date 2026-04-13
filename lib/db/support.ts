/**
 * lib/db/support.ts — Support ticket query functions.
 *
 * Live schema (07 Apr 2026):
 *   support_tickets: id, ticket_number, merchant_id, order_id, subject,
 *                    category, status, created_at, updated_at
 *   support_messages: id, ticket_id, sender, content, attachment_url, created_at
 *
 * ticket_number format: PLZ-T{padded counter} generated on insert.
 * RLS on both tables — merchant sees only their own tickets/messages.
 */

import { createClient } from '@/lib/supabase/server';
import type { TicketCategory, TicketStatus } from '@/types/supabase';

// ─── Domain types ────────────────────────────────────────────────────────────

export type { TicketCategory, TicketStatus };

export type SupportMessage = {
  id: string;
  ticket_id: string;
  sender: 'merchant' | 'plaza';
  content: string;
  attachment_url: string | null;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  ticket_number: string;
  merchant_id: string;
  order_id: string | null;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  /** Last message content — used for list preview */
  preview?: string | null;
  messages?: SupportMessage[];
};

export type CreateTicketData = {
  order_id?: string;
  subject: string;
  category: TicketCategory;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate a ticket number of the form PLZ-T001.
 * Uses total count — safe at MVP scale (low concurrency).
 */
async function generateTicketNumber(): Promise<string> {
  const supabase = await createClient();
  // PLZ-048: head:true returns no rows — 'id' is the minimal valid column selector.
  const { count, error } = await supabase
    .from('support_tickets')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(`generateTicketNumber: ${error.message}`);
  const next = (count ?? 0) + 1;
  return `PLZ-T${String(next).padStart(3, '0')}`;
}

// ─── Query functions ─────────────────────────────────────────────────────────

/**
 * Fetch all support tickets for a merchant, newest-first.
 * Includes the latest message content as a preview string.
 */
export async function getTickets(
  merchantId: string,
): Promise<SupportTicket[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      id, ticket_number, merchant_id, order_id, subject,
      category, status, created_at, updated_at,
      support_messages (
        id, content, sender, attachment_url, created_at
      )
    `)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .returns<(Omit<SupportTicket, 'preview' | 'messages'> & {
      support_messages: SupportMessage[];
    })[]>();

  if (error) throw new Error(`getTickets: ${error.message}`);

  return (data ?? []).map((row) => {
    const msgs = (row.support_messages ?? []).sort(
      (a, b) => a.created_at.localeCompare(b.created_at),
    );
    return {
      id: row.id,
      ticket_number: row.ticket_number,
      merchant_id: row.merchant_id,
      order_id: row.order_id,
      subject: row.subject,
      category: row.category,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      preview: msgs[msgs.length - 1]?.content ?? null,
    };
  });
}

/**
 * Fetch a single ticket with all messages (oldest-first).
 * Returns null if not found or not owned by merchantId.
 */
export async function getTicketById(
  ticketId: string,
  merchantId: string,
): Promise<SupportTicket | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      id, ticket_number, merchant_id, order_id, subject,
      category, status, created_at, updated_at,
      support_messages (
        id, ticket_id, sender, content, attachment_url, created_at
      )
    `)
    .eq('id', ticketId)
    .eq('merchant_id', merchantId)
    .maybeSingle<Omit<SupportTicket, 'preview' | 'messages'> & {
      support_messages: SupportMessage[];
    }>();

  if (error) throw new Error(`getTicketById: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    ticket_number: data.ticket_number,
    merchant_id: data.merchant_id,
    order_id: data.order_id,
    subject: data.subject,
    category: data.category,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    messages: (data.support_messages ?? []).sort(
      (a, b) => a.created_at.localeCompare(b.created_at),
    ),
  };
}

/**
 * Create a new support ticket. Generates a unique ticket_number.
 */
export async function createTicket(
  merchantId: string,
  data: CreateTicketData,
): Promise<SupportTicket> {
  const ticketNumber = await generateTicketNumber();
  const supabase = await createClient();

  // Supabase JS v2: .insert() param collapses to `never` — same regression as .update().
  const { data: inserted, error } = await supabase
    .from('support_tickets')
    .insert({
      ticket_number: ticketNumber,
      merchant_id: merchantId,
      order_id: data.order_id ?? null,
      subject: data.subject,
      category: data.category,
    } as never)
    .select('id, ticket_number, merchant_id, order_id, subject, category, status, created_at, updated_at')
    .single<SupportTicket>();

  if (error) throw new Error(`createTicket: ${error.message}`);
  return { ...inserted, messages: [] };
}

/**
 * Fetch all messages for a ticket, oldest-first.
 */
export async function getTicketMessages(
  ticketId: string,
): Promise<SupportMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('support_messages')
    .select('id, ticket_id, sender, content, attachment_url, created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
    .returns<SupportMessage[]>();

  if (error) throw new Error(`getTicketMessages: ${error.message}`);
  return data ?? [];
}

/**
 * Send a message on a ticket (merchant side).
 */
export async function sendMessage(
  ticketId: string,
  content: string,
  // merchantId reserved for future ownership check via RLS
): Promise<void> {
  const supabase = await createClient();

  // Supabase JS v2: same .insert() never regression.
  const { error } = await supabase
    .from('support_messages')
    .insert({
      ticket_id: ticketId,
      sender: 'merchant' as const,
      content,
    } as never);

  if (error) throw new Error(`sendMessage: ${error.message}`);
}
