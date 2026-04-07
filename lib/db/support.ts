/**
 * lib/db/support.ts — Support ticket query functions.
 *
 * ⚠️  SCHEMA BLOCKER — FLAGGED TO OTHMANE
 * ══════════════════════════════════════════════════════════════════════════
 * The `support_tickets` and `support_messages` tables do NOT exist in the
 * current Supabase schema (types/supabase.ts — migration 20260406000000).
 *
 * Required new tables (needs a PLZ migration from Mehdi + founder approval):
 *
 *   support_tickets:
 *     id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *     merchant_id  uuid NOT NULL REFERENCES merchants(id)
 *     order_id     uuid REFERENCES orders(id)
 *     subject      text NOT NULL
 *     category     text NOT NULL CHECK (category IN ('order','payment','delivery','account','other'))
 *     description  text NOT NULL
 *     status       text NOT NULL DEFAULT 'open'
 *                    CHECK (status IN ('open','in_progress','resolved'))
 *     created_at   timestamptz NOT NULL DEFAULT now()
 *
 *   support_messages:
 *     id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *     ticket_id    uuid NOT NULL REFERENCES support_tickets(id)
 *     sender       text NOT NULL CHECK (sender IN ('merchant','plaza'))
 *     content      text NOT NULL
 *     sent_at      timestamptz NOT NULL DEFAULT now()
 *
 *   RLS required on both tables.
 *
 * Until that migration is approved and merged, all functions below return
 * empty/null values and log a warning. The UI should handle the empty state.
 * ══════════════════════════════════════════════════════════════════════════
 */

// ─── Domain types ────────────────────────────────────────────────────────────

export type SupportTicketCategory =
  | 'order'
  | 'payment'
  | 'delivery'
  | 'account'
  | 'other';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export type SupportMessage = {
  id: string;
  ticket_id: string;
  sender: 'merchant' | 'plaza';
  content: string;
  sent_at: string;
};

export type SupportTicket = {
  id: string;
  merchant_id: string;
  order_id: string | null;
  subject: string;
  category: SupportTicketCategory;
  description: string;
  status: SupportTicketStatus;
  created_at: string;
  /** Latest message preview (for ticket list) */
  preview?: string;
  messages?: SupportMessage[];
};

export type CreateTicketData = {
  order_id?: string;
  subject: string;
  category: SupportTicketCategory;
  description: string;
};

// ─── Schema availability flag ────────────────────────────────────────────────

const SCHEMA_READY = false; // flip to true once PLZ migration is merged

function warnMissingSchema(fn: string): void {
  // Server-side only — safe to log
  console.warn(
    `[support.ts] ${fn}: support_tickets schema not deployed. ` +
      'Returning stub data. Merge the support schema migration to enable.',
  );
}

// ─── Query functions ─────────────────────────────────────────────────────────

/**
 * Fetch all support tickets for a merchant, newest-first.
 */
export async function getTickets(
  _merchantId: string,
): Promise<SupportTicket[]> {
  if (!SCHEMA_READY) {
    warnMissingSchema('getTickets');
    return [];
  }
  // TODO: implement once schema is deployed
  // const supabase = await createClient()
  // const { data, error } = await supabase
  //   .from('support_tickets')
  //   .select('*, support_messages(id, content, sent_at, sender)')
  //   .eq('merchant_id', _merchantId)
  //   .order('created_at', { ascending: false })
  // ...
  return [];
}

/**
 * Fetch a single ticket with all messages.
 */
export async function getTicketById(
  _ticketId: string,
  _merchantId: string,
): Promise<SupportTicket | null> {
  if (!SCHEMA_READY) {
    warnMissingSchema('getTicketById');
    return null;
  }
  return null;
}

/**
 * Create a new support ticket.
 */
export async function createTicket(
  _merchantId: string,
  _data: CreateTicketData,
): Promise<SupportTicket> {
  if (!SCHEMA_READY) {
    warnMissingSchema('createTicket');
    throw new Error(
      'Support tickets are not available yet. The schema migration is pending founder approval.',
    );
  }
  throw new Error('Not implemented');
}

/**
 * Fetch all messages for a ticket.
 */
export async function getTicketMessages(
  _ticketId: string,
): Promise<SupportMessage[]> {
  if (!SCHEMA_READY) {
    warnMissingSchema('getTicketMessages');
    return [];
  }
  return [];
}

/**
 * Send a message on a ticket (merchant side).
 */
export async function sendMessage(
  _ticketId: string,
  _content: string,
  _merchantId: string,
): Promise<void> {
  if (!SCHEMA_READY) {
    warnMissingSchema('sendMessage');
    throw new Error(
      'Support tickets are not available yet. The schema migration is pending founder approval.',
    );
  }
}
