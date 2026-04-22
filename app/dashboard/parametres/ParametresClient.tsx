'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type NotifKey = 'newOrders' | 'delivered' | 'support' | 'promotions';

export function ParametresClient() {
  const t = useTranslations('settings');
  const [isDeleting, startDeleteTransition] = useTransition();

  const [notifications, setNotifications] = useState<Record<NotifKey, boolean>>({
    newOrders: true,
    delivered: true,
    support: true,
    promotions: false,
  });

  const [twoFactor, _setTwoFactor] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const notifItems: { id: NotifKey; slug: string; label: string }[] = [
    { id: 'newOrders', slug: 'new-orders', label: t('notifNewOrders') },
    { id: 'delivered', slug: 'delivered', label: t('notifDelivered') },
    { id: 'support', slug: 'support', label: t('notifSupport') },
    { id: 'promotions', slug: 'promotions', label: t('notifPromotions') },
  ];

  function handleDeleteAccount() {
    startDeleteTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    });
  }

  const Toggle = ({ checked, onChange, disabled = false, testId }: { checked: boolean; onChange: () => void; disabled?: boolean; testId?: string }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      data-testid={testId}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-[var(--color-primary)]' : 'bg-[#E2E8F0]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      {/* Mobile top bar */}
      <div className="md:hidden bg-white h-14 px-4 flex items-center justify-center border-b border-[#E2E8F0]">
        <h1 className="text-base font-semibold text-[#1C1917]">{t('pageTitle')}</h1>
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-6 md:py-10 space-y-4">
        {/* Desktop header */}
        <div className="hidden md:block mb-6">
          <p className="text-xs text-[#78716C] mb-2">{t('breadcrumb')}</p>
          <h1 className="text-2xl font-semibold text-[#1C1917]">{t('pageTitle')}</h1>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#1C1917] mb-4">{t('notificationsTitle')}</h2>
          <div>
            {notifItems.map((item, idx) => (
              <div
                key={item.id}
                className={`h-12 flex items-center justify-between ${
                  idx < notifItems.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                }`}
              >
                <span className="text-sm text-[#1C1917]">{item.label}</span>
                <Toggle
                  checked={notifications[item.id]}
                  onChange={() =>
                    setNotifications((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  testId={`merchant-settings-notif-${item.slug}-toggle-checkbox`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-[#A8A29E] mt-3">{t('notifNote')}</p>
        </div>

        {/* Language */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#1C1917] mb-3">{t('languageTitle')}</h2>
          <div>
            {/* French — active, always selected */}
            <div className="h-12 w-full flex items-center justify-between px-1 border-b border-[#F3F4F6]">
              <span className="text-sm text-[#1C1917]">{t('langFr')}</span>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
            {/* Arabic — coming soon */}
            <div className="h-12 w-full flex items-center justify-between px-1 opacity-50 cursor-not-allowed">
              <span className="text-sm text-[#78716C]">{t('langAr')}</span>
              <span className="text-xs text-[#A8A29E] bg-[#F5F5F4] px-2 py-1 rounded-full">
                Bientôt disponible
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#1C1917] mb-3">{t('securityTitle')}</h2>
          <div>
            <a
              href="/dashboard/compte"
              className="h-12 w-full flex items-center justify-between hover:bg-[#F8FAFC] transition-colors border-b border-[#F3F4F6] px-1"
            >
              <span className="text-sm text-[#1C1917]">{t('changePassword')}</span>
              <ChevronRight className="w-4 h-4 text-[#78716C]" />
            </a>
            <div className="h-12 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#1C1917]">{t('twoFactor')}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF7ED] text-[#E8632A]">
                  {t('twoFactorSoon')}
                </span>
              </div>
              <Toggle
                checked={twoFactor}
                onChange={() => {/* disabled — 2FA not yet available */}}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-[#FEE2E2] shadow-sm p-6">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-11 bg-white border-[1.5px] border-[#DC2626] text-[#DC2626] rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors"
            data-testid="merchant-settings-delete-account-btn"
          >
            {t('deleteAccount')}
          </button>
          <p className="text-xs text-[#78716C] mt-2">{t('deleteAccountNote')}</p>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" data-testid="merchant-settings-delete-dialog">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-[#1C1917] mb-2">{t('deleteAccountTitle')}</h3>
            <p className="text-sm text-[#78716C] mb-6">{t('deleteAccountBody')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 h-10 border border-[#E2E8F0] text-[#1C1917] text-sm font-medium rounded-lg hover:bg-[#F5F5F4] transition-colors disabled:opacity-50"
                data-testid="merchant-settings-delete-cancel-btn"
              >
                {t('deleteCancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 h-10 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                data-testid="merchant-settings-delete-confirm-btn"
              >
                {isDeleting ? '…' : t('deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
