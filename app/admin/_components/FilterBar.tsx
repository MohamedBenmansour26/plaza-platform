'use client';

import { Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type FilterChip = {
  key: string;
  label: string;
  active?: boolean;
};

type Props = {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    testId?: string;
  };
  chips?: FilterChip[];
  onChipClick?: (key: string) => void;
  rightSlot?: React.ReactNode;
  focusOnSlash?: boolean;
  className?: string;
};

/**
 * FilterBar — search input + filter chips + right-aligned actions.
 * Press `/` anywhere to focus the search input (when `focusOnSlash` is true).
 */
export function FilterBar({
  search,
  chips,
  onChipClick,
  rightSlot,
  focusOnSlash = true,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focusOnSlash || !search) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key !== '/') return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [focusOnSlash, search]);

  return (
    <div
      className={cn(
        'flex h-14 items-center gap-3 rounded-[8px] border border-[#E7E5E4] bg-white px-4',
        className,
      )}
    >
      {search ? (
        <div className="relative flex-1 max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
          <input
            ref={inputRef}
            type="search"
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder ?? 'Rechercher'}
            className="h-9 w-full rounded-[6px] border border-[#E7E5E4] bg-white pl-9 pr-10 text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[var(--admin-color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-color-primary-tint)]"
            data-testid={search.testId}
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-[4px] bg-[#F5F5F4] px-1.5 py-0.5 text-[11px] text-[#78716C]">
            /
          </kbd>
        </div>
      ) : null}
      {chips && chips.length > 0 ? (
        <div className="flex items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChipClick?.(chip.key)}
              aria-pressed={chip.active}
              className={cn(
                'h-8 rounded-[4px] border px-3 text-[13px] font-medium transition-colors',
                chip.active
                  ? 'border-[#E7E5E4] bg-[#F5F5F4] text-[#1C1917]'
                  : 'border-transparent text-[#78716C] hover:bg-[#F5F5F4]',
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
    </div>
  );
}
