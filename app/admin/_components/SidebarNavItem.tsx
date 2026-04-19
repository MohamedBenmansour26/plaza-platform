'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  disabled?: boolean;
};

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  active,
  disabled = false,
}: Props) {
  const base = cn(
    'relative flex h-9 items-center gap-3 rounded-[6px] px-3 text-[14px] transition-colors',
    active
      ? 'bg-[#EFF6FF] font-medium text-[#2563EB]'
      : disabled
        ? 'cursor-not-allowed text-[#A8A29E]'
        : 'text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917]',
  );

  const content = (
    <>
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px] rounded-r-full bg-[#2563EB]"
        />
      ) : null}
      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} />
      <span className="truncate">{label}</span>
    </>
  );

  if (disabled) {
    return (
      <span
        className={base}
        aria-disabled="true"
        title="Bientôt disponible"
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={base}
      aria-current={active ? 'page' : undefined}
    >
      {content}
    </Link>
  );
}
