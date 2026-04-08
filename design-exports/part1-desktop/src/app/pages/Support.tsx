import { useState } from "react";
import { MessageCircle, Send, Paperclip } from "lucide-react";
import { Badge } from "../components/Badge";

const mockTickets = [
  { id: '#PLZ-T001', title: 'Commande non recue', status: 'En cours', statusVariant: 'blue' as const, date: 'Hier 09:14', orderId: '#PLZ-038' },
  { id: '#PLZ-T002', title: 'Probleme de paiement', status: 'Resolu', statusVariant: 'green' as const, date: 'Hier' },
  { id: '#PLZ-T003', title: 'Bug sur la plateforme', status: 'En attente', statusVariant: 'gray' as const, date: 'Il y a 5j' },
];

const mockMessages = [
  { from: 'plaza', text: "Bonjour ! Nous avons recu votre demande concernant #PLZ-038. Pouvez-vous decrire le probleme ?", time: '09:15' },
  { from: 'merchant', text: "Le client dit qu'il n'a pas recu sa commande mais le statut dit Livree.", time: '09:20' },
  { from: 'plaza', text: "Merci. Nous allons contacter le livreur et revenir vers vous dans 2 heures.", time: '09:25' },
];

export function Support() {
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(mockTickets[0]);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1040px] mx-auto p-8">
        <div className="flex gap-6 h-[calc(100vh-128px)]">
          {/* Left Panel - Ticket List */}
          <div className="w-[320px] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-[#1C1917]">Support Plaza</h2>
              <button className="h-9 px-3 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors">
                Nouveau ticket
              </button>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto">
              {mockTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b border-[#F3F4F6] cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[13px] font-bold text-[#1C1917]">{ticket.id}</span>
                    <Badge variant={ticket.statusVariant}>{ticket.status}</Badge>
                  </div>
                  <div className="text-[13px] text-[#1C1917] truncate mb-1">{ticket.title}</div>
                  <div className="text-[11px] text-[#A8A29E]">{ticket.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-[#1C1917]">
                      {selectedTicket.id} — {selectedTicket.title}
                    </span>
                    <Badge variant={selectedTicket.statusVariant}>{selectedTicket.status}</Badge>
                  </div>
                </div>

                {/* Context Card */}
                {selectedTicket.orderId && (
                  <div className="m-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-[#78716C]">Commande liee: </span>
                        <a href={`/dashboard/commandes?order=${selectedTicket.orderId}`} className="text-[#2563EB] hover:underline">
                          {selectedTicket.orderId}
                        </a>
                      </div>
                      <div className="text-[#78716C]">
                        Ouvert le: 5 avril 2026
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Date Pill */}
                  <div className="flex justify-center">
                    <span className="text-xs text-[#78716C] bg-[#F5F5F4] px-3 py-1 rounded-full">
                      Aujourd'hui
                    </span>
                  </div>

                  {mockMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.from === 'merchant' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${msg.from === 'merchant' ? 'flex-row-reverse' : ''}`}>
                        {msg.from === 'plaza' && (
                          <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            P
                          </div>
                        )}
                        <div>
                          <div
                            className={`px-4 py-2.5 rounded-lg text-sm ${
                              msg.from === 'merchant'
                                ? 'bg-[#2563EB] text-white'
                                : 'bg-[#F5F5F4] text-[#1C1917]'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div className={`text-xs text-[#A8A29E] mt-1 ${msg.from === 'merchant' ? 'text-right' : ''}`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Bar */}
                <div className="h-16 border-t border-[#E2E8F0] px-4 flex items-center gap-3 flex-shrink-0">
                  <button className="p-2 text-[#78716C] hover:text-[#2563EB] transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Ecrivez un message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-[#2563EB] text-white rounded-full flex items-center justify-center hover:bg-[#1d4ed8] transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 text-[#E2E8F0] mx-auto mb-4" />
                  <p className="text-base text-[#78716C]">Selectionnez un ticket ou creez-en un nouveau</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
