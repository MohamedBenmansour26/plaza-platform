'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MessageCircle, Send, Paperclip, Loader2, Plus } from 'lucide-react';
import { sendMessageAction, fetchTicketMessagesAction } from './actions';
import { NewTicketSheet } from './NewTicketSheet';
import type { SupportTicket, SupportMessage, TicketStatus } from '@/lib/db/support';

// ─── Ticket status badge ──────────────────────────────────────────────────────

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
  });

  if (isMe) {
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end max-w-[70%]">
          <div className="bg-[#2563EB] text-white px-4 py-2.5 rounded-xl rounded-tr-none text-sm">
            {msg.content}
          </div>
          <div className="text-[11px] text-[#A8A29E] mt-1">{time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 max-w-[70%]">
      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
        P
      </div>
      <div>
        <div className="text-[12px] text-[#78716C] mb-1">{plazaLabel}</div>
        <div className="bg-[#F5F5F4] text-[#1C1917] px-4 py-2.5 rounded-xl rounded-tl-none text-sm">
          {msg.content}
        </div>
        <div className="text-[11px] text-[#A8A29E] mt-1">{time}</div>
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

  const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string }> = {
    open:        { label: t('ticket_status_open'),        bg: '#F3F4F6', text: '#6B7280' },
    in_progress: { label: t('ticket_status_in_progress'), bg: '#EFF6FF', text: '#2563EB' },
    resolved:    { label: t('ticket_status_resolved'),    bg: '#F0FDF4', text: '#16A34A' },
    closed:      { label: t('ticket_status_closed'),      bg: '#F3F4F6', text: '#6B7280' },
  };

  return (
    <>
      {/* Header */}
      <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base font-semibold text-[#1C1917] truncate">
            {ticket.ticket_number} — {ticket.subject}
          </span>
          <TicketStatusPill {...STATUS_CONFIG[ticket.status]} />
        </div>
      </div>

      {/* Context card */}
      {ticket.order_id && (
        <div className="mx-4 mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-sm flex items-center gap-4">
          <span className="text-[#78716C]">
            {t('linked_order')}:{' '}
            <Link href={`/dashboard/commandes/${ticket.order_id}`} className="text-[#2563EB] hover:underline">
              {t('view_order')}
            </Link>
          </span>
          <span className="text-[#78716C]">
            {t('opened_on')}{' '}
            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-center">
          <span className="text-xs text-[#78716C] bg-[#F5F5F4] px-3 py-1 rounded-full">
            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>
        {messages.length === 0 && (
          <div className="text-center text-sm text-[#A8A29E] py-8">
            {t('no_messages')}
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} plazaLabel={plazaLabel} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply bar */}
      <div className="h-16 border-t border-[#E2E8F0] px-4 flex items-center gap-3 flex-shrink-0">
        <button
          disabled
          title={t('paperclip_tooltip')}
          className="p-2 text-[#E2E8F0] opacity-50 cursor-not-allowed"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder={t('reply_placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="w-10 h-10 bg-[#2563EB] text-white rounded-full flex items-center justify-center hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
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
  const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string }> = {
    open:        { label: t('ticket_status_open'),        bg: '#F3F4F6', text: '#6B7280' },
    in_progress: { label: t('ticket_status_in_progress'), bg: '#EFF6FF', text: '#2563EB' },
    resolved:    { label: t('ticket_status_resolved'),    bg: '#F0FDF4', text: '#16A34A' },
    closed:      { label: t('ticket_status_closed'),      bg: '#F3F4F6', text: '#6B7280' },
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

          {/* Left panel: ticket list */}
          <div className="w-[320px] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col flex-shrink-0">
            <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-[#1C1917]">{t('title')}</h2>
              <button
                onClick={() => setShowNewTicket(true)}
                className="h-9 px-3 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                {t('new_ticket')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
                  <p className="text-sm text-[#78716C]">{t('no_tickets')}</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`p-4 border-b border-[#F3F4F6] cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-[#F8FAFC]'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-[13px] font-bold text-[#1C1917]">
                        {ticket.ticket_number}
                      </span>
                      <TicketStatusPill {...STATUS_CONFIG[ticket.status]} />
                    </div>
                    <div className="text-[13px] text-[#1C1917] truncate mb-1">
                      {ticket.subject}
                    </div>
                    {ticket.preview && (
                      <div className="text-[12px] text-[#78716C] truncate mb-1">
                        {ticket.preview}
                      </div>
                    )}
                    <div className="text-[11px] text-[#A8A29E]">
                      {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel: chat or empty state */}
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col min-w-0">
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
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 text-[#E2E8F0] mx-auto mb-4" />
                  <p className="text-base text-[#78716C]">
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
          <h1 className="text-xl font-semibold text-[#1C1917]">{t('title')}</h1>
          <button
            onClick={() => setShowNewTicket(true)}
            className="h-9 px-3 bg-[#2563EB] text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-[#1d4ed8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('new_ticket_mobile')}
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm py-16 text-center">
            <MessageCircle className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#1C1917] mb-1">
              {t('no_tickets')}
            </h3>
            <p className="text-sm text-[#78716C]">
              {t('no_tickets_cta')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/support/${ticket.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[14px] font-semibold text-[#1C1917]">
                    {ticket.ticket_number}
                  </div>
                  <TicketStatusPill {...STATUS_CONFIG[ticket.status]} />
                </div>
                <div className="text-[14px] text-[#1C1917] mb-1 truncate">
                  {ticket.subject}
                </div>
                {ticket.preview && (
                  <div className="text-[12px] text-[#78716C] truncate mb-1">
                    {ticket.preview}
                  </div>
                )}
                <div className="text-[11px] text-[#A8A29E]">
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
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
