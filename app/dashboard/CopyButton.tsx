'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = { url: string };

export function CopyButton({ url }: Props) {
  const t = useTranslations('dashboard');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silent fail
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full h-9 border border-[#E2E8F0] text-[#1C1917] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-[#16A34A]" />
          <span className="text-[#16A34A]">{t('linkCopied')}</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {t('copyLink')}
        </>
      )}
    </button>
  );
}
