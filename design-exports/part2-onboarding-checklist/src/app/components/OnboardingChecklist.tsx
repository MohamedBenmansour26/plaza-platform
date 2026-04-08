import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, Circle, CircleAlert } from 'lucide-react';

type Locale = 'fr' | 'ar';

interface OnboardingStep {
  id: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  locale?: Locale;
  onDismiss?: () => void;
}

const COPY = {
  fr: {
    title: 'Lancez votre boutique',
    subtitle: 'Quelques étapes pour recevoir votre première commande.',
    progressLabel: (completed: number) =>
      completed === 4 ? '4 sur 4 — Félicitations !' : `${completed} sur 4 étapes complétées`,
    steps: [
      {
        primary: 'Complétez votre profil',
        secondary: 'Nom, logo, description',
        cta: 'Modifier',
      },
      {
        primary: 'Publiez votre boutique',
        secondary: 'Rendez-la visible aux clients',
        cta: 'Publier',
      },
      {
        primary: 'Partagez votre lien',
        secondary: 'Envoyez à vos premiers clients',
        cta: 'Copier le lien',
      },
      {
        primary: 'Recevez votre première commande',
        secondary: 'Automatique',
        badge: 'Bientôt',
      },
    ],
    loadingError: 'Impossible de charger les étapes. Réessayez.',
    retry: 'Réessayer',
  },
  ar: {
    title: 'أطلق متجرك',
    subtitle: 'خطوات بسيطة لاستقبال أول طلب.',
    progressLabel: (completed: number) =>
      completed === 4 ? '4 من 4 — مبروك !' : `${completed} من 4 خطوات مكتملة`,
    steps: [
      {
        primary: 'أكمل ملفك الشخصي',
        secondary: 'الاسم والشعار والوصف',
        cta: 'تعديل',
      },
      {
        primary: 'انشر متجرك',
        secondary: 'اجعله مرئيًا للعملاء',
        cta: 'نشر',
      },
      {
        primary: 'شارك الرابط',
        secondary: 'أرسله لعملائك الأوائل',
        cta: 'نسخ الرابط',
      },
      {
        primary: 'استقبل أول طلب',
        secondary: 'تلقائي',
        badge: 'قريبًا',
      },
    ],
    loadingError: 'تعذّر تحميل الخطوات. أعد المحاولة.',
    retry: 'أعد المحاولة',
  },
};

