import { Drawer } from "vaul";
import { X, Phone } from "lucide-react";

interface StoreInfoSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function StoreInfoSheet({ open, onClose }: StoreInfoSheetProps) {
  // FIX-15: dynamic day of week
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const today = dayNames[new Date().getDay()];

  return (
    <Drawer.Root open={open} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] flex flex-col">
          <div className="flex-shrink-0">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-3" />
              <Drawer.Title className="font-bold text-[18px] mb-1">Zara Maroc</Drawer.Title>
              <Drawer.Description className="text-[13px] text-[#78716C]">Mode & Vêtements</Drawer.Description>
            </div>

            <p className="text-[14px] text-[#78716C] mb-6">
              Boutique de mode et vêtements traditionnels et modernes. Livraison rapide à
              Casablanca.
            </p>

            <div className="mb-6">
              <h3 className="font-bold text-[15px] mb-3">Horaires</h3>
              <div className="space-y-2">
                {[
                  { day: "Lundi", hours: "9h–20h" },
                  { day: "Mardi", hours: "9h–20h" },
                  { day: "Mercredi", hours: "9h–20h" },
                  { day: "Jeudi", hours: "9h–20h" },
                  { day: "Vendredi", hours: "9h–20h" },
                  { day: "Samedi", hours: "9h–20h" },
                  { day: "Dimanche", hours: "10h–18h" },
                ].map((item) => (
                  <div
                    key={item.day}
                    className={`flex justify-between text-[14px] py-1.5 px-3 rounded ${
                      item.day === today ? "bg-[#EFF6FF] text-[#2563EB] font-medium" : ""
                    }`}
                  >
                    <span>{item.day}</span>
                    <span>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-[15px] mb-3">Localisation</h3>
              <div className="bg-gray-200 h-[200px] rounded-lg mb-2 relative overflow-hidden">
                <img
                  src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+2563eb(-7.6145,33.5892)/-7.6145,33.5892,13,0/400x200@2x?access_token=REMOVED_DEMO_TOKEN"
                  alt="Map"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] text-[#78716C]">Casablanca — Maarif, Rue Ibnou Rochd</p>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-[15px] mb-3">Livraison</h3>
              <div className="bg-[#EFF6FF] border border-[#2563EB] rounded-lg px-4 py-3">
                <p className="text-[14px] text-[#2563EB]">
                  Livraison 30 MAD · Gratuite dès 500 MAD d'achat
                </p>
              </div>
            </div>

            {/* FIX-14: convert to tel link; TODO: dynamic store phone */}
            <a href="tel:+212661234567" className="w-full h-12 border-2 border-[#2563EB] text-[#2563EB] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#EFF6FF] transition-colors">
              <Phone className="w-4 h-4" />
              Appeler la boutique
            </a>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
