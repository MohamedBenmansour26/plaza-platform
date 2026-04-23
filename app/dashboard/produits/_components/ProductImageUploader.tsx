'use client';

/**
 * PLZ-090c — Merchant multi-image uploader for the product form.
 *
 * Founder requirements (binding):
 *   - Up to 8 images (MAX_PRODUCT_IMAGES soft cap, DB constraint is backup)
 *   - Slot 1 is the "Photo principale" shown on cards across storefront + dashboard
 *   - Drag-to-reorder with keyboard a11y (dnd-kit)
 *   - Per-image delete
 *   - Per-image alt text (optional — resolveImageAlt falls back at render time)
 *   - Per-image upload progress (boolean, matching the PLZ-080 pattern)
 *
 * Pure-UI component. Owns transient uploading state but never writes to the
 * DB directly — parent form handles persistence via the existing server
 * action. Keeps ProductForm.tsx single-responsibility.
 */

import { useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Trash2, GripVertical, ImageOff } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type ProductImage,
  MAX_PRODUCT_IMAGES,
  canAddImage,
  getDefaultAlt,
  removeImageAt,
} from '@/lib/product-images';

type Props = {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productName?: string;
  disabled?: boolean;
  'data-testid'?: string;
};

// Stable id helper — dnd-kit needs a string id per item. We derive it from
// the image url + index so re-renders after an upload/remove don't lose
// drag state mid-gesture. Urls are unique per upload (timestamp in path).
function idFor(img: ProductImage, index: number): string {
  return `${img.url}#${index}`;
}

