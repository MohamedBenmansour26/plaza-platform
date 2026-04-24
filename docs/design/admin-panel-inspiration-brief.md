# Admin panel — UI inspiration & direction brief

Author: Antonio (product design) · Status: DRAFT — founder review gate before implementation · Date: 2026-04-23 · Scope: Section D Phase 1 of admin build-out

This brief sets the visual and interaction direction for every new admin-panel screen built after PLZ-060/061. It is deliberately opinionated: admin tooling is data-dense operations software, not a consumer interface, and the visual contract should reflect that from day one. It builds on the token vocabulary Hamza already shipped in PR #83 (`.admin-scope` + `--admin-color-*` CSS variables) so no new token additions are required for Phase 1.

---

## 0. What's already in the codebase (anchors, not replacements)

The existing admin surface has the right bones. Any new screen builds on these — don't fork.

- **Shell:** `app/admin/_components/AdminShell.tsx` — 240 px dark sidebar (`#0F172A`) + white topbar + content column. Desktop-first (≥1024 px); `DesktopRequired` blocks below.
- **Scope + tokens:** `.admin-scope` class applied at the route boundary. All color references use `var(--admin-color-*)` (see `app/globals.css:171-200`). New components MUST NOT reintroduce hex literals — pick the closest token.
- **Table:** `app/admin/_components/DataTable.tsx` — generic, typed, supports keyboard nav (`j`/`k`/`↑`/`↓`/`Enter`), skeleton loading, empty-state slot, focus-visible left border. Extend this — do not write a second Table.
- **Status chip:** `app/admin/_components/StatusChip.tsx` — 7 variants today (`pending`, `approved`, `rejected`, `resubmit`, `suspended`, `neutral`, `info`). Vocabulary expanded below.
- **Filter bar:** `app/admin/_components/FilterBar.tsx` — search input + chip array pattern. Reuse it for every queue/list.
- **Existing reference screen:** `app/admin/(shell)/drivers/pending/PendingQueueClient.tsx` is the gold standard for a queue today. Match its density and structure on new queues before inventing new patterns.

Rule of thumb: if a new screen needs a pattern we don't have, describe it here first and add it to `_components/` before using it in-page.

---

## 1. Visual density contract

Admin is **measurably tighter** than merchant or storefront. Operators scan rows, not hero sections.

| Dimension | Storefront / merchant | Admin | Ratio |
| --- | --- | --- | --- |
| Base body text | 15–16 px | **13–14 px** | ~85 % |
| Table-row height | 56–64 px (merchant product list) | **40–48 px** | ~75 % |
| Page content horizontal padding | 16 px mobile / 24 px desktop | **32 px** (`px-8`) inside a `max-w-[1280px]` | — |
| Section vertical rhythm | 24–32 px between cards | **16–24 px** | tighter |
| Primary button height | 48–56 px | **36–40 px** (`h-9` / `h-10`) | ~75 % |
| Chip / badge height | 22–28 px | **18–20 px** | ~80 % |
| Color-primary usage | hero + CTAs + accents (generous) | **CTA + active-row indicator only** (reserved) | sparing |

Concretely for Phase 1:

