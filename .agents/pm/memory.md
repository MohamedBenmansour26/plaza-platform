# PM memory log
_This file is written and read by the PM agent. 
Updated after every session._

---

## Session — Sunday, 05 April 2026 (Day 1)

### What happened
- First PM session. Read all context files and approval protocol.
- Produced full MVP feature breakdown (15 features, critical path identified).
- Created 5 Day 1 sprint tasks in Notion Sprint Board (PLZ-001 through PLZ-005).
- Posted Day 1 daily report to Notion Daily Reports page.

### Decisions needed from founder (pending)
1. Supabase DB schema sign-off — required before Dev writes any migrations
2. Stripe account status for Morocco — required before payment feature can be built
3. Figma file access confirmation — Designer needs file URL/ID
4. CMI local payment research — flagged as a potential requirement alongside Stripe
5. Content brief approvals — once Growth posts PLZ-005 drafts

### Critical path identified
PLZ-003 (Dev scaffold) → PLZ-006 (Supabase schema) → PLZ-007 (Auth) → PLZ-008 (Onboarding) → PLZ-009 (Store builder) → PLZ-010 (Checkout + Stripe) → PLZ-011 (Order dashboard) → PLZ-012 (Delivery booking)

### Task IDs assigned
- PLZ-001: Analyst — PostHog setup
- PLZ-002: Designer — Figma audit
- PLZ-003: Dev — Project scaffold (P0)
- PLZ-004: QA — Playwright setup
- PLZ-005: Growth — 3 content briefs

### Observations
- PLZ-003 is the critical unblocking dependency for PLZ-001 and PLZ-004
- Design system direction (PLZ-002 output) is a gate for all UI work — needs fast turnaround
- Sprint cadence: daily sprints for now, per CLAUDE.md guidance

---

## Founder decisions log — Sunday, 05 April 2026

1. **Figma file**: `MaRIIUURkhXKyGM9fMMKTE` — proto link provided. Designer has file access.
2. **Supabase schema**: APPROVED — proceed immediately after PLZ-003 merges. Fresh project, delete any existing tables.
3. **Payment model (MVP)**: COD + card on delivery via terminal + card stub (no Stripe for MVP). Three options presented at checkout. Stripe integration deferred to Phase 2.
4. **Supabase project state**: Start fresh. Delete anything existing.
5. **PostHog**: Create new project from scratch.
6. **MVP target date**: 1 week — Saturday 11 April 2026. Feasible given simplified payment model.

### 7-day sprint plan locked
- PLZ-006 created: Supabase schema (Dev, Day 2, P0)
- Full roadmap posted to Notion: Apr 5-11 covering PLZ-003 through PLZ-013
- Safe cuts identified if slippage: metrics dashboard, Arabic RTL, tablet breakpoint

### Key standing decisions
- No Stripe until Phase 2 — payment is COD / terminal / card stub for MVP
- Founder must merge PRs same-day as QA sign-off for 7-day plan to hold
- Arabic RTL is the first safe cut if schedule slips

---

## Session — Monday, 06 April 2026 (Day 2)

### State at start of Day 2
- All Day 1 tasks (PLZ-001 through PLZ-005) still "In Progress" — no agent had shipped yet
- No branches or PRs on GitHub — repo contains only .agents/ system
- No founder responses to PLZ-002 or PLZ-005 (no deliverables posted yet to review)
- PLZ-006 correctly in Backlog

### Actions taken
- Created PLZ-007 (Merchant auth) in Notion Sprint Board — Backlog, P0, Dev
- Posted Day 2 sprint plan to Notion (Daily Reports page)
- Spawned all 5 specialist agents in parallel

### Day 2 agent briefs
- Dev: PLZ-003 (scaffold, P0) → PLZ-006 (schema) immediately after merge
- QA: PLZ-004 (Playwright scaffold) + review PLZ-003 PR when it opens
- Designer: PLZ-002 (Figma audit deliverable to Notion)
- Analyst: PLZ-001 (PostHog setup + event spec + Notion analytics dashboard)
- Growth: PLZ-005 (3 Instagram content briefs posted to Notion)

