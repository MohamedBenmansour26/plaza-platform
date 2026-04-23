'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MessageCircle, Send, Paperclip, Loader2, Plus } from 'lucide-react';
import { sendMessageAction, fetchTicketMessagesAction } from './actions';
import { NewTicketSheet } from './NewTicketSheet';
import type { SupportTicket, SupportMessage, TicketStatus } from '@/lib/db/support';
import { MOROCCO_TZ } from '@/lib/timezone';

// ─── Ticket status badge ──────────────────────────────────────────────────────
// Brief §2.8 status pills: neutral (muted), info (primary), success (success).
// `bg` and `text` are passed as CSS values (tokens or color-mix expressions),
// so this stays compatible with the per-status config map below.
function TicketStatusPill({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span
      className="text-[12px] px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}

// ─── Chat message bubble ──────────────────────────────────────────────────────

function MessageBubble({ msg, plazaLabel }: { msg: SupportMessage; plazaLabel: string }) {
  const isMe = msg.sender === 'merchant';
  const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MOROCCO_TZ,
  });

  // Merchant bubble → tenant primary; Plaza bubble → neutral muted surface.
  if (isMe) {
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end max-w-[70%]">
          <div className="bg-[var(--color-primary)] text-primary-foreground px-4 py-2.5 rounded-xl rounded-tr-none text-sm">
            {msg.content}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">{time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 max-w-[70%]">
      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
        P
      </div>
      <div>
        <div className="text-[12px] text-muted-foreground mb-1">{plazaLabel}</div>
        <div className="bg-muted text-foreground px-4 py-2.5 rounded-xl rounded-tl-none text-sm">
          {msg.content}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">{time}</div>
      </div>
    </div>
  );
}

// ─── Chat panel (desktop right panel) ─────────────────────────────────────────

