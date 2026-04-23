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
