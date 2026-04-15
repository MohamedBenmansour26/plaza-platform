'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  async function handleLogout() {
    const sb = createClient();
    await sb.auth.signOut();
    window.location.href = '/driver/auth/phone';
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 flex items-center gap-3 w-full text-left"
      style={{ height: 52 }}
    >
      <LogOut className="w-5 h-5 flex-shrink-0" style={{ color: '#DC2626' }} />
      <span className="flex-1 text-[15px]" style={{ color: '#DC2626' }}>Se déconnecter</span>
    </button>
  );
}
