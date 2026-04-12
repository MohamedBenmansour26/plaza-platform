# QA Round 3b — P2 Issues

Date: 2026-04-11
QA: Anas

---

## P2-01: OrderStatusClient delivery slot display uses `–` (en-dash) not `et` phrasing

**File:** `app/store/[slug]/_components/OrderStatusClient.tsx` line 28  
**Symptom:** The tracking page shows `"09h00 – 10h00"` while the confirmation page shows `"entre 09h00 et 10h00"`. Minor inconsistency in French phrasing across pages.  
**Impact:** Cosmetic only — data is correct. Both times display correctly.  
**Suggested fix:** Update `formatDeliverySlot` to use `"entre X et Y"` phrasing for consistency with confirmation page.

---

## P2-02: CartProvider persists empty cart to localStorage immediately on mount

**File:** `app/store/[slug]/_components/CartProvider.tsx` lines 51-54  
**Symptom:** On mount, `items = []`. The persist effect runs and writes `[]` to localStorage before the hydrate effect reads the existing cart. This creates a brief race condition where localStorage could momentarily be overwritten.  
**Impact:** Extremely unlikely to cause visible issues in practice (both effects run in the same tick, hydrate fires first), but technically unsafe.  
**Suggested fix:** Skip the persist effect on the very first render (use a `mounted` ref guard).

---

## P2-03: Checkout summary shows items/total as 0 on very first paint (pre-hydration flash)

**File:** `app/store/[slug]/commande/page.tsx`  
**Status:** Fixed in round 3b — localStorage direct-read on mount eliminates the 0-total display. However, there is still a single-frame flash before the `useEffect` runs where `cartItems = []` and `cartTotal = 0`, meaning `items = contextItems = []` and `total = contextTotal = 0` on that very first paint.  
**Impact:** Imperceptible on modern devices; would only be visible on a CPU-throttled trace.  
**Suggested fix:** Initialize `cartItems` from a sync read of localStorage (SSR-safe guard with `typeof window !== 'undefined'`).

---

## P2-04: `commande/page.tsx` button "Confirmer la commande" shows `0 MAD` before merchant loads

**File:** `app/store/[slug]/commande/page.tsx` line ~370  
**Symptom:** The sticky bottom button renders `"Confirmer la commande • 0 MAD"` until merchant data loads (the delivery fee threshold depends on merchant). Only visible for ~100-300ms on initial load.  
**Impact:** Cosmetic flash only.  
**Suggested fix:** Show a skeleton or dash while merchant is null.
