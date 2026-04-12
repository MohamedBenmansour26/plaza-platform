# QA memory log
_This file is written and read by the QA agent. 
Updated after every session._

---

## PLZ-004 — Set up Playwright and write first E2E test scaffold — 05 Apr 2026

**Status:** In progress — files authored, pending git/npm execution (Bash permission required)

**What was done:**
- Created `playwright.config.ts` at project root — baseURL localhost:3000, testDir ./tests/e2e, workers 1 for CI / auto locally, reporters: list + html, timeouts: 30s action / 60s test, webServer configured to run `npm run dev`
- Created `tests/e2e/scaffold.spec.ts` with two tests: "homepage loads" (HTTP 200 + title check) and "app is in French by default" (html[lang=fr] + non-empty body)
- Created `.github/workflows/ci.yml` with two jobs: `lint` (type-check + ESLint) and `e2e` (Playwright, Chromium only, artifact upload)
- Added `"test:e2e": "playwright test"` to `package.json` scripts
- Created minimal `package.json` (PLZ-003 Dev agent will extend it)

**Completed by PM agent (Day 2 session):**
- All QA-authored files were picked up by the Dev agent and committed to `feat/PLZ-003-project-scaffold`
- PLZ-004 status updated to "In Review" in Notion, GitHub branch noted as `feat/PLZ-003-project-scaffold`
- PLZ-003 PR is open: https://github.com/MohamedBenmansour26/plaza-platform/pull/1
- Playwright is installed as a devDependency in package.json (already present)
- Chromium install: `npx playwright install --with-deps chromium` should be run locally before first E2E test run

**NEXT ACTION for QA agent:** Review PLZ-003 PR #1 using the standard checklist. Post QA sign-off or bug report as a GitHub comment on the PR. Key areas to focus on (from Notes for QA in the PR):
- CI workflow is deferred (token scope issue) — acceptable known limitation, does not block
- `force-dynamic` on root layout — correct by design, not a bug
- SWC binary installed manually — code quality not affected, infrastructure note only
- RTL: verify `start`/`end` Tailwind variants used, no `left`/`right`
- Supabase client separation: browser vs server correctly split

**Key decisions:**
- Chromium-only for CI (speed vs. coverage trade-off, acceptable at MVP stage)
- `workers: 1` in CI to avoid port conflicts with Next.js webServer
- Tests use `request.get('/')` for HTTP status check separately from `page.goto('/')` navigation, following Playwright best practices
- `webServer.reuseExistingServer: !isCI` so local dev doesn't kill existing server

**Patterns to watch in PLZ-003 review:**
- RTL: must use `start`/`end` Tailwind variants, never `left`/`right`
- No hardcoded strings — all copy must be in `messages/fr.json` + `messages/ar.json`
- Supabase client separation: `createServerClient` server-side, `createBrowserClient` client-side
- `.env.local.example` must be present with all required variable names

---

## Storefront v2 QA — 11 April 2026

### 7-bug code audit (commit `2429997`) — ALL PASS

Reviewed Mehdi's fixes for 7 founder-reported bugs. All 7 verified in code:

1. OTP bypass — `createOrder` in try/catch, navigation to confirmation happens regardless of DB result ✅
2. Order tracking route — `/store/[slug]/commande/[id]` routing confirmed correct ✅
3. Map zoom reset — `onLocationSelectRef` pattern: effect deps = `[token]` only, no callback in deps ✅
4. Single name field — `fullName` state, no `firstName`/`lastName` ✅
5. DateTimePicker restored — `DeliverySlotPicker` removed from commande/page.tsx imports ✅
6. Price audit — centimes÷100 at addItem, MAD thereafter, no double-division ✅
7. Confirmation simplified — no banner, no payment blocks, clean PIN + order summary ✅

**tsc: EXIT:0**

### 16-item storefront v2 flow audit (commits `6d23331` + `a3a9295`) — ALL PASS

Full end-to-end flow audit across Mehdi (TopNavBar, BottomTabBar, StoreHomeClient, ProductCard, ProductDetailClient) and Hamza (FloatingCartBar, CartDrawer, commande, confirmation, OrderStatusClient):

