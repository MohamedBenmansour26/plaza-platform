# Back-button flow — customer-facing screens

Author: Antonio (product design) · Status: DRAFT — founder review gate before implementation · Date: 2026-04-23

Source of truth for where every back button / "Retour" CTA on the customer side should land, and what state must survive the transition. Compiled by walking every route under `app/store/[slug]/**` and `app/(track)/**`.

Current state audit: every header back button in the flow today calls `router.back()`, which works for a normal forward push sequence but breaks on deep links and on any screen reached via `router.replace` / external URL (e.g. `/track/PLZ-XXXX`, the confirmation → tracking deep link, or an SMS link). The recommendations below shift us from "`router.back()` everywhere" to explicit, intent-driven targets per screen.

---

## Principles

1. **Linear flows (OTP verification, checkout form) — back goes UP the flow, state preserved.**
   The customer's partially-filled state (cart contents, checkout form fields, OTP entry) must never be thrown away by a back tap. Back = "let me fix the step before", not "start over". Implementation: session-scoped snapshot (what checkout already does with `plaza_pending_order`), plus explicit `router.back()` is acceptable here *because* the navigation path is strictly forward.

2. **Exploratory flows (product detail, store info) — back returns to the browse context with scroll position preserved.**
   Browsing is the default mode on the storefront. Back from a product must drop the customer on the exact tile they just opened — not at the top of the grid. Implementation: rely on the Next.js App Router's default scroll restoration on `router.back()`, which requires the origin page to remain in the browser history stack (do **not** use `router.replace` when opening a product from the grid).

3. **Terminal screens (tracking, confirmation, 404) — back goes to store home, NOT into the flow that produced them.**
   Once an order is placed, the customer should never be able to step back into `/verification` or `/commande` (checkout) — those pages are dead for that order. Back from a terminal screen exits to store home or, when the customer arrived via `/track`, to `/track`. Never to cart / checkout / OTP.

---

## Screen-by-screen map

