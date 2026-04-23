import { cn } from '@/lib/utils';

export type StatusChipVariant =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'resubmit'
  | 'suspended'
  | 'neutral'
  | 'info';

type Props = {
  variant: StatusChipVariant;
  children: React.ReactNode;
  className?: string;
};

const VARIANT_STYLES: Record<StatusChipVariant, string> = {
  approved: 'bg-[#F0FDF4] text-[#15803D]',
  pending: 'bg-[#FEF3C7] text-[#92400E]',
  rejected: 'bg-[#FEF2F2] text-[#B91C1C]',
  resubmit: 'bg-[#FEF3C7] text-[#92400E]',
  suspended: 'bg-[#FEF2F2] text-[#B91C1C]',
  neutral: 'bg-[#F5F5F4] text-[#44403C]',
  info: 'bg-[var(--admin-color-primary-tint)] text-[#1E40AF]',
};

export function StatusChip({ variant, children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-[10px] py-[2px] text-[12px] font-medium leading-[18px] whitespace-nowrap',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
