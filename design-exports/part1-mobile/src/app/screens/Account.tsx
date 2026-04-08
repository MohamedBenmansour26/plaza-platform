import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

export function Account() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[375px] mx-auto pb-24">
        {/* Top Bar */}
        <div className="bg-white h-14 px-4 flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 p-2 -ml-2"
          >
            <ArrowLeft size={20} className="text-[#1C1917]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1C1917]">
            Mon compte
          </h1>
        </div>

        {/* Profile Card */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-[24px] font-semibold">
              FA
            </div>
            <button className="text-[14px] text-[#2563EB] mt-2 hover:underline">
              Changer la photo
            </button>
            <div className="text-[20px] font-semibold text-[#1C1917] mt-3">
              Fatima Amrani
            </div>
            <div className="text-[14px] text-[#78716C] mt-1">
              fatima@example.com
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-3 space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Nom complet
              </label>
              <input
                type="text"
                defaultValue="Fatima Amrani"
                className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="fatima@example.com"
                className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1C1917] mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                defaultValue="06 12 34 56 78"
                dir="ltr"
                className="w-full h-11 px-3 border border-[#E2E8F0] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="pt-2">
              <button className="flex items-center justify-between w-full py-3 text-[14px] text-[#2563EB] hover:underline">
                <span>Changer le mot de passe</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] p-4 max-w-[375px] mx-auto">
          <button className="w-full h-12 bg-[#2563EB] text-white text-[16px] font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
