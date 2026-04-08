interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'amber';
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  const variants = {
    gray: 'bg-[#F5F5F4] text-[#78716C]',
    blue: 'bg-[#EFF6FF] text-[#2563EB]',
    green: 'bg-[#F0FDF4] text-[#16A34A]',
    orange: 'bg-[#FFF7ED] text-[#E8632A]',
    red: 'bg-[#FEF2F2] text-[#DC2626]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED]',
    amber: 'bg-[#FFFBEB] text-[#D97706]',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
