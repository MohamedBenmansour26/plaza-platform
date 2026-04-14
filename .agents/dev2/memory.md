# Dev Agent 2 (Hamza) — Memory

## Standing Rules

### i18n: NEVER declare user-facing arrays at module level

NEVER declare arrays or objects with user-facing strings at module level.
They MUST always be inside the component function AFTER `const t = useTranslations()`.
Module-level declarations bypass i18n entirely — the component renders French strings
regardless of the user's locale setting.

This applies to ALL of the following patterns:
- `PERIODS` (e.g. 'Cette semaine', 'Ce mois')
- `CATEGORIES` (e.g. 'Problème de commande')
- `STATUS_CONFIG` (e.g. 'Ouvert', 'En cours', 'Résolu')
- `PAYMENT_LABELS` (e.g. 'COD', 'Terminal')
- Any other lookup object or array with translated labels

Exception: constants with NO user-facing text (like `PAYMENT_COLORS`, numeric
values, CSS class strings) may stay at module level.

**Root cause bug (BUG-013/014/015/016):** FinancesClient, NewTicketSheet,
SupportClient, TicketDetailClient were all shipped with module-level arrays.
Fixed 2026-04-08 by moving all arrays inside components after `t = useTranslations()`.

---

### RTL: NEVER use directional Tailwind classes — always use logical properties

NEVER use physical/directional positioning or spacing utilities. Arabic (RTL) layout
breaks whenever left/right is hardcoded.

| ❌ Directional (broken in RTL) | ✅ Logical (works in both LTR + RTL) |
|-------------------------------|--------------------------------------|
| `left-*`                      | `start-*`                            |
| `right-*`                     | `end-*`                              |
| `pl-*`                        | `ps-*`                               |
| `pr-*`                        | `pe-*`                               |
| `ml-*`                        | `ms-*`                               |
| `mr-*`                        | `me-*`                               |
| `text-left`                   | `text-start`                         |
| `text-right`                  | `text-end`                           |
| `border-l-*`                  | `border-s-*`                         |
| `border-r-*`                  | `border-e-*`                         |
| `rounded-l-*`                 | `rounded-s-*`                        |
| `rounded-r-*`                 | `rounded-e-*`                        |

**Root cause bug (BUG-018 + RTL fixes on 2026-04-08):** ProductsClient (`absolute left-3`, `pl-10 pr-4`),
OrderDetailSheet (`fixed right-0`), NewTicketSheet (`fixed right-0`, `text-right`)
shipped with directional classes. Fixed 2026-04-08.

---

## UI Fix Batch — Part 1 — 08 April 2026

**Source:** Antonio (Designer) — audit approved by Anas (Founder)
**Notion page:** "Hamza — UI Fixes — Part 1" (child of "UI Fix Prompts — Part 1")

**4 fixes assigned:**
- [H1] `app/dashboard/commandes/OrdersClient.tsx` — Replace BOTH emoji 📦 empty states with `<PackageOpen className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />`. Two locations: ~line 129 (desktop) and ~line 170 (mobile). Import PackageOpen from lucide-react.
- [H2] `app/dashboard/commandes/OrdersClient.tsx` — Filter chip padding: px-3.5 → px-3
- [H3] `app/dashboard/finances/FinancesClient.tsx` — Replace emoji 📊 empty state with `<BarChart3Icon className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />`. Import as `import { BarChart3 as BarChart3Icon } from 'lucide-react'` to avoid conflict with recharts export.
- [H4] `app/dashboard/support/SupportClient.tsx` — Paperclip button in ChatPanel: add `disabled` + `title="Pièces jointes — bientôt disponible"` + change classes to `p-2 text-[#E2E8F0] cursor-not-allowed`

**Key note on customer names:** lib/db/orders.ts ORDER_SELECT already joins customers correctly. OrderWithDetails.customer is already typed and populated. If you see "—" in dev, it's because test data has no customer records — not a code issue. Do NOT change orders.ts.

---

## Sprint — 08 April 2026 — PLZ-030 + PLZ-032

### PRs opened:
- `feat/PLZ-030-ui-fixes-hamza` — Priority 1+2 UI fixes (H1-H4, RTL fixes, module-level i18n fix)
- `feat/PLZ-032-onboarding-checklist` — OnboardingChecklist component