- Page headers: `text-[22px] font-semibold`, one line, followed by a `text-[13px] text-[#78716C]` description, max one line. No decorative illustration, no hero gradient.
- Table headers: 10 px vertical padding, `text-[12px] font-semibold uppercase tracking-wider`, muted (#78716C). Sticky when the table scrolls vertically.
- Row-hover: `var(--admin-color-row-hover)` (`#F1F5F9`). Row-selected (keyboard nav): `var(--admin-color-row-selected)` (`#F5F5F4`) + 2 px left border in primary.
- Never more than **one** primary-colored element per sub-section. If there's a primary CTA, the row-selected indicator is enough accent — don't add a second.

---

## 2. Table pattern

Extend `DataTable.tsx`. No new table component.

**Columns are first-class.** Each screen defines a typed `DataTableColumn<T>[]` with explicit `width`, `align`, and `render`. Widths are fixed px (never %) so columns don't reflow as data changes. The first column (entity identity: driver name + avatar, order number, merchant name, etc.) is always the widest and gets the focus-ring left border.

**Column conventions — required for Phase 1 list screens:**

- **Identity column** (always first, unset width → fills remainder): avatar/icon + bold entity name + muted secondary line (phone, email, store slug). 7-letter initials circle using `--admin-color-primary-tint`.
- **Timestamp column:** show relative time (`Il y a 2h`, `Hier`, `Il y a 3j`) with the absolute time in a native `title` tooltip. Helper: `relativeTime(iso)` in `PendingQueueClient.tsx` — lift to a shared util.
- **Status column:** always a `<StatusChip>`, never raw text. 110–120 px fixed width.
- **Quantitative column** (count, delay, amount): `tabular-nums` + right-aligned. 100 px fixed. Never left-align numbers.
- **Action column** (last): 100 px, right-aligned, `Examiner →` / `Ouvrir →` pattern. Same primary color as CTAs. Full row is clickable — the chevron is affordance only.

**What we ARE adding in Phase 1:**

- **Sticky column headers** (`thead` already renders a tinted row; add `sticky top-0` inside a vertical-scroll container). Critical for long queues (>30 rows).
- **Column sort indicators.** Today the `sortable` prop exists but nothing renders — add a small up/down caret in the header; use `tabular-nums` in sorted columns.
- **Row hover reveal.** On hover, show a tiny ghost action (⌘K, inline rejet/promote in Phase 2) at the row's right edge. Keep it subtle — chevron replaced by action cluster.

**What we are explicitly NOT adding yet:**

- Column resize drag handles. Nice-to-have; defer until we have a screen where operators ask for it. Premature.
- Virtualised rows. Only worth the complexity if a list exceeds ~500 rows; we're nowhere close.
- Per-column filter dropdowns inside the header. We use the `FilterBar` above the table — keep filter affordances in one place.

---

## 3. Queue pattern

A queue is an ordered list of items awaiting operator action. Current: `/admin/drivers/pending`. Upcoming: `/admin/orders/stuck` (P1), `/admin/deliveries/timed-out` (P2), `/admin/support/open` (P2).

Decision: **queues are rows on desktop, cards on mobile.** Queue cards are NOT used on desktop even for "high-visibility" items — density beats decoration every time for operators on a 27" screen.

**Desktop queue anatomy (top to bottom):**
1. Page header: title + count chip (`<StatusChip variant="pending">12 dossiers</StatusChip>`) + refresh button (top-right, secondary style).
2. FilterBar (search + chip array).
3. DataTable.
4. Keyboard hint line beneath table: `↑↓ naviguer · Entrée ouvrir`.
5. Optional pagination (only when count >50; until then, show all rows).

**Row → detail page transition.** Clicking a row `router.push`es to a detail URL (e.g. `/admin/drivers/[id]`). No modal. Rationale: detail pages need deep-links for Slack/email handoffs between operators; modals break that.

**Severity banding.** Queues that have SLAs (e.g. pending >48 h, timed-out deliveries) get a severity chip in the "delay" column: `neutral` for <24h, `pending` (amber) for 24–72h, `rejected` (red) for >72h. Apply this pattern now in the pending-drivers queue too so we don't have to retrofit later.

**Empty state.** Not a marketing-style hero — an operational one. Icon (lucide `Inbox`, stroke-1.5) + bold line ("Aucun dossier en attente") + one-sentence muted explanation. Current empty state in `PendingQueueClient` is the template; reuse verbatim.

**Queue card vs queue row — when to pick which.**
- **Row:** default. Every new queue on desktop.
- **Card (mobile only, stacked):** when the operator is on mobile and needs touch-sized targets. Mirror the row's information architecture exactly — same fields, same order — so muscle memory carries across form factors.
- **Card on desktop:** never. There is no admin screen where a card is the right desktop primitive in Phase 1.

---

## 4. Status chip vocabulary

Extend today's 7-variant `StatusChip` to cover the full admin surface. Colors below are locked to tokens; agents must NOT pick new hexes.

| Severity | Variant token(s) | Background | Text | Use for |
| --- | --- | --- | --- | --- |
| **Success** | `approved` | `#F0FDF4` (tint) | `#15803D` | Approved driver, paid order, resolved ticket, active merchant, online driver |
| **Warning** | `pending`, `resubmit` | `#FEF3C7` | `#92400E` | Pending review, SLA amber (24–72h), awaiting resubmission |
| **Danger** | `rejected`, `suspended` | `#FEF2F2` | `#B91C1C` | Rejected, suspended, SLA red (>72h), timed-out delivery, failed payment |
| **Neutral** | `neutral` | `#F5F5F4` | `#44403C` | Default / non-terminal states, "Hors service", inactive filters, count badges without severity |
| **Info** | `info` | primary-tint | `#1E40AF` | System notice (read-only), "Nouveau", filter-active state, cross-links to other admin sections |

**Rules:**

- Each severity level has exactly one background-text pair. New semantic states reuse an existing variant — we never ship a new color pair for a new status. E.g. "dispatched" = `info` (it's an active pipeline state, not a success), "delivered" = `approved`.
- Chips are **read-only**. They are never clickable, never act as filter toggles. Use the `FilterBar` chips for filter actions; they look different (heavier weight, primary-tint when active).
- Never nest a chip inside a button. If a cell both needs a status and an action, put the chip in the status column and the action in the action column.
- Icon-inside-chip is allowed for two cases only: severity-red (tiny `AlertTriangle`) and "new" info (tiny `Sparkle`). Everywhere else, text-only.

---

## 5. Empty / loading / error states

Ops-first tone. Every state tells the operator what to do next.

**Loading.**
- Prefer skeleton rows over spinners in any table context. `DataTable` already supports `loading` + `skeletonRows`. Use 6 skeleton rows for queues (matches average fold).
- For whole-page loads: no full-page blocker. Render the shell + skeleton content underneath. Operators should see the page shape immediately.
- Spinners: only inline inside buttons during a mutation (e.g. "Approve" → spinner → success chip).

**Empty.**
- Title: single declarative line in 18 px semibold, reassuring tone — "Aucun dossier en attente" / "Aucune commande bloquée". Never celebratory ("🎉 All clear!"). Never apologetic ("Sorry, nothing here").
- Subtext: one 13 px muted line telling the operator what would change this view — "Les prochaines soumissions apparaîtront ici automatiquement." / "Les commandes non prises en charge depuis 2h apparaîtront ici."
- Icon: lucide outline, stroke-1.5, stone-400 color. Never a cartoon illustration.

**Error.**
- Inline, never toast-only. A toast disappears; an operator error needs to persist until acknowledged.
- Danger background (`#FEF2F2`) + `AlertTriangle` + one-sentence plain French explanation + primary action ("Réessayer") + secondary action ("Voir les logs" / copy error ID).
- Include the error ID when we have one. Operators escalate to dev via ID, not screenshots.
- For partial-failure cases (2 of 5 rows failed to load), show the 3 that loaded + a strip at the top of the table: "2 lignes n'ont pas pu être chargées. Réessayer."

---

## 6. Inspiration references

Real tools to borrow from. For each, annotate what to take and what to leave. These are reference points — the Phase 1 brief is not "clone these" — it's "pick the density, pick the interaction vocabulary, skip the brand".

### 6.1 Linear — issues list
- **Borrow:** row density (~40 px), keyboard-first nav, subtle row hover, inline status chips left-of-title, avatar initials in brand-tinted circles, workspace-level filter bar that stays pinned, `⌘K` command palette as the global operator shortcut.
- **Leave:** gradient sidebar, Linear-specific shortcut hints (⌘ overlays), the swap-to-dark-mode marketing vibe, animated priority icons.

### 6.2 Stripe Dashboard — Payments list
- **Borrow:** quantitative columns with `tabular-nums` + right-align, clickable rows that push to detail pages (not modals), small "severity" dot at the start of a row for at-a-glance scanning, the pattern of "list + detail side-panel" for fast triage (defer actual side-panel until Phase 2, but design toward it).
- **Leave:** Stripe's signature gradients, the deeply branded primary purple (we use `#1A6BFF`), the segmented control at the top (ours is a chip filter instead).

### 6.3 Retool — Admin tables
- **Borrow:** sticky headers, compact row heights, clear visual separation between header and body, right-aligned action column, the "rows are the product" mentality.
- **Leave:** Retool's default "everything is a button" chrome, the heavy top-bar with builder tooling, multiple competing primary colors within a single view.

### 6.4 Supabase Studio — Table editor
- **Borrow:** monospaced font for IDs (`tabular-nums` + `font-mono` on UUIDs, slugs, phone numbers), minimal column-header styling, skeleton rows over spinners, row selection with keyboard, inline status chips that match our severity vocabulary.
- **Leave:** the SQL-editor split (we're not building a query tool), the green primary (conflicts with our blue), the dark-by-default theme.

### 6.5 GitHub — Issues / PR list
- **Borrow:** the combination of bold identity line + muted metadata underneath (author, timestamp, labels), chip cluster in a dedicated column, hover state revealing secondary actions at the row's right edge, empty-state copy tone.
- **Leave:** GitHub's dense meta-footer per row (we show less metadata), the "reaction" emoji cluster (not an admin pattern), the top tab bar with filter counts (we use the FilterBar instead).

**Screenshot deliverable (follow-up).** I will drop annotated screenshots of the four reference tools into `design-exports/admin-phase1-inspiration/` in the same PR if the founder wants them — today's brief is text-only because the markdown pattern matches `design-exports/plz-090-multi-image-gallery-brief.md`'s text-dominant style and because the tokens/widths/heights above are the load-bearing part, not the mood.

---

## 7. Explicit NON-GOALS

The admin panel is NOT a consumer surface. These are out of scope now and should be defended against in PR review.

- **No hero sections.** Page header is one line of 22 px semibold + one muted subtitle. No banners, no illustrations, no background imagery.
- **No marketing CTAs.** Admin has operational CTAs only ("Approuver", "Rejeter", "Assigner"). No "Upgrade your plan" / "Invite your team" promos even after we add multi-admin support.
- **No decorative imagery.** The only images are: driver document previews, merchant logos in tables, order thumbnails in detail pages. No stock photos, no patterns, no gradients.
- **No animations beyond micro-interactions.** `motion/react` is used for layout shifts only — no staggered enter animations on tables, no flourishes on page transitions. Page loads must feel instant.
- **No dark mode in Phase 1.** The sidebar is dark; the rest is light. Dark-mode-everywhere is a Phase 3 conversation — not now.
- **No per-user personalisation.** Every admin sees the same column layout, the same filter chips, the same sort order. Customisation adds state we don't need and makes "can you see what I see" impossible during incident response.
- **No tooltips on idle state.** Tooltips only appear on truncated text (the timestamp → absolute-time pattern) or on icon-only buttons. We never explain what a visible label means.
- **No cards on desktop queues.** (Re-iterated from §3.) Rows only.
- **No toast-only error reporting.** (Re-iterated from §5.) Errors persist inline.
- **No emoji icons.** Lucide outline only. Emoji in text copy (⚠️, 🎉) is also banned in admin — it breaks the tone.

---

## 8. What happens after founder approval

1. PM turns each Phase-1 screen into a ticket, attaching the relevant sections of this brief as the acceptance criteria.
2. Dev agent builds against `DataTable` / `StatusChip` / `FilterBar` — no new primitives without amending this brief first.
3. Each PR gets one gate check from me against the density contract + status vocabulary; Anas gates for code quality. QA gates for data correctness.
4. First screens expected: `/admin/merchants` list, `/admin/orders` list, `/admin/drivers` directory (active tab alongside pending). All three reuse the same queue skeleton.

---

## Appendix — token quick reference

Pulled from `app/globals.css:171-200`, do not re-invent.

```
--admin-color-primary:          #1A6BFF   // CTAs, selected-row border, "Examiner" links
--admin-color-primary-dark:     #1550CC   // button :hover on primary
--admin-color-primary-tint:     #EFF6FF   // avatar bg, info chip bg
--admin-color-bg:               #F1F5F9   // page background
--admin-color-surface:          #FFFFFF   // cards, table, topbar
--admin-color-text-primary:     #1C1917   // body titles, table cell text
--admin-color-text-secondary:   #44403C   // secondary values
--admin-color-text-muted:       #78716C   // subtitles, muted metadata
--admin-color-text-faint:       #A8A29E   // placeholder, empty-state icons
--admin-color-border:           #E7E5E4   // card + table borders
--admin-color-border-soft:      #F5F5F4   // row dividers
--admin-color-row-hover:        #F1F5F9   // row :hover
--admin-color-row-selected:     #F5F5F4   // row keyboard-selected
--admin-color-success:          #16A34A   // approved chip fg, success dot
--admin-color-success-tint:     #F0FDF4   // approved chip bg
--admin-color-warning:          #D97706   // pending chip fg (via chip mapping)
--admin-color-warning-tint:     #FEF3C7   // pending chip bg
--admin-color-error:            #DC2626   // rejected chip fg
--admin-color-error-tint:       #FEF2F2   // rejected chip bg
--admin-color-sidebar-bg:       #0F172A   // sidebar
--admin-color-sidebar-fg:       #94A3B8   // sidebar label idle
--admin-color-sidebar-active-bg:#1E3A5F   // sidebar selected
--admin-color-sidebar-active-border: #1A6BFF
--admin-color-sidebar-hover-bg: #1E293B
```
