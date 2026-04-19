'use client';

import { LogOut } from 'lucide-react';
import { useMemo } from 'react';

type Props = {
  adminEmail: string;
  /** ISO date string for when the trust cookie expires. Null = no trusted device. */
  trustedUntil: string | null;
  onLogout: () => void;
};

export function Topbar({ adminEmail, trustedUntil, onLogout }: Props) {
  const trustedHint = useMemo(() => {
    if (!trustedUntil) return null;
    try {
      const date = new Date(trustedUntil);
      if (Number.isNaN(date.getTime())) return null;
      const formatted = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `Poste de confiance jusqu'au ${formatted}`;
    } catch {
      return null;
    }
  }, [trustedUntil]);

  return (
    <header
      data-admin-topbar
      className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#E7E5E4] bg-white px-6"
    >
      <div className="text-[14px] font-medium text-[#1C1917]">
        Plaza Admin
      </div>
      <div className="flex items-center gap-4">
        {trustedHint ? (
          <span className="hidden text-[12px] text-[#78716C] lg:inline">
            {trustedHint}
          </span>
        ) : null}
        <span className="text-[13px] text-[#44403C]">{adminEmail}</span>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-[6px] border border-[#E7E5E4] bg-white px-3 py-1.5 text-[13px] font-medium text-[#1C1917] hover:bg-[#F5F5F4]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