| Screen | Route | Back target | Preserve state? | Why |
| --- | --- | --- | --- | --- |
| Store home | `/store/[slug]` | (no back button — it's the root of the customer flow) | N/A | Root of browsing. Closing the tab is the intended exit. |
| Product detail | `/store/[slug]/produit/[id]` | Store home `/store/[slug]` at the previous scroll position | Yes — scroll position on the grid, selected category chip, search query | Exploratory flow. Classic e-comm pattern: "I opened one product, let me see the next." Requires the storefront to keep scroll state in history (default Next.js App Router behaviour is fine as long as we don't `router.replace` on the grid). |
| Cart drawer (modal over store home) | overlay on `/store/[slug]` | Closes the drawer, returns to store home underneath | Yes — cart items, category filter, scroll position | Drawer is not a page. Back button is the "X" close icon (+ swipe-down on mobile via `vaul`). Hardware back on Android should also close the drawer before leaving the page; today it exits the page — **fix needed**. |
| Cart → checkout entry point | (CTA inside cart drawer) | — | — | N/A — this is a forward push; noted only because checkout's back target is "cart". Recommendation for Cart → Checkout: do **not** open the cart drawer back open on back from checkout. Instead return to the store-home underlay (see next row); the customer can re-open cart with one tap. Rationale: re-opening the drawer automatically fights the browser's back-gesture muscle memory. |
| Checkout | `/store/[slug]/commande` | Store home `/store/[slug]` (NOT the cart drawer) | Yes — cart items persist in `localStorage` and `CartProvider`; form fields are ephemeral (acceptable) | Customer who backs out of checkout wants to add more items or leave. The cart is preserved in storage; customer can re-open it from the floating cart bar. **Recommend: replace `router.back()` with `router.push(/store/[slug])` to make this deterministic on deep-link entry.** |
| OTP verification | `/store/[slug]/verification` | Checkout `/store/[slug]/commande` with all form fields + address + delivery slot re-hydrated | **Yes — critical** | Linear flow. Today `plaza_pending_order` is written before navigating to /verification but the checkout page does NOT read it on mount — so back wipes the customer's typed address. **Fix: on back to /commande, re-hydrate form state from `plaza_pending_order` sessionStorage; clear only on successful confirmation.** |
| Confirmation | `/store/[slug]/confirmation` | Store home `/store/[slug]` | No (order is already placed) | Terminal screen. Must NOT allow back into /verification or /commande — both would show stale state and let the customer re-submit. Implementation: `router.replace(confirmation)` from /verification so the back entry in history points to /store/[slug]; or intercept back and redirect to store home. |
| Order status / tracking (from confirmation deep-link) | `/store/[slug]/commande/[id]` | Store home `/store/[slug]` | No | Terminal. Today's header uses `router.back()` which lands the customer in /confirmation (which itself will bounce them onward, causing a brief flicker) or on /track if they came from there. **Fix: use `router.push(/store/[slug])`** — deterministic, works for SMS deep-links. |
| Track-order lookup | `/track` | Store home of the last merchant viewed (fallback: close tab / browser back) | N/A — form is ephemeral | Today uses `router.back()`. Acceptable fallback, but note: users arriving via an SMS link have no back history → the "Retour" link in the page body (line 142) does nothing. **Fix: if `history.length <= 1`, hide the in-page Retour CTA; keep hardware back native.** |
| Track-order result (after entering PLZ-XXXX) | redirects to `/store/[slug]/commande/[id]` | Same as "Order status / tracking" above — back to that merchant's store home | No | **Founder-flagged bug:** currently OrderStatusClient's back calls `router.back()` which sends the customer to `/track` (where they came from), which is correct for that entry path. BUT when the same URL is reached from `/confirmation`, back bounces into /confirmation. Single fix — always `router.push(/store/[slug])` — resolves both. |
| Store info sheet | modal on `/store/[slug]` (and on some sub-pages) | Closes the sheet, back to the underlying page | Yes | Sheet uses `vaul` Drawer. Close = X button or swipe-down. Same Android hardware-back fix as cart drawer. |
| Category / filter view | Same route `/store/[slug]` (state held in component) | No separate back — changing `selectedCategory` back to "Tous" is the customer's mental model for "undo filter" | Not applicable (no navigation) | Category chips are in-page state, not a routed view. Important: do NOT promote category to a route param (?cat=...) just to get a back target — it would spam the back stack with filter changes and make real back navigation painful. |
| 404 / boutique not found | `notFound()` trigger on `/store/[slug]` or `/produit/[id]` | Home `/` or the Plaza root | No | There is nothing useful to go "back" to. Show a "Retour à Plaza" CTA, not a browser back. |
| Checkout out-of-stock error banner | inline on `/store/[slug]/verification` | Back to `/store/[slug]/commande` (same as normal OTP back) + banner shown there explaining which item was removed | Yes — cart is already reconciled by the checkout's stock-revalidation effect | Today the error links to `/store/[slug]` directly, which is correct as an ESCAPE path. But the header back button should still return to /commande so the customer can pick a replacement payment method or address without re-entering everything. |

---

## Edge cases to cover in the implementation ticket

- **Deep-link entry (SMS, copy-paste).** `router.back()` on deep-linked pages puts the user outside of Plaza. All terminal screens (`confirmation`, `commande/[id]`, `track`) must use explicit targets (`router.push`) so that "Retour" is always meaningful.
- **Android hardware back inside a `vaul` Drawer.** Today, hardware back leaves the page with the drawer still considered "open" in state; on the next visit the drawer briefly flashes open. Fix: trap hardware back while drawer is open → close drawer only.
- **Desktop "Retour" twin.** Desktop product detail page (the 2-col layout at lg+) currently has no back control — customer must use browser back. Add an explicit "← Boutique" breadcrumb in the desktop variant to match the mobile affordance.
- **iOS swipe-back on the product grid.** Our current scroll-restoration works; verify after any `<Suspense>` boundary change in `StoreHomeClient`, since wrapping list rendering in Suspense resets scroll.
- **Stale `plaza_pending_order` from a previous aborted checkout.** On mount, `/commande` should reconcile session state with the current cart slug; if the pending order is for a different slug, discard it (today this is done implicitly — make it explicit so rehydrating checkout fields on back from OTP is safe).

---

## Out of scope for this doc

- Merchant dashboard, driver app, admin panel — they are not customer-facing.
- Hardware gestures beyond Android back + iOS swipe (no 3-finger gestures, no keyboard shortcuts).
- Browser tab-bar back button accessibility — covered implicitly by matching UI back-button behaviour.

---

## Recommended ticket slicing (for PM to decide)

1. **P0 — `/track` deep-link bug (founder-called-out).** Change OrderStatusClient header back to `router.push(/store/[slug])`. One file, one line. Ships first.
2. **P1 — Confirmation → no-going-back guard.** Use `router.replace` on navigation from /verification → /confirmation, so back from confirmation lands on store home. One-liner in `verification/page.tsx`.
3. **P1 — Re-hydrate checkout form from `plaza_pending_order` on mount.** Small refactor in `commande/page.tsx`; makes "back from OTP" preserve the customer's typed address and delivery slot.
4. **P2 — Drawer hardware-back trap.** Android only; touches `CartDrawer.tsx` + `StoreInfoSheet.tsx`.
5. **P2 — Desktop product-detail breadcrumb.** UI-only; adds "← Boutique" link in the lg: variant.