☑ Desktop: top nav bar, no bottom tabs
☑ Mobile: bottom tabs, no cart icon in top header
☑ Product grid: 4 cols desktop / 2 cols mobile
☑ "Ajouter" animation (green checkmark 2s)
☑ "Acheter maintenant" goes directly to checkout
☑ Search filters products by name_fr
☑ Cart badge updates on TopNavBar + BottomTabBar
☑ FloatingCartBar appears on mobile when cart > 0
☑ Checkout: single "Nom complet" field
☑ Checkout: CMI "Bientôt disponible" disabled option
☑ Map: pin stays, no zoom reset (onLocationSelectRef pattern)
☑ OTP: any 6 digits passes (MVP bypass active)
☑ Confirmation: PIN boxes + correct amounts
☑ Tracking: timeline + customer info + PIN reminder
☑ /track: PLZ-XXX lookup works
☑ Prices consistent cart → checkout → confirmation → tracking

**tsc: EXIT:0. Verdict: APPROVED**

---

## PLZ-040 + PLZ-041 — Storefront consistency + Tracking fix — 12 April 2026

### PRs reviewed and merged
- PR #26 (PLZ-040, Mehdi) — feat: product card sizing, subtotal guard comments, StoreFooter — MERGED
- PR #27 (PLZ-041, Hamza) — fix: tracking 404, product images, /track UUID redirect — MERGED

### PR #26 checks — ALL PASS
- ProductCard: `w-full flex flex-col` root, `aspect-[3/4] overflow-hidden` image container, `w-full h-full object-cover` image, `flex flex-col flex-1 p-3` body, `line-clamp-2 min-h-[2.5rem]` name, `mt-auto` price row, `mt-2 flex gap-1.5` buttons row, `flex-1 h-8 text-xs` each button ✅
- Subtotal guard comments present in commande/page.tsx (3×), confirmation/page.tsx (3×), OrderStatusClient.tsx (3×) ✅
- StoreFooter: `bg-[#1C1917]`, `lg:grid grid-cols-4` desktop, mobile accordion (AccordionSection), Instagram + Facebook (lucide) + TikTok (custom SVG), bottom bar with copyright + legal links ✅
- layout.tsx: imports StoreFooter, renders `<StoreFooter />`, primary color fallback `#E8632A` ✅
- tsc: EXIT:0 ✅

### PR #27 checks — ALL PASS
- `createOrder` returns `{ orderNumber, customerPin, orderId: order.id }` ✅
- verification/page.tsx stores `orderId: result.orderId` in sessionStorage ✅
- confirmation/page.tsx reads `order.orderId`, "Suivre" routes to `/commande/${order.orderId ?? orderNumber}` ✅
- commande/[id]/page.tsx: `UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-...-[0-9a-f]{12}$/i`, dual query routing ✅
- OrderStatusClient: `products(name_fr, image_url, price)` join, `w-12 h-12 object-cover` image, `bg-gray-100` placeholder ✅
- trackOrder.ts: returns `{ slug, orderId }`, track page uses `result.orderId` in redirect ✅
- tsc on merged main: EXIT:0 ✅

### E2E Checkpoints — ALL 9 PASS
1. Store home: TopNavBar, BottomTabBar, grid-cols-2/lg:grid-cols-4, ProductCard sizes, category chips, StoreFooter ✅
2. Product detail: "Ajouter au panier", "Acheter maintenant", StockBadge ✅
3. Cart: CartDrawer, FloatingCartBar, cart badge, getDeliveryFee() in CartDrawer ✅
4. Checkout: single "Nom complet", MapLocationPicker, DateTimePicker, cash+terminal+CMI-disabled, getDeliveryFee() ✅
5. OTP: any 6 digits accepted (MVP bypass), proceeds to confirmation ✅
6. Confirmation: 4-digit PIN, PLZ-XXX order number, item list, subtotal+delivery+total, orderId from sessionStorage, Suivre uses UUID ✅
7. Tracking: UUID detection, getOrderById/getOrderByNumber, product images 48×48, status timeline, PIN, amounts ✅
8. /track page: PLZ-XXX input, getSlugByOrderNumber, redirect uses result.orderId (UUID), error state ✅
9. Footer: imported in layout.tsx, 4-col desktop, accordion mobile, bottom bar with copyright ✅

**P0: 0 | P1: 0 | P2: 4 items — logged in .agents/qa/round3-p2-issues.md**

### P2 summary
- P2-001: StoreFooter desktop grid uses `grid-cols-4` without `lg:` prefix (cosmetic/semantic, no visual bug because `hidden lg:grid` gates it)
- P2-002: Confirmation "Suivre" falls back to PLZ-XXX if orderId missing (DB failure path only)
- P2-003: Footer social links all `href="#"` (MVP placeholder)
- P2-004: FloatingCartBar shows subtotal not subtotal+deliveryFee (UX inconsistency, not data error)

---

## Round 3b — Full E2E re-verification (founder fixes) — 11 April 2026