function ChatPanel({
  ticket,
  messages,
  onSend,
  isSending,
  plazaLabel,
}: {
  ticket: SupportTicket;
  messages: SupportMessage[];
  onSend: (content: string) => void;
  isSending: boolean;
  plazaLabel: string;
}) {
  const t = useTranslations('support');
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!content.trim() || isSending) return;
    onSend(content.trim());
    setContent('');
  };

  // Brief §2.8 status pills — tokens via hsl(var(--*)) for tint + text.
  const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string }> = {
    open:        { label: t('ticket_status_open'),        bg: 'hsl(var(--muted))',                                     text: 'hsl(var(--muted-foreground))' },
    in_progress: { label: t('ticket_status_in_progress'), bg: 'color-mix(in srgb, var(--color-primary) 10%, white)',    text: 'var(--color-primary)' },
    resolved:    { label: t('ticket_status_resolved'),    bg: 'color-mix(in srgb, hsl(var(--success)) 10%, white)',     text: 'hsl(var(--success))' },
    closed:      { label: t('ticket_status_closed'),      bg: 'hsl(var(--muted))',                                     text: 'hsl(var(--muted-foreground))' },
  };

  return (
    <>
      {/* Header */}
      <div className="h-16 border-b border-border px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base font-semibold text-foreground truncate">
            {ticket.ticket_number} — {ticket.subject}
          </span>
          <TicketStatusPill {...STATUS_CONFIG[ticket.status]} />
        </div>
      </div>

      {/* Context card */}
      {ticket.order_id && (
        <div className="mx-4 mt-4 bg-muted/40 border border-border rounded-xl p-3 text-sm flex items-center gap-4">
          <span className="text-muted-foreground">
            {t('linked_order')}:{' '}
            <Link href={`/dashboard/commandes/${ticket.order_id}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
              {t('view_order')}
            </Link>
          </span>
          <span className="text-muted-foreground">
            {t('opened_on')}{' '}
            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: MOROCCO_TZ,
            })}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-center">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              timeZone: MOROCCO_TZ,
            })}
          </span>
        </div>
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            {t('no_messages')}
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} plazaLabel={plazaLabel} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply bar — brief §2.2 inputs. */}
      <div className="h-16 border-t border-border px-4 flex items-center gap-3 flex-shrink-0">
        <button
          disabled
          title={t('paperclip_tooltip')}
          className="p-2 text-muted-foreground opacity-50 cursor-not-allowed"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder={t('reply_placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          disabled={isSending}
          data-testid="merchant-support-reply-input"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="w-10 h-10 bg-[var(--color-primary)] text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-colors"
          data-testid="merchant-support-send-btn"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  tickets: SupportTicket[];
};

// ─── Main component ───────────────────────────────────────────────────────────

export function SupportClient({ tickets }: Props) {
  const t = useTranslations('support');
  // Brief §2.8 status pills — tokens via hsl(var(--*)) for tint + text.
  const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string }> = {
    open:        { label: t('ticket_status_open'),        bg: 'hsl(var(--muted))',                                     text: 'hsl(var(--muted-foreground))' },
    in_progress: { label: t('ticket_status_in_progress'), bg: 'color-mix(in srgb, var(--color-primary) 10%, white)',    text: 'var(--color-primary)' },
    resolved:    { label: t('ticket_status_resolved'),    bg: 'color-mix(in srgb, hsl(var(--success)) 10%, white)',     text: 'hsl(var(--success))' },
    closed:      { label: t('ticket_status_closed'),      bg: 'hsl(var(--muted))',                                     text: 'hsl(var(--muted-foreground))' },
  };
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    tickets[0] ?? null,
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, startSending] = useTransition();
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Load messages when selected ticket changes
  const selectedId = selectedTicket?.id;
  useEffect(() => {
    if (!selectedId) return;
    setLoadingMessages(true);
    fetchTicketMessagesAction(selectedId).then((msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
    });
  }, [selectedId]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setMessages([]);
  };

  const handleSend = (content: string) => {
    if (!selectedTicket) return;
    // Optimistic add
    const optimistic: SupportMessage = {
      id: `opt-${Date.now()}`,
      ticket_id: selectedTicket.id,
      sender: 'merchant',
      content,
      attachment_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startSending(async () => {
      await sendMessageAction(selectedTicket.id, content);
      // Reload for authoritative server state
      const fresh = await fetchTicketMessagesAction(selectedTicket.id);
      setMessages(fresh);
    });
  };

  const handleTicketCreated = (ticketId: string, _ticketNumber: string) => {
    // Reload will happen via revalidatePath in the action
    setShowNewTicket(false);
    // Optimistically find the new ticket or just dismiss
    void ticketId;
  };

  return (
    <>
      {/* ── Desktop two-panel layout ──────────────────────────────────── */}
      <div className="hidden md:block p-8 max-w-[1040px] mx-auto">
        <div className="flex gap-6" style={{ height: 'calc(100vh - 128px)' }}>

          {/* Left panel: ticket list — brief §2.3 card. */}
          <div className="w-[320px] bg-card rounded-xl shadow-card overflow-hidden flex flex-col flex-shrink-0">
            <div className="h-16 border-b border-border px-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
              <button
                onClick={() => setShowNewTicket(true)}
                className="h-9 px-3 bg-[var(--color-primary)] text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                data-testid="merchant-support-new-ticket-btn"
              >
                {t('new_ticket')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="w-10 h-10 text-border mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t('no_tickets')}</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`p-4 border-b border-border cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-muted/40'
                        : 'hover:bg-muted/40'
                    }`}
                    data-testid="merchant-support-ticket-row"
                    data-id={ticket.id}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-[13px] font-bold text-foreground">
                        {ticket.ticket_number}
                      </span>
                      <TicketStatusPill {...STATUS_CONFIG[ticket.status]} />
                    </div>
                    <div className="text-[13px] text-foreground truncate mb-1">
                      {ticket.subject}
                    </div>
                    {ticket.preview && (
                      <div className="text-[12px] text-muted-foreground truncate mb-1">
                        {ticket.preview}
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        timeZone: MOROCCO_TZ,
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel: chat or empty state */}
          <div className="flex-1 bg-card rounded-xl shadow-card overflow-hidden flex flex-col min-w-0">
            {selectedTicket && !loadingMessages ? (
              <ChatPanel
                ticket={selectedTicket}
                messages={messages}
                onSend={handleSend}
                isSending={isSending}
                plazaLabel={t('plaza_support')}
              />
            ) : loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 text-border mx-auto mb-4" />
                  <p className="text-base text-muted-foreground">
                    {t('select_ticket')}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Mobile ticket list ─────────────────────────────────────────── */}
      <div className="md:hidden p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">{t('title')}</h1>
          <button
            onClick={() => setShowNewTicket(true)}
            className="h-9 px-3 bg-[var(--color-primary)] text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-colors"
            data-testid="merchant-support-new-ticket-btn"
          >
            <Plus className="w-4 h-4" />
            {t('new_ticket_mobile')}
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-card rounded-xl shadow-card py-16 text-center">
            <MessageCircle className="w-10 h-10 text-border mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">
              {t('no_tickets')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('no_tickets_cta')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/support/${ticket.id}`}
                className="block bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
                data-testid="merchant-support-ticket-row"
                data-id={ticket.id}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[14px] font-semibold text-foreground">
                    {ticket.ticket_number}
                  </div>
                  <TicketStatusPill {...STATUS_CONFIG[ticket.status]} />
                </div>
                <div className="text-[14px] text-foreground mb-1 truncate">
                  {ticket.subject}
                </div>
                {ticket.preview && (
                  <div className="text-[12px] text-muted-foreground truncate mb-1">
                    {ticket.preview}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground">
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: MOROCCO_TZ,
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New ticket sheet */}
      {showNewTicket && (
        <NewTicketSheet
          onClose={() => setShowNewTicket(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </>
  );
}
