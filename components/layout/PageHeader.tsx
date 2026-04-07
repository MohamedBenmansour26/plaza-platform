import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-6 md:mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1C1917]">{title}</h1>
        {subtitle && <p className="text-sm text-[#78716C] mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
