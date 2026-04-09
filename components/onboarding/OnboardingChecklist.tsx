'use client';

/**
 * OnboardingChecklist — PLZ-032 / PLZ-037
 *
 * Shows a checklist to help merchants complete their store setup.
 * Displayed at the top of the dashboard when the store is not yet live (is_online = false)
 * or when required setup steps are incomplete.
 *
 * i18n keys required (messages/fr.json):
 *   onboarding.checklist_title
 *   onboarding.checklist_subtitle
 *   onboarding.checklist_progress  (params: {done, total})
 *   onboarding.checklist_progress_done (= "Félicitations !")
 *   onboarding.step_identity        (= "Identité vérifiée")
 *   onboarding.step_store_name      (= "Nom de la boutique")
 *   onboarding.step_location        (= "Localisation de la boutique")
 *   onboarding.step_photo           (= "Photo de la boutique")
 *   onboarding.step_description     (= "Description de la boutique")
 *   onboarding.step_category        (= "Catégorie")
 *   onboarding.step_product         (= "Au moins 1 produit publié")
 *   onboarding.step_share           (= "Partager votre lien")
 *   onboarding.step_identity_desc   (= "Compte vérifié par OTP")
 *   onboarding.step_store_name_desc (= "Nom de votre boutique défini")
 *   onboarding.step_location_desc   (= "Coordonnées GPS de votre boutique")
 *   onboarding.step_photo_desc      (= "Logo ou photo ajouté à votre boutique")
 *   onboarding.step_description_desc(= "Description de votre boutique rédigée")
 *   onboarding.step_category_desc   (= "Catégorie de votre boutique définie")
 *   onboarding.step_product_desc    (= "Au moins un produit visible")
 *   onboarding.step_share_desc      (= "Lien partagé avec vos clients")
 *   onboarding.step_location_cta    (= "Configurer")
 *   onboarding.step_photo_cta       (= "Ajouter")
 *   onboarding.step_description_cta (= "Rédiger")
 *   onboarding.step_category_cta    (= "Choisir")
 *   onboarding.step_product_cta     (= "Ajouter")
 *   onboarding.step_share_cta       (= "Copier le lien")
 *   onboarding.publish_cta          (= "Publier ma boutique")
 *   onboarding.publishing           (= "Publication…")
 *   onboarding.published_title      (= "Votre boutique est en ligne !")
 *   onboarding.published_subtitle   (= "Partagez votre lien avec vos premiers clients.")
 *   onboarding.published_share_cta  (= "Partager le lien")
 *   onboarding.soon_badge           (= "Bientôt")
 *   onboarding.link_copied          (= "Lien copié !")
 *   onboarding.live_banner          (= "Votre boutique est en ligne")
 *   onboarding.live_banner_sub      (= "Continuez à ajouter des produits pour attirer plus de clients.")
 */

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Zap,
  CheckCircle2,
  Circle,
  CheckCheck,
} from 'lucide-react';
import { publishStoreAction } from './actions';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingData = {
  merchantId: string;
  storeName: string | null;
  /** true when both location_lat AND location_lng are non-null */
  hasLocation: boolean;
  /** true when logo_url is non-null */
  logoUrl: string | null;
  /** true when description is non-null and non-empty */
  hasDescription: boolean;
  /** true when category is non-null */
  hasCategory: boolean;
  isOnline: boolean;
  storeSlug: string;
  /** count of products with is_visible=true */
  visibleProductCount: number;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function OnboardingChecklistSkeleton() {
  return (
    <div className="w-full mb-6">
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border-s-4 border-[#E2E8F0] animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#F0F0EF] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-[#F0F0EF]" />
            <div className="h-3 w-60 rounded bg-[#F0F0EF]" />
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[#F0F0EF] mb-2" />
        <div className="h-2.5 w-28 rounded bg-[#F0F0EF] mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="flex items-center gap-3 py-3 md:py-4">
              <div className="w-6 h-6 rounded-full bg-[#F0F0EF] flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 rounded bg-[#F0F0EF]" />
                <div className="h-2.5 w-36 rounded bg-[#F0F0EF]" />
              </div>
              {i < 4 && <div className="h-7 w-20 rounded-lg bg-[#F0F0EF]" />}
            </div>
            {i < 4 && <div className="h-px bg-[#F0F0EF]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Post-publish banner ───────────────────────────────────────────────────────

function LiveBanner({ t }: { t: ReturnType<typeof useTranslations<'onboarding'>> }) {
  return (
    <div className="w-full mb-6 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex items-start gap-3">
      <CheckCheck className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-semibold text-[#15803D]">{t('live_banner')}</div>
        <div className="text-sm text-[#16A34A] mt-0.5">{t('live_banner_sub')}</div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

type Props = {
  data: OnboardingData;
};

export function OnboardingChecklist({ data }: Props) {
  const t = useTranslations('onboarding');
  const [isPending, startTransition] = useTransition();

  // State D — published (celebration then banner)
  const [published, setPublished] = useState(data.isOnline);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBanner, setShowBanner] = useState(data.isOnline);

  // "Share" step tracked client-side via localStorage
  const [hasShared, setHasShared] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasShared(localStorage.getItem(`plaza_shared_${data.merchantId}`) === 'true');
    }
  }, [data.merchantId]);

  // If already online on mount, show only the banner (not the checklist)
  if (published && showBanner && !showCelebration) {
    return <LiveBanner t={t} />;
  }

  // ── Compute step checks ──────────────────────────────────────────────────────

  // Steps definition — must be inside component after t() (BUG-013–016 rule)
  const steps = [
    // Auto-checked (not blocking)
    {
      id: 'identity',
      label: t('step_identity'),
      desc: t('step_identity_desc'),
      checked: true,
      required: false,
      cta: null as string | null,
      href: null as string | null,
      isShare: false,
    },
    {
      id: 'store_name',
      label: t('step_store_name'),
      desc: t('step_store_name_desc'),
      checked: data.storeName !== null && data.storeName.trim().length > 0,
      required: false,
      cta: null,
      href: null,
      isShare: false,
    },
    // Required (blocking for go-live)
    {
      id: 'location',
      label: t('step_location'),
      desc: t('step_location_desc'),
      checked: data.hasLocation,
      required: true,
      cta: t('step_location_cta'),
      href: '/dashboard/boutique',
      isShare: false,
    },
    {
      id: 'photo',
      label: t('step_photo'),
      desc: t('step_photo_desc'),
      checked: data.logoUrl !== null,
      required: true,
      cta: t('step_photo_cta'),
      href: '/dashboard/boutique',
      isShare: false,
    },
    {
      id: 'description',
      label: t('step_description'),
      desc: t('step_description_desc'),
      checked: data.hasDescription,
      required: true,
      cta: t('step_description_cta'),
      href: '/dashboard/boutique',
      isShare: false,
    },
    {
      id: 'category',
      label: t('step_category'),
      desc: t('step_category_desc'),
      checked: data.hasCategory,
      required: true,
      cta: t('step_category_cta'),
      href: '/dashboard/boutique',
      isShare: false,
    },
    {
      id: 'product',
      label: t('step_product'),
      desc: t('step_product_desc'),
      checked: data.visibleProductCount >= 1,
      required: true,
      cta: t('step_product_cta'),
      href: '/dashboard/produits',
      isShare: false,
    },
    // Non-blocking
    {
      id: 'share',
      label: t('step_share'),
      desc: t('step_share_desc'),
      checked: hasShared,
      required: false,
      cta: t('step_share_cta'),
      href: null,
      isShare: true,
    },
  ] as const;

  const requiredStepsDone = steps.filter((s) => s.required && s.checked).length;
  const totalRequired = steps.filter((s) => s.required).length; // 5
  const totalDone = steps.filter((s) => s.checked).length;
  const totalSteps = steps.length;
  const progressPercent = Math.round((totalDone / totalSteps) * 100);
  const canPublish = steps.filter((s) => s.required).every((s) => s.checked);

  const handleShare = () => {
    const url = `https://plaza.ma/store/${data.storeSlug}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`plaza_shared_${data.merchantId}`, 'true');
    }
    setHasShared(true);
  };

  const handlePublish = () => {
    startTransition(async () => {
      await publishStoreAction(data.merchantId);
      setPublished(true);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setShowBanner(true);
      }, 5000);
    });
  };

  // State D — celebration
  if (showCelebration) {
    return (
      <div className="w-full mb-6">
        <div
          className="bg-white rounded-2xl shadow-sm p-6 border-s-4 border-[#16A34A]"
          style={{ background: 'linear-gradient(to bottom, #F0FDF4, white)' }}
        >
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-semibold text-[#1C1917] mb-2">
              {t('published_title')}
            </h3>
            <p className="text-sm text-[#78716C] mb-4">{t('published_subtitle')}</p>
            <button
              onClick={handleShare}
              className="h-9 px-4 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              {t('published_share_cta')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // States A / B / C — normal checklist
  const isComplete = canPublish; // State C when all required done

  return (
    <div className="w-full mb-6">
      <div
        className="bg-white rounded-2xl shadow-sm p-4 md:p-6"
        style={{
          borderInlineStart: `4px solid ${isComplete ? '#16A34A' : '#2563EB'}`,
          background: isComplete
            ? 'linear-gradient(to bottom, #F0FDF4, white)'
            : 'white',
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <Zap className="w-4.5 h-4.5 text-[#2563EB]" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#1C1917] mb-0.5">
              {t('checklist_title')}
            </h3>
            <p className="text-sm text-[#78716C]">{t('checklist_subtitle')}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden bg-[#F0F0EF] mb-2">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Progress counter */}
        <p
          className={`text-xs font-medium mb-3 md:mb-4 ${
            isComplete ? 'text-[#16A34A]' : 'text-[#78716C]'
          }`}
        >
          {isComplete
            ? t('checklist_progress_done')
            : t('checklist_progress', { done: totalDone, total: totalSteps })}
        </p>

        {/* Steps */}
        <div>
          {(steps as unknown as Array<typeof steps[number]>).map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <div key={step.id}>
                <div className="flex items-center gap-3 py-3 md:py-4">
                  {/* Checkbox icon */}
                  <div className="flex-shrink-0">
                    {step.checked ? (
                      <CheckCircle2
                        size={24}
                        className="text-[#2563EB]"
                        fill="#2563EB"
                      />
                    ) : (
                      <Circle
                        size={24}
                        strokeWidth={1.5}
                        className="text-[#D1D5DB]"
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug ${
                        step.checked
                          ? 'text-[#A8A29E] line-through'
                          : 'text-[#1C1917]'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-[#A8A29E]">{step.desc}</p>
                  </div>

                  {/* CTA or Badge */}
                  {!step.checked && step.cta && (
                    <div className="flex-shrink-0">
                      {step.isShare ? (
                        <button
                          onClick={handleShare}
                          className="h-8 px-3 rounded-lg text-xs font-medium border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
                        >
                          {step.cta}
                        </button>
                      ) : step.href ? (
                        <Link
                          href={step.href}
                          className="inline-flex h-8 px-3 items-center rounded-lg text-xs font-medium border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
                        >
                          {step.cta}
                        </Link>
                      ) : null}
                    </div>
                  )}
                </div>
                {!isLast && <div className="h-px bg-[#F3F4F6]" />}
              </div>
            );
          })}
        </div>

        {/* "Publier ma boutique" CTA — unlocks when items 3+4+5 all checked */}
        <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
          <button
            onClick={handlePublish}
            disabled={!canPublish || isPending}
            className={`w-full h-11 rounded-xl text-sm font-semibold transition-colors ${
              canPublish && !isPending
                ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                : 'bg-[#F0F0EF] text-[#A8A29E] cursor-not-allowed'
            }`}
          >
            {isPending ? t('publishing') : t('publish_cta')}
          </button>
          {!canPublish && (
            <p className="text-xs text-[#A8A29E] text-center mt-2">
              {t('checklist_progress', {
                done: requiredStepsDone,
                total: totalRequired,
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  try { document.execCommand('copy'); } catch (_e) { /* silent fallback */ }
  document.body.removeChild(ta);
}
