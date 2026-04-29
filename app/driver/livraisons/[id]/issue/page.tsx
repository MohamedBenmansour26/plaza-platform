'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, AlertCircle, PackageX, MapPin, Package, Banknote, MoreHorizontal } from 'lucide-react';
import { PhotoCapture } from '../../../_components/PhotoCapture';
import { StickyCTA } from '../../../_components/StickyCTA';
import { uploadDriverDocumentAction } from '../../../onboarding/actions';
import { reportIssueAction } from './actions';
import type { IssueType } from '@/lib/db/driver';

const NOTES_MAX = 500;

const ISSUE_CHIPS: { type: IssueType; labelKey: string; subKey: string; Icon: React.ElementType }[] = [
  { type: 'client_absent',   labelKey: 'reasons.client_absent.label',   subKey: 'reasons.client_absent.sub',   Icon: AlertCircle    },
  { type: 'client_refuse',   labelKey: 'reasons.client_refuse.label',   subKey: 'reasons.client_refuse.sub',   Icon: PackageX       },
  { type: 'wrong_address',   labelKey: 'reasons.wrong_address.label',   subKey: 'reasons.wrong_address.sub',   Icon: MapPin         },
  { type: 'damaged',         labelKey: 'reasons.damaged.label',         subKey: 'reasons.damaged.sub',         Icon: Package        },
  { type: 'payment_issue',   labelKey: 'reasons.payment_issue.label',   subKey: 'reasons.payment_issue.sub',   Icon: Banknote       },
  { type: 'other',           labelKey: 'reasons.other.label',           subKey: 'reasons.other.sub',           Icon: MoreHorizontal },
];

function IssueContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('driver.issue');

  const [selected, setSelected] = useState<IssueType | null>(null);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notesRequired = selected === 'other';
  const notesValid = !notesRequired || notes.trim().length > 0;
  const submitDisabled = !selected || !notesValid;

  function handleNotesChange(v: string): void {
    setNotes(v.slice(0, NOTES_MAX));
  }

  async function handleSubmit(): Promise<void> {
    if (!selected || !notesValid) return;
    setLoading(true);
    setError(null);

    let photoPath: string | null = null;
    if (photo) {
      const fd = new FormData();
      fd.append('file', photo);
      const r = await uploadDriverDocumentAction(fd, 'issue_photo');
      if (!('error' in r)) photoPath = r.url;
    }

    const result = await reportIssueAction(id, selected, notes.trim(), photoPath);
    if (result?.error) {
      setError(t('error.generic'));
      setLoading(false);
      return;
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-6 h-6 text-[#1C1917]" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-[#1C1917]">{t('title')}</h1>
        </div>
      </header>

      <div className="px-4 pt-4">
        <p className="text-[15px] font-bold text-[#1C1917] mb-4">{t('prompt')}</p>

        <div className="grid grid-cols-2 gap-2.5 mb-4" role="radiogroup" aria-label={t('prompt')}>
          {ISSUE_CHIPS.map(({ type, labelKey, subKey, Icon }) => {
            const active = selected === type;
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(type)}
                className="flex flex-col items-center p-3.5 rounded-2xl border-2 text-center transition-all"
                style={{
                  borderColor: active ? 'var(--color-primary)' : '#E2E8F0',
                  background: active ? 'color-mix(in srgb, var(--color-primary) 5%, white)' : 'white',
                }}
                data-testid={`driver-issue-${type.replace(/_/g, '-')}-btn`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={active ? { backgroundColor: 'var(--color-primary)' } : { backgroundColor: '#F5F5F4' }}>
                  <Icon className="w-5 h-5" style={{ color: active ? 'white' : '#78716C' }} />
                </div>
                <span className="text-[13px] font-semibold text-[#1C1917]">{t(labelKey)}</span>
                <span className="text-[11px] text-[#78716C] mt-0.5">{t(subKey)}</span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="driver-issue-notes" className="text-sm text-[#1C1917]">
                {t('notes.label')}
                {notesRequired ? null : (
                  <span className="ml-2 text-xs text-[#78716C]">{t('notes.optional')}</span>
                )}
              </label>
              <span className="text-xs text-[#78716C]" aria-live="polite">
                {notes.length}/{NOTES_MAX}
              </span>
            </div>
            <textarea
              id="driver-issue-notes"
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              maxLength={NOTES_MAX}
              placeholder={notesRequired ? t('notes.placeholderRequired') : t('notes.placeholder')}
              rows={4}
              required={notesRequired}
              aria-required={notesRequired}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-[#1C1917] outline-none resize-none"
              data-testid="driver-issue-notes-textarea"
            />
            {notesRequired && !notesValid && (
              <p className="mt-1 text-xs text-red-600">{t('notes.requiredError')}</p>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-[#1C1917]">{t('photo.label')}</p>
            <span className="text-xs text-[#78716C]">{t('photo.optional')}</span>
          </div>
          <PhotoCapture value={photo} onChange={setPhoto} height={120} testId="driver-issue-photo-input" />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            data-testid="driver-issue-error"
          >
            {error}
          </div>
        )}
      </div>

      <StickyCTA
        label={t('submit')}
        variant="danger"
        disabled={submitDisabled}
        loading={loading}
        onClick={handleSubmit}
        testId="driver-issue-submit-btn"
      />
    </div>
  );
}

export default function IssuePage(): JSX.Element {
  return <Suspense><IssueContent /></Suspense>;
}
