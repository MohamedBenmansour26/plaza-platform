/**
 * Product image helpers — single source of truth for reading the
 * multi-image gallery payload (added by PLZ-090a).
 *
 * Reused by:
 *   - ProductImageGallery (storefront PDP) — PLZ-090b
 *   - Merchant image upload form           — PLZ-090c
 *
 * Graceful fallback path: if a product has no `images[]` entries (pre-090a
 * rows or a migration gap) we synthesise one from the legacy `image_url`
 * column, which the schema still preserves as a safety net.
 */

export const MAX_PRODUCT_IMAGES = 8;

export type ProductImage = {
  url: string;
  alt: string;
};

/**
 * Anything with an `images` jsonb array and/or the legacy `image_url` column.
 * Deliberately loose so this works for `Product` rows, form drafts, and
 * anonymous API payloads without dragging in the full generated type.
 */
type ProductLike = {
  images?: ProductImage[] | null;
  image_url?: string | null;
};

/**
 * Returns the product's image list as a normalised array.
 * Order of precedence:
 *   1. `images[]` (jsonb) if present and non-empty
 *   2. `[{ url: image_url, alt: '' }]` if only legacy column has a value
 *   3. `[]` (empty — caller should render placeholder)
 */
export function getProductImages(product: ProductLike): ProductImage[] {
  if (Array.isArray(product.images) && product.images.length > 0) {
    // Defensive: filter out entries missing a url (shouldn't happen per
    // schema, but keeps the gallery rendering from crashing on drift).
    return product.images.filter((img) => typeof img?.url === 'string' && img.url.length > 0);
  }
  if (typeof product.image_url === 'string' && product.image_url.length > 0) {
    return [{ url: product.image_url, alt: '' }];
  }
  return [];
}

/**
 * Default alt text when a merchant leaves the alt field blank.
 * Uses 1-based indexing to read naturally ("image 1 of 3").
 */
export function getDefaultAlt(productName: string, index: number): string {
  return `${productName} image ${index + 1}`;
}

/**
 * Single source of truth for resolving the displayed alt attribute.
 * Merchant-entered alt wins; otherwise we fall back to a human-readable default.
 */
export function resolveImageAlt(
  image: { alt: string },
  productName: string,
  index: number,
): string {
  const trimmed = (image.alt ?? '').trim();
  return trimmed.length > 0 ? trimmed : getDefaultAlt(productName, index);
}

// ── PLZ-090c merchant-form mutation helpers ────────────────────────────────
// Pure (no side effects) — safe for use in optimistic React state updates.
// Always return a NEW array so React sees a reference change.

/**
 * Reorder helper for the drag-to-reorder gallery. Returns a new array with
 * the image at `fromIndex` moved to `toIndex`. Out-of-bounds indexes are
 * clamped to a no-op (returns a shallow copy) so the UI cannot corrupt the
 * array via a stale drag event.
 */
export function reorderImages(
  images: ProductImage[],
  fromIndex: number,
  toIndex: number,
): ProductImage[] {
  const next = images.slice();
  if (
    fromIndex < 0 || fromIndex >= next.length ||
    toIndex < 0 || toIndex >= next.length ||
    fromIndex === toIndex
  ) {
    return next;
  }
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Delete helper. Returns a new array without the image at `index`.
 * Out-of-bounds indexes return a shallow copy (no-op).
 */
export function removeImageAt(images: ProductImage[], index: number): ProductImage[] {
  if (index < 0 || index >= images.length) {
    return images.slice();
  }
  const next = images.slice();
  next.splice(index, 1);
  return next;
}

/**
 * Guard used by the "+" tile to know whether another upload slot should be
 * offered. The client-side soft cap enforces the same 8-image limit as the
 * DB check constraint (see 20260423000001_plz090a_product_images_jsonb.sql).
 */
export function canAddImage(images: ProductImage[]): boolean {
  return images.length < MAX_PRODUCT_IMAGES;
}

/**
 * Publish-time guard. Founder requirement (PLZ-090c): merchants may save a
 * draft with 0 images but must supply at least one image before publishing.
 *
 * Returns a discriminated result object so callers can surface the French
 * error message without re-deriving the copy each time.
 */
export function validateImagesForPublish(
  images: ProductImage[],
): { ok: true } | { ok: false; reason: string } {
  if (images.length < 1) {
    return { ok: false, reason: 'Au moins une image est requise pour publier' };
  }
  return { ok: true };
}