export function ProductImageUploader({
  value,
  onChange,
  productName = '',
  disabled = false,
  'data-testid': testId,
}: Props) {
  const t = useTranslations('products');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // One boolean flag per ongoing upload (keyed by the client-side index the
  // slot is appended at). Matches the PLZ-080 boolean pattern — we display
  // t('uploading') over the slot while true.
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 4px activation distance — prevents the drag from firing on a simple
      // click/tap (which should open the delete flow, not start a drag).
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const ids = value.map((img, i) => idFor(img, i));
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onChange(arrayMove(value, oldIndex, newIndex));
    },
    [value, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(removeImageAt(value, index));
    },
    [value, onChange],
  );

  const handleAltChange = useCallback(
    (index: number, alt: string) => {
      const next = value.slice();
      next[index] = { ...next[index], alt };
      onChange(next);
    },
    [value, onChange],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadError(null);

      // Honor the cap when multiple files are selected at once.
      const remaining = MAX_PRODUCT_IMAGES - value.length;
      const toUpload = Array.from(files).slice(0, Math.max(0, remaining));
      if (toUpload.length === 0) return;

      setUploadingCount((c) => c + toUpload.length);

      // Upload in parallel; on success append in the order they resolve.
      // We append atomically at the end to avoid race conditions where two
      // onChange calls see stale value props.
      const uploaded: ProductImage[] = [];
      await Promise.all(
        toUpload.map(async (file) => {
          try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('bucket', 'product-images');
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const json = (await res.json()) as { url?: string; error?: string };
            if (json.url) {
              uploaded.push({ url: json.url, alt: '' });
            } else {
              setUploadError(json.error ?? 'upload_failed');
            }
          } catch {
            setUploadError('upload_failed');
          }
        }),
      );

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
      setUploadingCount((c) => Math.max(0, c - toUpload.length));
    },
    [value, onChange],
  );

  const handlePick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const canAdd = canAddImage(value) && !disabled;

  return (
    <div
      className="bg-card rounded-xl shadow-card p-5"
      data-testid={testId ?? 'merchant-product-image-uploader'}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">{t('formPhoto')}</h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          // Allow re-picking the same file if user deletes then re-adds.
          e.target.value = '';
        }}
        data-testid="merchant-product-form-photo-input"
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Image ${String(active.id)} saisie.`,
            onDragOver: ({ active, over }) =>
              over
                ? `Image déplacée sur la position ${over.id}`
                : `Image ${String(active.id)} en cours de déplacement.`,
            onDragEnd: ({ over }) =>
              over
                ? `Image déposée à la position ${over.id} sur ${value.length}.`
                : `Déplacement annulé.`,
            onDragCancel: () => 'Déplacement annulé.',
          },
        }}
      >
        <SortableContext
          items={value.map((img, i) => idFor(img, i))}
          strategy={rectSortingStrategy}
        >
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            data-testid="merchant-product-image-uploader-grid"
          >
            {value.map((image, index) => (
              <SortableSlot
                key={idFor(image, index)}
                id={idFor(image, index)}
                image={image}
                index={index}
                productName={productName}
                disabled={disabled}
                onRemove={() => handleRemove(index)}
                onAltChange={(alt) => handleAltChange(index, alt)}
              />
            ))}

            {/* Uploading placeholder tiles — one per in-flight upload. */}
            {Array.from({ length: uploadingCount }).map((_, i) => (
              <div
                key={`uploading-${i}`}
                className="aspect-square rounded-lg bg-muted/60 border border-border flex flex-col items-center justify-center gap-2"
                data-testid="merchant-product-image-uploader-uploading"
              >
                <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-muted-foreground">{t('uploading')}</span>
              </div>
            ))}

            {/* "+" tile — hidden when at cap. */}
            {canAdd && (
              <button
                type="button"
                onClick={handlePick}
                disabled={disabled}
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-[var(--color-primary)] hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
                data-testid="merchant-product-image-uploader-add-btn"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[11px]" style={{ color: 'var(--color-primary)' }}>
                  {value.length === 0 ? t('formPhotoAdd') : '+'}
                </span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-muted-foreground mt-3">
        {t('formPhotoFormats')}
        {' · '}
        <span>
          {value.length}/{MAX_PRODUCT_IMAGES}
        </span>
      </p>

      {uploadError && (
        <p
          className="text-xs text-destructive mt-1.5"
          data-testid="merchant-product-image-uploader-error"
        >
          {uploadError === 'file_too_large'
            ? 'Fichier trop volumineux (max 5 Mo)'
            : uploadError === 'invalid_type'
              ? 'Format de fichier non supporté'
              : "Erreur d'envoi — réessayez"}
        </p>
      )}

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
          <ImageOff className="w-3.5 h-3.5" />
          Ajoutez au moins une image pour pouvoir publier.
        </p>
      )}
    </div>
  );
}

// ─── Sortable slot ──────────────────────────────────────────────────────────

type SlotProps = {
  id: string;
  image: ProductImage;
  index: number;
  productName: string;
  disabled: boolean;
  onRemove: () => void;
  onAltChange: (alt: string) => void;
};

function SortableSlot({
  id,
  image,
  index,
  productName,
  disabled,
  onRemove,
  onAltChange,
}: SlotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isCover = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-1.5 ${isDragging ? 'z-10' : ''}`}
      data-testid="merchant-product-image-uploader-slot"
      data-index={index}
    >
      <div
        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
          isCover ? 'border-[var(--color-primary)]' : 'border-border'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* "Principale" badge on slot 1 */}
        {isCover && (
          <span
            className="absolute top-1 start-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow"
            style={{ backgroundColor: 'var(--color-primary)' }}
            data-testid="merchant-product-image-uploader-cover-badge"
          >
            Principale
          </span>
        )}

        {/* Drag handle — keyboard-focusable, announces via dnd-kit */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute top-1 end-1 w-7 h-7 rounded-md bg-black/50 text-white flex items-center justify-center hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          aria-label={`Déplacer l'image ${index + 1}`}
          disabled={disabled}
          data-testid="merchant-product-image-uploader-drag-handle"
          data-index={index}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Delete — bottom-right so it doesn't overlap the drag handle */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute bottom-1 end-1 w-7 h-7 rounded-md bg-black/50 text-white flex items-center justify-center hover:bg-destructive focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          aria-label={`Supprimer l'image ${index + 1}`}
          disabled={disabled}
          data-testid="merchant-product-image-uploader-delete-btn"
          data-index={index}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Cover label under slot 1 (per founder binding) */}
      {isCover && (
        <span className="text-[11px] font-medium text-[var(--color-primary)] text-center">
          Photo principale
        </span>
      )}

      {/* Alt text — placeholder shows the fallback that resolveImageAlt
          would use at render time. */}
      <input
        type="text"
        value={image.alt}
        onChange={(e) => onAltChange(e.target.value)}
        placeholder={getDefaultAlt(productName || 'Produit', index)}
        aria-label={`Texte alternatif pour l'image ${index + 1} (optionnel)`}
        disabled={disabled}
        className="w-full h-8 px-2 border border-border rounded text-[11px] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
        data-testid="merchant-product-image-uploader-alt-input"
        data-index={index}
      />
    </div>
  );
}
