'use client';
// DocumentUpload — document scan upload area (dashed → thumbnail with green badge).
// Used on onboarding screens for license, insurance, identity.

import { useRef } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';

type Props = {
  label: string;
  sublabel?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  height?: number;
  testId?: string;
};

export function DocumentUpload({ label, sublabel, value, onChange, height = 140, testId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = value ? URL.createObjectURL(value) : null;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden cursor-pointer"
      style={{ height }}
      onClick={() => inputRef.current?.click()}
    >
      {previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="absolute bottom-2 left-3 text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            Document reçu
          </div>
        </>
      ) : (
        <div
          className="w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2"
          style={{
            borderColor: 'var(--color-primary)',
            background: 'color-mix(in srgb, var(--color-primary) 5%, white)',
          }}
        >
          <Upload className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-medium text-[#1C1917]">{label}</span>
          {sublabel && <span className="text-xs text-[#78716C]">{sublabel}</span>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        data-testid={testId}
      />
    </div>
  );
}
