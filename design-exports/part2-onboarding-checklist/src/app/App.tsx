import { useState } from 'react';
import { OnboardingChecklist } from './components/OnboardingChecklist';

export default function App() {
  const [locale, setLocale] = useState<'fr' | 'ar'>('fr');
  const [showChecklist, setShowChecklist] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      {/* Demo controls */}
      <div className="max-w-[680px] mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setLocale('fr')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              locale === 'fr'
                ? 'bg-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLocale('ar')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              locale === 'ar'
                ? 'bg-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            AR
          </button>
          {!showChecklist && (
            <button
              onClick={() => setShowChecklist(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Onboarding checklist */}
      {showChecklist && (
        <OnboardingChecklist
          locale={locale}
          onDismiss={() => setShowChecklist(false)}
        />
      )}

      {/* Placeholder dashboard content */}
      <div className="max-w-[680px] mx-auto mt-8 p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Stats</h2>
        <p className="text-sm text-neutral-500">Dashboard content appears here...</p>
      </div>
    </div>
  );
}