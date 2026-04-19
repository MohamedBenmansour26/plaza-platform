'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
};

type Props<T extends { id: string }> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  rowHeight?: number;
  keyboardNav?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
  skeletonRows?: number;
  ariaLabel?: string;
};

/**
 * DataTable — generic admin table.
 * - `j` / `k` move selection down / up (when `keyboardNav`).
 * - `Enter` on a selected row triggers `onRowClick`.
 * - `loading` renders skeleton rows, `emptyState` renders when rows is empty.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  rowHeight = 48,
  keyboardNav = true,
  loading = false,
  emptyState,
  skeletonRows = 6,
  ariaLabel,
}: Props<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (!keyboardNav || rows.length === 0) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, rows.length - 1));
      } else if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((i) => (i <= 0 ? 0 : i - 1));
      } else if (event.key === 'Enter') {
        if (selectedIndex >= 0 && rows[selectedIndex] && onRowClick) {
          event.preventDefault();
          onRowClick(rows[selectedIndex]);
        }
      }
    },
    [keyboardNav, rows, selectedIndex, onRowClick],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-[8px] border border-[#E7E5E4] bg-white"
      role="region"
      aria-label={ariaLabel}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="h-10 bg-[#FAFAF9] border-b border-[#E7E5E4]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 text-[12px] font-semibold uppercase tracking-wider text-[#78716C]',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.align !== 'right' && col.align !== 'center' && 'text-left',
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr
                  key={`skeleton-${i}`}
                  className="border-b border-[#F5F5F4] last:border-b-0"
                  style={{ height: rowHeight }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-[#F5F5F4]" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.length === 0 && emptyState
              ? (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      {emptyState}
                    </td>
                  </tr>
                )
              : rows.map((row, index) => {
                  const selected = index === selectedIndex;
                  return (
                    <tr
                      key={row.id}
                      role="row"
                      aria-selected={selected}
                      tabIndex={0}
                      onClick={() => onRowClick?.(row)}
                      onFocus={() => setSelectedIndex(index)}
                      className={cn(
                        'border-b border-[#F5F5F4] last:border-b-0 cursor-pointer transition-colors',
                        'hover:bg-[#FAFAF9] focus:outline-none',
                        selected && 'bg-[#F5F5F4] relative',
                      )}
                      style={{ height: rowHeight }}
                    >
                      {columns.map((col, colIndex) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 text-[14px] text-[#1C1917]',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            colIndex === 0 &&
                              selected &&
                              'border-l-2 border-[#2563EB]',
                          )}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
        </tbody>
      </table>
    </div>
  );
}
