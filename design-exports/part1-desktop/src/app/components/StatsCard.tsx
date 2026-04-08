import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
}

export function StatsCard({ icon: Icon, iconBg, iconColor, value, label, trend, trendPositive, onClick }: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-[#F0FDF4] text-[#16A34A]'
                : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="text-[28px] font-semibold text-[#1C1917] leading-tight">{value}</div>
      <div className="text-[13px] text-[#78716C] mt-1">{label}</div>
    </div>
  );
}
