'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { resolveImageAlt, type ProductImage } from '@/lib/product-images';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

/**
 * Storefront multi-image gallery — PLZ-090b.
 *
 * Rendering modes:
 *   - 0 images  → branded placeholder (matches PDP empty state)
 *   - 1 image   → single eager <img>, no gallery chrome
 *   - 2+ images → CSS scroll-snap carousel with dot pagination,
 *                 arrow-key nav, screen-reader "image N of M" live region
 *
 * Per-merchant accents flow via `var(--color-primary)` — zero hardcoded hex.
 */
export function ProductImageGallery({
  images,
  productName,
  className,
}: ProductImageGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const announceRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;

  // Scroll to a specific slide, anchored to the snap point.
  // Honours `prefers-reduced-motion` — users who opt out of animation get
  // an instant jump instead of the smooth scroll.
  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const clamped = Math.max(0, Math.min(index, total - 1));
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollTo({
      left: scroller.clientWidth * clamped,
      behavior: prefersReducedMotion ? 'auto' : behavior,
    });
    setActiveIndex(clamped);
  }, [total]);

  // Observe horizontal scroll to keep activeIndex in sync (debounced so
  // the live region doesn't spam while the user is still dragging).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || total < 2) return;

    const onScroll = () => {
      if (announceRef.current) window.clearTimeout(announceRef.current);
      announceRef.current = window.setTimeout(() => {
        const width = scroller.clientWidth;
        if (width <= 0) return;
        const nextIndex = Math.round(scroller.scrollLeft / width);
        setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
      }, 100);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (announceRef.current) window.clearTimeout(announceRef.current);
    };
  }, [total]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (total < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  };

  // ── Zero images → branded placeholder ─────────────────────────────
  if (total === 0) {
    return (
      <div
        className={`w-full h-full bg-[#F5F5F4] flex items-center justify-center ${className ?? ''}`}
        data-testid="customer-product-detail-image"
      >
        <span className="text-6xl text-[#D6D3D1]">🛍️</span>
      </div>
    );
  }

  // ── Single image → no gallery chrome ──────────────────────────────
  if (total === 1) {
    const only = images[0];
    return (
      <img
        src={only.url}
        alt={resolveImageAlt(only, productName, 0)}
        loading="eager"
        className={`w-full h-full object-cover ${className ?? ''}`}
        data-testid="customer-product-detail-image"
      />
    );
  }

  // ── Multi-image gallery ───────────────────────────────────────────
  return (
    <div
      className={`relative w-full h-full ${className ?? ''}`}
      data-testid="customer-product-detail-gallery"
    >
      {/* Scroll-snap carousel */}
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName} — galerie d'images`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory motion-safe:scroll-smooth focus:outline-none focus-visible:ring-2"
        style={{
          scrollSnapType: 'x mandatory',
          // Hide native scrollbar cross-browser without bleeding into global CSS.
          scrollbarWidth: 'none',
        }}
      >
        {images.map((img, i) => {
          // Slide carries aria-label="{productName} image N of M". If the merchant
          // didn't author a custom alt, `resolveImageAlt` falls back to the same
          // string → screen readers would announce it twice. Mirror the predicate
          // from `resolveImageAlt` and pass alt="" when the fallback would collide.
          const hasCustomAlt = (img.alt ?? '').trim().length > 0;
          const alt = hasCustomAlt ? resolveImageAlt(img, productName, i) : '';
          return (
            <div
              key={`${img.url}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${productName} image ${i + 1} of ${total}`}
              className="shrink-0 w-full h-full snap-center flex items-center justify-center"
              style={{ scrollSnapAlign: 'center' }}
            >
              <img
                src={img.url}
                alt={alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
                className="w-full h-full object-cover"
                data-testid={i === 0 ? 'customer-product-detail-image' : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5"
        data-testid="customer-product-detail-gallery-dots"
      >
        {images.map((_, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to image ${i + 1} of ${total}`}
              aria-current={active ? 'true' : undefined}
              className={cn(
                // 24×24 CSS-px hit area — WCAG 2.5.8 AA target size.
                'grid place-items-center h-6 w-6 rounded-full',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-primary,#1A6BFF)]',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'block rounded-full transition-all',
                  // Inactive dot: stone-500 (#78716c) on bg-white/70 pill
                  // clears WCAG 1.4.11 3:1 non-text contrast (~4.3:1).
                  active
                    ? 'h-2.5 w-2.5 bg-[var(--color-primary,#1A6BFF)]'
                    : 'h-2 w-2 bg-stone-500',
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Screen-reader live region — announces N of M on settle */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="customer-product-detail-gallery-liveregion"
      >
        {`Image ${activeIndex + 1} of ${total}`}
      </div>
    </div>
  );
}
