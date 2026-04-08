import { Star, FileText, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useNavigate } from 'react-router';

export const ProfilScreen = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/driver/login');
  };

  return (
    <>
      <div className="min-h-screen pb-20" style={{ backgroundColor: '#FAFAF9', maxWidth: '375px', margin: '0 auto' }}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-4 py-3">
          <h1 className="text-lg font-semibold" style={{ color: '#1C1917' }}>
            Mon profil
          </h1>
        </div>

        {/* Profile Card */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: '#EFF6FF' }}
            >
              <span className="text-2xl font-semibold" style={{ color: '#2563EB' }}>
                YM
              </span>
            </div>

            {/* Name */}
            <h2 className="text-xl font-semibold mb-1" style={{ color: '#1C1917' }}>
              Youssef Moussaoui
            </h2>

            {/* Role */}
            <p className="text-sm mb-3" style={{ color: '#78716C' }}>
              Livreur Plaza — Casablanca
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
              </div>
              <span className="text-sm" style={{ color: '#78716C' }}>
                4.8 / 5
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-4 mt-4 grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl border p-3 text-center" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-xs mb-1" style={{ color: '#78716C' }}>
              Livraisons
            </p>
            <p className="text-lg font-semibold" style={{ color: '#1C1917' }}>
              284
            </p>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-xs mb-1" style={{ color: '#78716C' }}>
              Ce mois
            </p>
            <p className="text-lg font-semibold" style={{ color: '#1C1917' }}>
              48
            </p>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-xs mb-1" style={{ color: '#78716C' }}>
              Taux succès
            </p>
            <p className="text-lg font-semibold" style={{ color: '#1C1917' }}>
              97%
            </p>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase mb-2" style={{ color: '#78716C' }}>
              Gains ce mois
            </p>
            <p className="text-3xl font-semibold mb-1" style={{ color: '#1C1917' }}>
              1 680 MAD
            </p>
            <p className="text-sm mb-3" style={{ color: '#78716C' }}>
              Virement prévu le 15 avril
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full mb-1.5" style={{ backgroundColor: '#F0FDF4' }}>
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: '#16A34A', width: '70%' }}
              />
            </div>
            <p className="text-xs" style={{ color: '#78716C' }}>
              70% de l'objectif mensuel (2 400 MAD)
            </p>
          </div>
        </div>

        {/* Menu List */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <MenuItem
              icon={<FileText className="w-5 h-5" style={{ color: '#78716C' }} />}
              label="Mes documents"
              onClick={() => {}}
            />
            <MenuItem
              icon={<Bell className="w-5 h-5" style={{ color: '#78716C' }} />}
              label="Paramètres de notification"
              onClick={() => {}}
              showDivider
            />
            <MenuItem
              icon={<HelpCircle className="w-5 h-5" style={{ color: '#78716C' }} />}
              label="Aide & Support"
              onClick={() => {}}
              showDivider
            />
            <MenuItem
              icon={<LogOut className="w-5 h-5" style={{ color: '#DC2626' }} />}
              label="Déconnexion"
              labelColor="#DC2626"
              onClick={handleLogout}
              showDivider
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onClick: () => void;
  showDivider?: boolean;
}

const MenuItem = ({ icon, label, labelColor, onClick, showDivider }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-14 px-4 flex items-center justify-between"
      style={{
        borderBottom: showDivider ? '1px solid #F1F5F9' : 'none',
      }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium" style={{ color: labelColor || '#1C1917' }}>
          {label}
        </span>
      </div>
      <ChevronRight className="w-5 h-5" style={{ color: '#78716C' }} />
    </button>
  );
};