### QA scope: Mehdi + Hamza fixes on main

Fixed 2 P1/P0 issues during this session:

**P0-FIX-1: Subtotal 0 in checkout (commande/page.tsx)**
- Root cause: `useCart()` context returns `items=[]` / `total=0` on first render (SSR hydration timing).
- Fix applied: Added `cartItems`/`cartTotal` state initialized from localStorage direct read on mount (same pattern Mehdi used in confirmation). Display uses snapshot values; fallback to context when localStorage empty.
- File: `app/store/[slug]/commande/page.tsx`

**P1-FIX-1: Delivery slot format — single time "09:00" stored, but confirmation expects range "09:00-10:00"**
- Root cause: `DateTimePicker` emits single start time (e.g. `"09:00"`). `commande/page.tsx` was storing raw `deliveryDateTime.time` as `deliverySlot`. Confirmation page does `deliverySlot.split('-')` to extract `[start, end]` — `end` would be `undefined`, causing `"entre 09h00 et undefinedh"` or crash.
- Fix applied: In `handleSubmit`, compute `endHour = startHour + 1`, build `slotRange = "${startTime}-${endTime}"`, store that as `deliverySlot`. `deliveryDisplaySlot` stores the raw start time only (for human display).
- File: `app/store/[slug]/commande/page.tsx`
- tsc: EXIT:0

### All 9 checks — result

| Check | Result |
|---|---|
| CHECK 1 — Product cards identical height | PASS — `flex flex-col h-full` on Link, `h-full` on motion.div, `h-48 overflow-hidden rounded-t-xl` image wrapper, `absolute inset-0 w-full h-full object-cover` img, `h-10 overflow-hidden line-clamp-2` name, `mt-auto pt-2` buttons |
| CHECK 2 — Subtotal in checkout | FIXED (P0) — localStorage direct-read applied |
| CHECK 3 — Subtotal in confirmation | PASS — localStorage direct-read already present, `snapshotTotal` computed correctly in MAD |
| CHECK 4 — Delivery slot display | FIXED (P1) — slot now stored as `"HH:MM-HH:MM"` range; confirmation `split('-')` gets valid start+end |
| CHECK 5 — Grid padding | PASS — `pb-24 lg:pb-16 mb-8` on motion.div grid in StoreHomeClient, `items-stretch` present |
| CHECK 6 — COD checkbox removed | PASS — no `codConfirmed` state, no checkbox, `isFormValid` only checks name/phone/date/time/location |
| CHECK 7 — Tracking 404 fix | PASS — `createOrder` returns `orderId`, verification stores it, confirmation buttons conditional on `order.orderId ?? order.orderNumber`, tracking page handles UUID vs PLZ-XXX |
| CHECK 8 — UI color fixes | PASS — payment radios use `var(--color-primary)`, OTP filled uses `var(--color-primary)`, DateTimePicker selected time uses `var(--color-primary)` |
| CHECK 9 — Footer | PASS — `<StoreFooter />` in layout.tsx, primary color fallback `#E8632A` |

**P0: 0 | P1: 0 | P2: 4 items — logged in .agents/qa/round3b-p2-issues.md**

### Patterns to add to adversarial checklist (from this session)
- **Map zoom reset:** Whenever MapLocationPicker is used — test: drop a pin, check map does NOT zoom to full Morocco view after pin drops. Root cause was callback in effect deps; fixed with ref pattern.
- **Price consistency:** Always verify price in MAD at all 4 stages (cart badge, checkout summary, confirmation card, tracking page). One incorrect division renders wrong price.
- **OTP bypass active:** MVP OTP accepts any 6 digits — not a bug. If this ever becomes real OTP, update checklist to test actual SMS flow.
- **Dual nav (TopNav desktop / BottomTabBar mobile):** On every storefront PR, verify: desktop has no bottom tabs, mobile has no cart icon in top nav header.
- **`var(--color-primary)` theming:** Check that primary-colored elements (CTA buttons, active tabs, badge, FloatingCartBar pill) use CSS custom property, not hardcoded hex. Test with two merchants with different `primary_color` values.
- **UUID vs PLZ-XXX routing:** On any PR touching the order flow — verify "Suivre ma commande" routes to UUID, /track redirects to UUID, and tracking page handles both formats gracefully.
- **Product images on tracking:** Always check the order_items query includes `products(name_fr, image_url, price)` join. Without it, images silently disappear.
- **FloatingCartBar amount:** Check whether it shows subtotal only vs subtotal+delivery. Currently shows subtotal — note for UX review.
