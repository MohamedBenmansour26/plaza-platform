import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function Account() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Fatima Amrani',
    email: 'fatima@example.com',
    phone: '06 12 34 56 78',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Modifications enregistrees !');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1040px] mx-auto p-8">
        {/* Breadcrumb */}
        <div className="text-xs text-[#78716C] mb-6">
          <span>Compte</span>
        </div>

        {/* Page Header */}
        <h1 className="text-2xl font-semibold text-[#1C1917] mb-6">Mon compte</h1>

        {/* Centered Content */}
        <div className="max-w-[640px] mx-auto space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-2xl font-semibold mx-auto">
              FA
            </div>
            <button className="text-sm text-[#2563EB] hover:underline mt-2">
              Changer la photo
            </button>
            <h2 className="text-xl font-semibold text-[#1C1917] mt-3">Fatima Amrani</h2>
            <p className="text-sm text-[#78716C]">fatima@example.com</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-[#1C1917] mb-4">Informations personnelles</h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[13px] text-[#78716C] mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] text-[#78716C] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[13px] text-[#78716C] mb-1.5">
                  Telephone
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Change Password */}
              <button
                onClick={() => alert('Changer le mot de passe')}
                className="w-full h-12 flex items-center justify-between px-4 border border-[#E2E8F0] rounded-lg text-sm text-[#2563EB] hover:bg-[#F8FAFC] transition-colors"
              >
                <span>Changer le mot de passe</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-11 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}
