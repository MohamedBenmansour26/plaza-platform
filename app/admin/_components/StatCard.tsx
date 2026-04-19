import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: string;
  delta?: {
    value: string;
    direction: 'up' | 'down';
  };
  className?: string;
};

export function StatCard({ label, value, delta, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-[8px] border border-[#E7E5E4] bg-white p-5',
        className,
      )}
    >
      <div className="text-[13px] text-[#78716C]">{label}</div>
      <div className="mt-1 text-[28px] font-semibold text-[#1C1917] tabular-nums leading-tight">
        {value}
      </div>
      {delta ? (
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-[12px] font-medium tabular-nums',
            delta.direction === 'up' ? 'text-[#15803D]' : 'text-[#B91C1C]',
          )}
        >
          {delta.direction === 'up' ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta.value}
        </div>
      ) : null}
    </div>
  );
}
