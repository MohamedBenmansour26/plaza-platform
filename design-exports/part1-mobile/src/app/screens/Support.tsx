import { ArrowLeft, MessageCircle, Send, Paperclip } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Support() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const navigate = useNavigate();

  const tickets = [
    {
      id: "PLZ-T001",
      title: "Commande non reçue",
      status: "En cours",
      statusBg: "#EFF6FF",
      statusText: "#2563EB",
      preview: "Bonjour ! Nous avons reçu votre demande...",
      time: "Hier 09:14",
    },
    {
      id: "PLZ-T002",
      title: "Problème de paiement",
      status: "Résolu",
      statusBg: "#F0FDF4",
      statusText: "#16A34A",
      preview: "Le problème a été résolu avec succès...",
      time: "Hier",
    },
    {
      id: "PLZ-T003",
      title: "Bug sur la plateforme",
      status: "En attente",
      statusBg: "#F3F4F6",
      statusText: "#6B7280",
      preview: "Nous examinons votre signalement...",
      time: "Il y a 5j",
    },
  ];

  // Mobile view - show list or detail
  if (!selectedTicket) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pb-20">
        <div className="max-w-[375px] mx-auto">
          {/* Header */}
          <div className="bg-white px-4 py-4 border-b border-[#E2E8F0]">
            <h1 className="text-[18px] font-semibold text-[#1C1917] mb-3">
              Support Plaza
            </h1>
            <button className="w-full h-9 bg-[#2563EB] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors">
              Nouveau ticket
            </button>
          </div>

          {/* Ticket List */}
          <div className="p-4 space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[14px] font-semibold text-[#1C1917]">
                    {ticket.id} — {ticket.title}
                  </div>
                  <span
                    className="text-[12px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: ticket.statusBg,
                      color: ticket.statusText,
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-[#78716C] truncate flex-1">
                    {ticket.preview}
                  </div>
                  <div className="text-[12px] text-[#78716C] ml-2">
                    {ticket.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Ticket detail view
  const ticket = tickets.find((t) => t.id === selectedTicket);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[375px] mx-auto h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-between border-b border-[#E2E8F0]">
          <button
            onClick={() => setSelectedTicket(null)}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={20} className="text-[#1C1917]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1C1917] flex-1 text-center">
            {ticket?.title}
          </h1>
          <span
            className="text-[12px] px-2 py-1 rounded-full"
            style={{
              backgroundColor: ticket?.statusBg,
              color: ticket?.statusText,
            }}
          >
            {ticket?.status}
          </span>
        </div>

        {/* Context Card */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-3">
            <div className="text-[13px]">
              <span className="text-[#78716C]">Commande liée: </span>
              <a href="#" className="text-[#2563EB] hover:underline">
                #PLZ-038
              </a>
            </div>
            <div className="text-[13px] text-[#78716C] mt-1">
              Ouvert le: 5 avril 2026
            </div>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3">
          {/* Date Pill */}
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-[#F5F5F4] text-[#78716C] text-[12px] rounded-full">
              Aujourd'hui
            </span>
          </div>

          {/* Plaza Message */}
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[14px] font-semibold flex-shrink-0">
              P
            </div>
            <div className="flex-1">
              <div className="text-[12px] text-[#78716C] mb-1">
                Plaza Support
              </div>
              <div className="bg-[#F5F5F4] rounded-xl rounded-tl-none p-3 max-w-[85%]">
                <p className="text-[14px] text-[#1C1917]">
                  Bonjour ! Nous avons reçu votre demande concernant la commande
                  non reçue. Nous allons vérifier avec le livreur et revenir
                  vers vous rapidement.
                </p>
              </div>
              <div className="text-[11px] text-[#A8A29E] mt-1">09:14</div>
            </div>
          </div>

          {/* Merchant Message */}
          <div className="flex justify-end">
            <div className="flex-1 flex flex-col items-end">
              <div className="bg-[#2563EB] text-white rounded-xl rounded-tr-none p-3 max-w-[85%]">
                <p className="text-[14px]">
                  Bonjour, le client dit qu'il n'a pas reçu sa commande. Pouvez-vous m'aider ?
                </p>
              </div>
              <div className="text-[11px] text-[#A8A29E] mt-1">09:32</div>
            </div>
          </div>

          {/* Plaza Message */}
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[14px] font-semibold flex-shrink-0">
              P
            </div>
            <div className="flex-1">
              <div className="text-[12px] text-[#78716C] mb-1">
                Plaza Support
              </div>
              <div className="bg-[#F5F5F4] rounded-xl rounded-tl-none p-3 max-w-[85%]">
                <p className="text-[14px] text-[#1C1917]">
                  Merci. Nous allons contacter le livreur et revenir dans 2h.
                </p>
              </div>
              <div className="text-[11px] text-[#A8A29E] mt-1">09:45</div>
            </div>
          </div>
        </div>

        {/* Reply Bar */}
        <div className="bg-white border-t border-[#E2E8F0] p-3">
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#78716C]">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder="Écrivez un message..."
              className="flex-1 h-10 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
            />
            <button className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white hover:bg-[#1d4ed8] transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