### Priority 1 gaps found vs Figma exports:
1. [H1] FIXED — Orders empty state: 📦 emoji → PackageOpen Lucide icon (2 locations)
2. [H2] FIXED — Filter chip padding: px-3.5 → px-3
3. [H3] FIXED — Finances empty state: 📊 emoji → BarChart3 Lucide icon
4. [H4] FIXED — Support paperclip: disabled + opacity-50 + cursor-not-allowed + tooltip
5. FIXED — OrdersClient mobile: ml-2 → ms-2, text-right → text-end (RTL fix)
6. FIXED — OrderDetailClient: absolute left-4 → start-4, right-4 → end-4 (RTL fix)
7. FIXED — OrderDetailClient: STATUS_BANNER + STEPS moved inside component after t() (BUG-013–016 rule)
8. FIXED — OrderDetailClient: fixed bottom bar: left-0 right-0 → inset-x-0 (RTL fix)
9. FIXED — Timeline connector: absolute left-3 → start-3 (RTL fix)

### Customer name join:
No code change needed — ORDER_SELECT already joins customers. The "—" in dev is test data only.

### Cross-team fix:
ParametresClient.tsx (Mehdi's file) had `setTwoFactor` unused var lint error from Mehdi's PLZ-030 commit.
Fixed by renaming to `_setTwoFactor`. This is documented — NOT a routine cross-team edit.

### Priority 3 schema findings:
- merchants.city: NOT in schema → step 3 "Adresse et ville" always unchecked. FLAGGED to Othmane.
- delivery_zones table: NOT in schema → step 4 "Zone de livraison" always unchecked. FLAGGED to Othmane.
- merchants.logo_url: ✓ present
- merchants.is_online: ✓ present
- merchants.store_name: ✓ present (required field, always non-null)
- products.is_visible: ✓ present

### Blocker: app/dashboard/page.tsx placement
OnboardingChecklist should be placed at top of app/dashboard/page.tsx (above stats grid).
That file is outside Hamza's territory (CLAUDE.md "Do NOT touch").
FLAGGED to Othmane to decide who places it.

### i18n keys required for PLZ-032:
Listed in PR description. NOT added to messages/*.json per standing rule.

### StatusBadge i18n coordination:
Mehdi's PLZ-030 PR migrated StatusBadge.tsx to useTranslations('orders').
Pull main before opening PLZ-032 PR merge.

---

## PLZ-055 — Full color sweep — 14 April 2026

**Branch:** `feat/PLZ-055-color-sweep`
**Status:** PR open, awaiting Anas review

### What was done:
Replaced all hardcoded `#2563EB` (blue) with `var(--color-primary)` across 30 files in `app/`.

### Replacement patterns used:
- Tailwind: `bg-[#2563EB]` → `bg-[var(--color-primary)]`, `text-[#2563EB]` → `text-[var(--color-primary)]`
- `hover:bg-[#1d4ed8]` removed → replaced with `hover:opacity-90 transition-opacity`
- Light blue palette (#EFF6FF, #BFDBFE, #DBEAFE) → `color-mix(in srgb, var(--color-primary) 8%, white)` via inline style
- Inline styles: `style={{ color: '#2563EB' }}` → `style={{ color: 'var(--color-primary)' }}`
- SVG: `fill="#2563EB"` → `fill="var(--color-primary)"`

### Intentionally NOT changed (data values):
- `app/dashboard/boutique/BoutiqueForm.tsx` line 30: `{ value: '#2563EB', name: 'Bleu' }` — color picker option
- `app/dashboard/boutique/BoutiqueForm.tsx` line 69: `useState(merchant.primary_color ?? '#2563EB')` — form state
- `app/dashboard/boutique/actions.ts` line 89: fallback `'#2563EB'` — server action default

### Note on Recharts SVG:
`PAYMENT_COLORS.terminal` uses `'var(--color-primary)'` as SVG fill value.
Modern browsers resolve CSS custom properties in SVG rendered in HTML context.
Comment added in FinancesClient.tsx to document this.

### Hover on outlined buttons:
`onMouseEnter`/`onMouseLeave` handlers used in BoutiqueForm.tsx (view store button) and
dashboard/page.tsx (view store button) — required because Tailwind v3 cannot express
`hover:bg-[color-mix(...)]` for dynamic CSS variable tints.