### Day 2 critical path
PLZ-003 must merge today. If it slips, PLZ-006 and PLZ-007 slide and the 7-day plan is at risk.

### Founder approvals needed today
1. MERGE — PLZ-003 PR (Tier 1, same-day required)
2. DESIGN REVIEW — PLZ-002 Figma audit output (gates Day 3 UI)
3. CONTENT REVIEW — PLZ-005 3 Instagram brief drafts

### Task IDs assigned
- PLZ-007: Dev — Merchant auth (Supabase Auth signup/login/session/protected routes)

### Day 2 progress (updated end of session)
- PLZ-003: PR #1 opened — https://github.com/MohamedBenmansour26/plaza-platform/pull/1
  - Build passes (tsc, lint, npm run build all exit 0)
  - CI workflow deferred: GitHub token needs workflow scope (regenerate in GitHub settings)
  - SWC binary: manually installed via curl (network blocks npm download of this binary)
  - Status in Notion: In Review
- PLZ-002: Design audit report posted to Notion — PENDING FOUNDER APPROVAL
  - Figma file was empty (pages exist but no content)
  - Full design system proposed: terra cotta primary, Plus Jakarta Sans, 8px grid
  - Status in Notion: In Review
- PLZ-001, PLZ-004, PLZ-005: specialist agents hit Bash permission issue — PM took over PLZ-003 and PLZ-002 directly. PLZ-001, PLZ-004, PLZ-005 still need to be completed.

### Critical blocker flagged to founder
GitHub token (GITHUB_TOKEN in .env.local) needs the `workflow` scope added to push CI workflow files. Regenerate at: https://github.com/settings/tokens

---

## Session — Sunday, 05 April 2026 (Day 2 — resumed with new token)

### New GitHub token received
New token with `repo` + `workflow` scope provided by founder. Updated in `.env.local`. (Token redacted from memory log — stored only in `.env.local`.)

### Actions completed
- Fixed BUG-001 (Major): `app/error.tsx` — replaced hardcoded French strings with `useTranslations('common')` calling `t('error')` and `t('retry')`
- Fixed BUG-002 (Minor): `app/layout.tsx` — converted `export const metadata` to `generateMetadata()` with `getTranslations('meta')`. Added `meta` keys to both `fr.json` and `ar.json`.
- Both fixes verified: `tsc --noEmit` PASS, `next lint` PASS
- Committed both fixes + CI workflow: commits `b203e74` and `cc2be3b` pushed to `feat/PLZ-003-project-scaffold`
- Posted QA bug report + re-sign-off on PR #1: https://github.com/MohamedBenmansour26/plaza-platform/pull/1#issuecomment-4189632383
- Dispatched Designer agent to build `app/design-preview/page.tsx` (PLZ-002 validation deliverable)
- Posted Day 2 daily report to Notion

### Waiting on founder
1. **MERGE PR #1** (PLZ-003) — QA approved, CI live. https://github.com/MohamedBenmansour26/plaza-platform/pull/1
2. **DESIGN REVIEW** (PLZ-002) — design preview page being built, pending founder approval of visual direction
3. **CONTENT REVIEW** (PLZ-005) — 3 Instagram briefs in Notion, pending feedback
4. **PostHog project** — founder must create at app.posthog.com and add env vars

### Blockers
- PLZ-006 (Supabase schema) blocked on PLZ-003 merge
- PLZ-007 (Auth) blocked on PLZ-006

---

## Session — 13–14 April 2026

