'use client';

import { useTransition, useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Paperclip, Loader2 } from 'lucide-react';
import { sendMessageAction } from '../actions';
import type { SupportTicket, SupportMessage, TicketStatus } from '@/lib/db/support';
import Link from 'next/link';
import { MOROCCO_TZ } from '@/lib/timezone';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  ticket: SupportTicket;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function TicketDetailClient({ ticket }: Props) {
  const t = useTranslations('support');
  const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string }> = {
    open:        { label: t('ticket_status_open'),        bg: '#F3F4F6', text: '#6B7280' },
    in_progress: { label: t('ticket_status_in_progress'), bg: 'color-mix(in srgb, var(--color-primary) 8%, white)', text: 'var(--color-primary)' },
    resolved:    { label: t('ticket_status_resolved'),    bg: '#F0FDF4', text: '#16A34A' },
    closed:      { label: t('ticket_status_closed'),      bg: '#F3F4F6', text: '#6B7280' },
  };
  const router = useRouter();
  const [isSending, startSending] = useTransition();
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>(ticket.messages ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!content.trim() || isSending) return;
    const text = content.trim();
    setContent('');

    // Optimistic add
    const optimistic: SupportMessage = {
      id: `opt-${Date.now()}`,
      ticket_id: ticket.id,
      sender: 'merchant',
      content: text,
      attachment_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startSending(async () => {
      await sendMessageAction(ticket.id, text);
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[480px] mx-auto flex flex-col h-screen">

        {/* Top bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-between border-b border-[#E2E8F0] flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={20} className="text-[#1C1917]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1C1917] flex-1 text-center truncate px-2">
            {ticket.subject}
          </h1>
          <span
            className="text-[12px] px-2 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Context card */}
        {ticket.order_id && (
          <div className="p-4 pb-0">
            <div className="bg-white rounded-xl shadow-sm p-3">
              <div className="text-[13px]">
                <span className="text-[#78716C]">{t('linked_order')}: </span>
                <Link
                  href={`/dashboard/commandes/${ticket.order_id}`}
                  className="hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {t('view_order')}
                </Link>
              </div>
              <div className="text-[13px] text-[#78716C] mt-1">
                {t('opened_on')}{' '}
                {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: MOROCCO_TZ,
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chat thread */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Date pill */}
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-[#F5F5F4] text-[#78716C] text-[12px] rounded-full">
              {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                timeZone: MOROCCO_TZ,
              })}
            </span>
          </div>

          {messages.length === 0 && (
            <div className="text-center text-sm text-[#A8A29E] py-8">
              {t('no_messages')}
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender === 'merchant';
            const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: MOROCCO_TZ,
            });

            if (isMe) {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="flex flex-col items-end max-w-[85%]">
                    <div className="bg-[var(--color-primary)] text-white rounded-xl rounded-tr-none p-3">
                      <p className="text-[14px]">{msg.content}</p>
                    </div>
                    <div className="text-[11px] text-[#A8A29E] mt-1">{time}</div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[14px] font-semibold flex-shrink-0">
                  P
                </div>
                <div className="flex-1">
                  <div className="text-[12px] text-[#78716C] mb-1">{t('plaza_support')}</div>
                  <div className="bg-[#F5F5F4] rounded-xl rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-[14px] text-[#1C1917]">{msg.content}</p>
                  </div>
                  <div className="text-[11px] text-[#A8A29E] mt-1">{time}</div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Reply bar */}
        <div className="bg-white border-t border-[#E2E8F0] p-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#78716C]">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder={t('reply_placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isSending}
              className="flex-1 h-10 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={handleSend}
              disabled={!content.trim() || isSending}
              className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