export function OnboardingChecklist({ locale = 'fr', onDismiss }: OnboardingChecklistProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: 'profile', completed: false },
    { id: 'publish', completed: false },
    { id: 'share', completed: false },
    { id: 'first-order', completed: false },
  ]);
  const [isDismissing, setIsDismissing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const copy = COPY[locale];
  const isRTL = locale === 'ar';
  const completedCount = steps.filter((s) => s.completed).length;
  const isComplete = completedCount === 4;

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after completion
  useEffect(() => {
    if (isComplete && !showCelebration) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setIsDismissing(true);
        setTimeout(() => {
          onDismiss?.();
        }, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, showCelebration, onDismiss]);

  const handleStepAction = (stepId: string) => {
    if (stepId === 'share') {
      // Copy link to clipboard with fallback
      const link = 'https://plaza.ma/store/your-store';

      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).catch(() => {
          // Fallback to legacy method
          fallbackCopyTextToClipboard(link);
        });
      } else {
        // Use fallback for unsupported browsers
        fallbackCopyTextToClipboard(link);
      }
    }

    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Could not copy text', err);
    }

    document.body.removeChild(textArea);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  if (isLoading) {
    return <SkeletonState locale={locale} />;
  }

  if (hasError) {
    return <ErrorState locale={locale} onRetry={handleRetry} />;
  }

  const progressPercent = (completedCount / 4) * 100;

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          dir={isRTL ? 'rtl' : 'ltr'}
          className="w-full max-w-[680px] mx-auto"
          style={{ fontFamily: isRTL ? 'Noto Sans Arabic, sans-serif' : 'Plus Jakarta Sans, sans-serif' }}
        >
          <div
            className="rounded-2xl md:rounded-[16px] p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
            style={{
              background: isComplete
                ? 'linear-gradient(to bottom, var(--plaza-color-primary-50), white)'
                : 'white',
              borderInlineStart: `4px solid ${
                isComplete ? 'var(--plaza-color-success-500)' : 'var(--plaza-color-primary-500)'
              }`,
            }}
          >
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center rounded-full w-8 h-8 shrink-0"
                  style={{ backgroundColor: 'var(--plaza-color-primary-50)' }}
                >
                  <Zap size={18} style={{ color: 'var(--plaza-color-primary-500)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg leading-[1.3] mb-1"
                    style={{ fontWeight: 600, color: 'var(--plaza-color-neutral-900)' }}
                  >
                    {copy.title}
                  </h3>
                  <p
                    className="text-sm leading-[1.5]"
                    style={{ color: 'var(--plaza-color-neutral-500)' }}
                  >
                    {copy.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--plaza-color-neutral-100)' }}
              >
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    backgroundColor: 'var(--plaza-color-primary-500)',
                    marginInlineStart: isRTL ? 'auto' : 0,
                    marginInlineEnd: isRTL ? 0 : 'auto',
                  }}
                />
              </div>
            </div>

            {/* Progress counter */}
            <div className="mb-3 md:mb-4">
              <p
                className="text-xs leading-[1.5]"
                style={{
                  fontWeight: 500,
                  color: isComplete
                    ? 'var(--plaza-color-success-600)'
                    : 'var(--plaza-color-neutral-500)',
                }}
              >
                {copy.progressLabel(completedCount)}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-0">
              {steps.map((step, index) => {
                const stepCopy = copy.steps[index];
                const isLastStep = index === steps.length - 1;

                return (
                  <div key={step.id}>
                    <div className="flex items-center gap-3 py-3 md:py-4">
                      {/* Checkbox */}
                      <div className="shrink-0">
                        {step.completed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle2
                              size={24}
                              style={{ color: 'var(--plaza-color-primary-500)' }}
                              fill="var(--plaza-color-primary-500)"
                            />
                          </motion.div>
                        ) : (
                          <Circle
                            size={24}
                            strokeWidth={1.5}
                            style={{ color: 'var(--plaza-color-neutral-300)' }}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm leading-[1.5]"
                          style={{
                            fontWeight: 500,
                            color: step.completed
                              ? 'var(--plaza-color-neutral-400)'
                              : 'var(--plaza-color-neutral-900)',
                            textDecoration: step.completed ? 'line-through' : 'none',
                          }}
                        >
                          {stepCopy.primary}
                        </p>
                        <p
                          className="text-xs leading-[1.5]"
                          style={{ color: 'var(--plaza-color-neutral-400)' }}
                        >
                          {stepCopy.secondary}
                        </p>
                      </div>

                      {/* CTA or Badge */}
                      {!step.completed && (
                        <div className="shrink-0">
                          {stepCopy.cta ? (
                            <button
                              onClick={() => handleStepAction(step.id)}
                              className="h-8 px-3 rounded-lg text-xs border transition-colors hover:bg-opacity-80"
                              style={{
                                fontWeight: 500,
                                borderColor: 'var(--plaza-color-primary-200)',
                                backgroundColor: 'var(--plaza-color-primary-50)',
                                color: 'var(--plaza-color-primary-600)',
                              }}
                            >
                              {stepCopy.cta}
                            </button>
                          ) : (
                            <span
                              className="inline-flex items-center h-5 px-2 rounded-full text-xs"
                              style={{
                                backgroundColor: 'var(--plaza-color-neutral-100)',
                                color: 'var(--plaza-color-neutral-600)',
                              }}
                            >
                              {stepCopy.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!isLastStep && (
                      <div
                        className="h-px"
                        style={{ backgroundColor: 'var(--plaza-color-neutral-100)' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SkeletonState({ locale }: { locale: Locale }) {
  const isRTL = locale === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full max-w-[680px] mx-auto"
    >
      <div className="rounded-2xl md:rounded-[16px] p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] bg-white">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="space-y-4 md:space-y-6"
        >
          {/* Title skeleton */}
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: 'var(--plaza-color-neutral-100)' }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-4 rounded"
                style={{
                  width: '160px',
                  backgroundColor: 'var(--plaza-color-neutral-100)',
                }}
              />
              <div
                className="h-3 rounded"
                style={{
                  width: '240px',
                  backgroundColor: 'var(--plaza-color-neutral-100)',
                }}
              />
            </div>
          </div>

          {/* Progress bar skeleton */}
          <div
            className="h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--plaza-color-neutral-100)' }}
          />

          {/* Counter skeleton */}
          <div
            className="h-2.5 rounded"
            style={{
              width: '100px',
              backgroundColor: 'var(--plaza-color-neutral-100)',
            }}
          />

          {/* Steps skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="flex items-center gap-3 py-3 md:py-4">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: 'var(--plaza-color-neutral-100)' }}
                />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-3 rounded"
                    style={{
                      width: '200px',
                      backgroundColor: 'var(--plaza-color-neutral-100)',
                    }}
                  />
                  <div
                    className="h-2.5 rounded"
                    style={{
                      width: '140px',
                      backgroundColor: 'var(--plaza-color-neutral-100)',
                    }}
                  />
                </div>
                {i < 4 && (
                  <div
                    className="h-6 rounded-lg"
                    style={{
                      width: '80px',
                      backgroundColor: 'var(--plaza-color-neutral-100)',
                    }}
                  />
                )}
              </div>
              {i < 4 && (
                <div
                  className="h-px"
                  style={{ backgroundColor: 'var(--plaza-color-neutral-100)' }}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ErrorState({ locale, onRetry }: { locale: Locale; onRetry: () => void }) {
  const copy = COPY[locale];
  const isRTL = locale === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full max-w-[680px] mx-auto"
      style={{ fontFamily: isRTL ? 'Noto Sans Arabic, sans-serif' : 'Plus Jakarta Sans, sans-serif' }}
    >
      <div className="rounded-2xl md:rounded-[16px] p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] bg-white">
        <div className="flex items-center gap-3">
          <CircleAlert size={16} style={{ color: 'var(--plaza-color-warning-500)' }} />
          <p className="flex-1 text-[13px]" style={{ color: 'var(--plaza-color-neutral-600)' }}>
            {copy.loadingError}
          </p>
          <button
            onClick={onRetry}
            className="h-8 px-3 rounded-lg text-xs border transition-colors hover:bg-opacity-80"
            style={{
              fontWeight: 500,
              borderColor: 'var(--plaza-color-primary-200)',
              backgroundColor: 'var(--plaza-color-primary-50)',
              color: 'var(--plaza-color-primary-600)',
            }}
          >
            {copy.retry}
          </button>
        </div>
      </div>
    </div>
  );
}
