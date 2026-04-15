'use client';
// PhotoCapture — camera capture input that shows a thumbnail once a photo is taken.
// Uses <input type="file" capture="environment"> for native mobile camera.

import { useRef } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  height?: number;   // px, default 160
};

export function PhotoCapture({ value, onChange, height = 160 }: Props) {
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
          <img src={previewUrl} alt="photo" className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
        </>
      ) : (
        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 bg-white">
          <Camera className="w-8 h-8 text-[#A8A29E]" />
          <span className="text-sm text-[#78716C]">Prendre une photo</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) { onChange(null); return; }
          if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image');
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            alert('L\'image doit faire moins de 10 Mo');
            return;
          }
          onChange(file);
        }}
      />
    </div>
  );
}
