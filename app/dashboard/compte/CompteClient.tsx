'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { updateAccount, updatePassword } from './actions';

type Props = {
  fullName: string;
  email: string;
  phone: string;
  initials: string;
};

export function CompteClient({ fullName, email, phone, initials }: Props) {
  const t = useTranslations('account');
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const [name, setName] = useState(fullName);
  const [mail, setMail] = useState(email);
  const [tel, setTel] = useState(phone);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  function handleSave() {
    setError('');
    setSuccess('');
    const fd = new FormData();
    fd.set('full_name', name);
    fd.set('email', mail);
    fd.set('phone', tel);
    startTransition(async () => {
      const result = await updateAccount(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(t('saveSuccess'));
        setTimeout(() => setSuccess(''), 3000);
      }
    });
  }

  function handlePasswordSave() {
    setPasswordError('');
    setPasswordSuccess('');
    if (password.length < 8) {
      setPasswordError(t('passwordMinLength'));
      return;
    }
    const fd = new FormData();
    fd.set('password', password);
    startPasswordTransition(async () => {
      const result = await updatePassword(fd);
      if (result?.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(t('passwordSuccess'));
        setPassword('');
        setTimeout(() => {
          setPasswordSuccess('');
          setShowPasswordForm(false);
        }, 2000);
      }
    });
  }

  const displayInitials = name
    ? name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
    : initials;

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

        {/* Profile card */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold mx-auto" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)', color: 'var(--color-primary)' }}>
            {displayInitials || '?'}
          </div>
          <h2 className="text-xl font-semibold text-[#1C1917] mt-3">{name || fullName}</h2>
          <p className="text-sm text-[#78716C]">{mail}</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#1C1917] mb-4">{t('personalInfo')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] text-[#78716C] mb-1.5">{t('fullName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                data-testid="merchant-account-full-name-input"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#78716C] mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                data-testid="merchant-account-email-input"
              />
              <p className="text-xs text-[#78716C] mt-1">{t('emailNote')}</p>
            </div>
            <div>
              <label className="block text-[13px] text-[#78716C] mb-1.5">{t('phone')}</label>
              <input
                type="tel"
                dir="ltr"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                data-testid="merchant-account-phone-input"
              />
            </div>

            {/* Change password toggle */}
            <button
              type="button"
              onClick={() => setShowPasswordForm((v) => !v)}
              className="w-full h-12 flex items-center justify-between px-4 border border-[#E2E8F0] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors"
              style={{ color: 'var(--color-primary)' }}
              data-testid="merchant-account-change-password-btn"
            >
              <span>{t('changePassword')}</span>
              {showPasswordForm ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {showPasswordForm && (
              <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-[13px] text-[#78716C] mb-1.5">{t('newPassword')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full h-10 px-3 pr-10 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                      data-testid="merchant-account-new-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-[#DC2626] mt-1">{passwordError}</p>}
                  {passwordSuccess && <p className="text-xs text-[#16A34A] mt-1">{passwordSuccess}</p>}
                </div>
                <button
                  type="button"
                  onClick={handlePasswordSave}
                  disabled={isPasswordPending}
                  className="h-9 px-4 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  data-testid="merchant-account-save-password-btn"
                >
                  {isPasswordPending ? t('saving') : t('savePassword')}
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-[#DC2626] mt-3">{error}</p>}
          {success && <p className="text-sm text-[#16A34A] mt-3">{success}</p>}
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="w-full h-11 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
          data-testid="merchant-account-save-btn"
        >
          {isPending ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