### Shipped
- SKILL.md Phase 5 → Playwright MCP (localhost:3000 only, 6-step sequence)
- QA memory → Playwright MCP rules documented
- PLZ-051: on main (`24d81f6`)
- PR #38 (PLZ-047/048 N+1 + select): MERGED `ec6ac68` after Youssef fix
- PR #41 (PLZ-052 order timeline): MERGED
- PR #41–44 (PLZ-053/054 tracking 404 + null guard): MERGED `5deae3d` + `48693da`
- PLZ-056 (merchant_pickup_code migration): MERGED `828609d` (PR #46)
- PLZ-055 (full #2563EB → var(--color-primary) sweep, 30 files): MERGED `4abcef0` (PR #47)

### Full regression — 14 April 2026 — ALL PASS
Anas ran 6-phase QA on both PRs + 9-step regression post-merge.
Result: P0=0, P1=0, P2=0. Every route 200. Per-merchant theming live.

### P2 backlog — CLEARED
- 9× #2563EB items: RESOLVED by PLZ-055
- StoreInfoSheet/working_hours (P2-005): was already correct — no fix needed
- p2-backlog.md updated to reflect 0 open items

### Next milestone
Part 3 — Driver App. Product is regression-clean as of 2026-04-14.

---

## Founder decisions — Part 3 Driver App — 14 April 2026

All 10 design decisions confirmed. Antonio brief reviewed and approved.

1. Customer delivery PIN: **4 digits** (matches shipped customer confirmation UI)
2. OTP auth in Part 3: **Yes** — required before go-live
3. New assignment notification: **full-screen overlay + push notification** (overlay primary, push fallback)
4. Mapbox strategy: **external Google Maps link for MVP**, embedded Mapbox static map in Part 4
5. COD cash checkbox: **included** — "Je confirme avoir reçu X MAD en espèces" on DeliveryConfirmation
6. Offline state banner: **included** — amber banner + power-off empty state
7. Driver app color: **Plaza blue #2563EB** as primary, **orange #E8632A** as secondary/accent — driver layout overrides var(--color-primary) to #2563EB locally (decision revised 14 April 2026)
8. Star rating: **removed** — not in data model, not in Part 3 scope
9. Vehicle info + Documents: **FULL ONBOARDING FLOW** (not stubs) — capture vehicle type, permis de conduire, assurance, CINE/CIN during driver registration
10. Auth screens: **in Part 3 scope** — Phone → OTP → PIN (returning) / PIN setup (new)

### Driver onboarding flow (new — decision 9)
New driver registration screens added:
- Step 1: Vehicle type selection (moto, vélo, voiture, autre)
- Step 2: Permis de conduire photo capture (front only)
- Step 3: Assurance vehicle document capture
- Step 4: CINE/CIN national ID capture (front + back)
- Pending validation screen — "En attente de validation"

These screens appear after OTP + PIN setup for new drivers only. Returning drivers go directly to Livraisons after PIN entry.

### Figma Make
Single comprehensive prompt compiled. 18 screens + BottomNav component. Founder runs Figma Make, returns frames for validation, then dev starts.

---

## Founder decision — 14 April 2026

**Anas full merge authority confirmed.**
Anas merges all PRs autonomously after 6-phase QA passes.
Founder never merges PRs. If founder is merging — that is a process failure, flag it.
Updated: .agents/qa/CLAUDE.md + .agents/qa/memory.md
Commit: chore/anas-full-merge-authority → main

**Process change:**
- Remove "WAITING ON FOUNDER: MERGE PR #XX" from daily reports going forward
- Merge status comes from Anas notification to Othmane
- Othmane reports merged items in daily summary only

---

## Session — 15 April 2026

### PLZ-057 — Driver App Part 3 — SHIPPED ✅

**PR #48 merged to main** — squash SHA `9809a30`

**What shipped:**
- Full driver mobile web app (47 new files, 3,214 insertions)
- Auth: Phone → OTP (stub) → PIN setup (new) / PIN login (returning)
- Onboarding: 4-step document capture (vehicle, license, insurance, CINE)
- Active deliveries list with online/offline toggle + NewAssignment overlay (realtime)
- Delivery detail with Google Maps deep-link
- Collection confirmation: 6-digit merchant code (server-validated) + package photo
- Delivery confirmation: 4-digit customer PIN (server-validated) + COD checkbox + proof photo
- Issue report (6 types + optional photo)
- Historique: grouped delivery history + weekly stats
- Profil: driver stats + document status + LogoutButton
- DB migrations: 3 files — driver app schema, RLS policies, gap-fill
- RLS: drivers see own record only; deliveries scoped to driver; orders scoped via deliveries
- Middleware: all /driver protected routes → redirect to /driver/auth/phone when unauthenticated
- E2E test scaffold: tests/e2e/driver-routes.spec.ts

**QA verdict (Anas, 15 April 2026):**
- Phase 1 (tsc + lint): PASS
- Phase 2 (routes): PASS — /driver in SKIP_INTL
- Phase 3 (data consistency): PASS — PIN via Supabase Auth (bcrypt), COD in centimes÷100, server-side code validation
- Phase 4 (UI): PASS — var(--color-primary) override to #2563EB in driver layout, orange #E8632A accent for COD only
- Phase 5 (Playwright): PASS — phone page loads, unauthenticated redirects work
- Phase 6 (flow verification): PASS — all auth/confirm/COD/middleware/RLS checks correct
- P0: 0 | P1: 0 | P2: 1 (OTP stub — intentional, TODO comment present)

**P2 open item — next sprint:**
- P2-001 PLZ-057: OTP verification is a stub — any 6 digits accepted. Needs Twilio/Vonage integration. Not blocking MVP.

### Current state of main (15 April 2026)
All 3 platform layers are on main and regression-clean:
1. Merchant dashboard (Part 1) — orders, finances, support, livraisons
2. Customer storefront v2 (Part 2) — browse, cart, checkout, OTP, confirmation, tracking
3. Driver app (Part 3) — auth, onboarding, deliveries, confirmation, history, profil

**Next milestone:** Part 4 TBD — likely merchant dispatch UI (assign deliveries to drivers) or real OTP integration.

---

## Pre-launch test cycle — 2026-04-20

### Cycle structure (as executed)

1. ✅ Saad baseline → Wave 1 fix (PLZ-062) → Wave 1 retest
2. ✅ Wave 2 fix (PRs #54–57) → Wave 2 retest
3. ✅ Saad final pre-launch test → 6 criticals found (SAAD-028/032/033/034/035 + admin PKCE)
4. ✅ Fix cycle: PLZ-068 (dispatch DB), PLZ-069 (cart/WA/TZ/PKCE), PLZ-070 (driver session)
5. ✅ PLZ-071 through PLZ-074 (Signaler un problème + dispatch pipeline + cart hydration + nav fix) — all merged
6. ✅ Saad definitive 6-point retest — ALL CLEAR (SHA 6a382c2, 2026-04-20)
7. ⏳ Phase 3 — Founder manual test (admin PKCE magic link, end-to-end)
8. ⏳ Phase 4 — Admin panel guide for founder

### Founder decisions — 2026-04-20

- **SAAD-039** — Launch blocker. Fix before retest. PLZ-071 dispatched to Hamza.
- **SAAD-029** — Post-launch backlog. Toggle visual state stuck; underlying state correct; page refresh resolves. Logged in `.agents/qa/p2-backlog.md`.
- **SAAD-034** — Session collision. Warning banner shipped (PLZ-070) is sufficient for MVP. Full session isolation is post-launch architectural item.
- **Admin PKCE verification** — Founder handles manually at Phase 3 (one magic link click). No mail stub needed.
- **Phase 3 + Phase 4** — Run in parallel once Saad signs off.

### Saad 6-point post-fix verification checklist (when dispatched)

1. SAAD-032 — Confirm merchant order → delivery appears in driver pool at `/driver/livraisons`
2. SAAD-033 — Driver PIN login persists session → lands on `/driver/livraisons`
3. SAAD-028 — Cart survives page reload; checkout loads with zero hydration errors (SAAD-035)
4. SAAD-037 — WhatsApp URL is correctly formed (`wa.me/212XXXXXXXXX` not double-prefixed)
5. SAAD-038 — Timestamps show Morocco time, not browser local time
6. SAAD-039 — "Signaler un problème" opens dialog, ticket is created, appears in support hub

---

## Session — 2026-04-23 (post-PLZ-090 sprint)

### Shipped earlier today
- **PLZ-090 multi-image product gallery** — full 3-PR vertical slice merged (PR #89 schema, #90 storefront, #91 merchant). Saad end-to-end regression GREEN across all 4 legs. `lib/product-images.ts` is the shared source of truth; legacy `image_url` kept one release cycle.

### Founder sprint plan received 2026-04-23 (consolidated post-launch findings)
4 sections (A storefront bugs / B driver bugs / C sequencing / D admin panel build-out).

### Sprint 1 (money + trust — THIS WEEK) — DISPATCHED 2026-04-23
- **A1** Hamza — `orders.status.*` i18n sweep (PLZ-1007 showed raw `orders.status.assigned` key; PLZ-058 renamed assigned → accepted). Agent `ae67b3deee3b97322`. Task #63.
- **A2** Pre-fix audit DONE by PM directly via Management API — **one affected order platform-wide: PLZ-1008, Boutique test, 995 MAD subtotal > 500 MAD threshold, charged 30 MAD, status=confirmed**. No broader customer damage. Refund decision surfaced to founder (internal test order). A2 fix (Hamza checkout logic) queued as task #65 pending founder refund sign-off.
- **B2** Mehdi — Driver Settings + Support CTAs wire-up + no-dead-buttons sweep across every driver screen. Agent `a48196cc1ed3ab6d5`. Task #66.

### Parallel — Antonio dispatched 2026-04-23
- Deliverable 1: `docs/ux/back-button-flow.md` (A3 map) — founder reviews before Hamza implements.
- Deliverable 2: `docs/design/admin-panel-inspiration-brief.md` (Section D Phase 1 kickoff) — data-dense ops tooling direction; founder reviews before Phase 2 plan.
- Both ship as one docs PR. Agent `a5f2e5192866c49f3`. Task #67.

### Sprint 2 (driver lifecycle integrity, queued after Sprint 1 merges)
- **B3 + B4** single Hamza PR — pickup confirmation screen (merchant_pickup_code + pickup_photo_url + support CTAs + "Signaler un échec") + delivery failure reporting mirror. Schema confirmed: `deliveries.merchant_pickup_code` exists (text); ALSO `orders.merchant_pickup_code` (integer) — data model inconsistency, validate against `deliveries` per PLZ-058. Task #68.
- **B5** Hamza — delivery success page reads real `distance_km`, `estimated_duration_min` / computed accepted_at→delivered_at duration, `driver_earnings_mad`. All fields confirmed in deliveries schema. Task #69.

### Sprint 3 (UX polish, parallel as capacity allows)
- A3 impl (Hamza) — blocked on Antonio map + founder review. Task #70.
- A4 product page wrap in StorefrontLayout (Mehdi + Antonio). Task #71.
- B1 working hours polish (Mehdi + Antonio Switch review). Task #72.

### Post Sprint 1 + 2 merge
- Saad adversarial retest focused on: (a) checkout threshold logic, (b) full driver lifecycle end-to-end including failure scenarios. "R1/R2/R3/R4 rules" cited by founder — lookup required in QA docs before Saad dispatch.

### Section D — admin panel build-out
- Phase 1 discovery starts concurrent with Sprint 1 (Antonio brief above + task #73 PM admin ops inventory).
- Phases 2/3/4/5/6 gated: no Phase 4 dev dispatch until founder approves Phase 2 plan.

### Schema findings from today's A2 audit (worth persisting)
- All monetary integers on orders/merchants are **centimes** (not MAD). Confirmed: orders.subtotal=99500 = 995 MAD, delivery_free_threshold=50000 = 500 MAD.
- `orders.delivery_fee`, `orders.subtotal`, `orders.total`, `orders.plaza_commission` — all centimes.
- `merchants.delivery_free_threshold` — centimes.
- `merchants` has `store_name` (not `name`).
- Live order status values in use — enumerated by Hamza as part of A1 sweep.

### Process learnings this session
- **Anas local gates ≠ CI**: Anas's PR #91 QA passed locally while GitHub Actions `Type check & Lint` was red on an unused-var lint error. Local worktree lint has a `@next/next` plugin conflict that masks real lint errors in worktrees. Always verify GitHub check-runs on tip SHA before declaring mergeable. PM fixed the lint error directly in commit `ffcd0ab` (one-line unused destructure) to keep the sprint moving.
- **Money-bug pre-fix audit speed**: Running the read-only audit query directly via Management API (PM role, no agent spawn) gave founder the overcharge list in ~3 minutes vs ~10 minutes for a Youssef dispatch. For urgent read-only audits, PM should run directly and flag the decision to founder faster. Attribution still goes to the fix owner.

---

## Session — 2026-04-24 (Sprint 1 close + A2 dispatch)

### Founder decisions on 4 open gates (all clean)
1. **PLZ-1008 refund** — NO refund. Founder's own test account. Just ship the fix.
2. **PR #92 docs** — Approve in principle, merge now. Founder will read `back-button-flow.md` directly and may issue overrides before Hamza is dispatched on A3. Admin UI brief moves forward without further founder input (Antonio's judgment trusted).
3. **PR #93 E2E red** — Pre-existing flake, override authorized. Filed separate tech-debt ticket.
4. **Arabic empty string** — Accept as-is. Spec said AR deferred; empty prevents IntlError. Full AR pass done in one sweep later, never piecemeal.

### Sprint 1 close
- **PR #92 (Antonio docs)** — merged, sha `35cbed0`. PM comment posted on thread flagging A3 gate to Antonio.
- **PR #93 (A1 i18n)** — merged with documented E2E flake override, sha `cd65f57`.
- **PR #94 (B2 driver CTAs)** — merged with same flake-override pattern (no storefront code touched, override scoped to driver routes), sha `8369f80`. Mehdi followups #76/#77/#78 logged for Sprint 3.
- **Issue #95 PLZ-E2E-FLAKE** — filed at https://github.com/MohamedBenmansour26/plaza-platform/issues/95. P1 tech-debt. Anas/Youssef to investigate suite stability (not per-PR fixes).

### CI-gate rule added to QA CLAUDE.md
Permanent protocol update: Phase 1 now mandates checking GitHub Actions CI on the PR's tip SHA. Local `tsc`+`lint` does NOT substitute. Red CI requires:
  (a) block merge if caused by this PR,
  (b) file separate flake ticket if unrelated and proceed only with documented PM/founder override,
  (c) escalate to PM if unclear.
Merging against red CI without documented override = process failure. Closes the gap that bit PR #91 during PLZ-090 sprint.

### A2 dispatched
- Hamza A2 (free-delivery threshold checkout fix) running as agent `a2d695d8c1652de22`. Brief includes centimes-unit constraints from A2 audit, requires unit tests on threshold edge cases, branch `fix/plz-a2-free-delivery-threshold`.
- Saad's "R1/R2/R3/R4 rules" still pending lookup in QA docs before post-Sprint-2 retest dispatch.

### Sprint 2 gating
After A2 merges (final Sprint 1 PR), dispatch Sprint 2: B3 pickup confirmation + B4 delivery failure reporting + B5 success page real data. All queued in tasks #5/#68/#69.

### Process learning — github MCP vs curl
Enterprise policy blocks grepping `.env.local` in this session's permission set. All PR/CI operations in this session ran through `mcp__github__*` tools successfully (get_pull_request_status, merge_pull_request, create_issue, add_issue_comment). `gh` CLI still not installed. One limitation: github MCP has no check-runs endpoint — combined status API returns Vercel statuses but not GitHub Actions. When Actions check-run detail is needed, must escalate to founder for alternate access path. Updated user-level feedback memory accordingly.
