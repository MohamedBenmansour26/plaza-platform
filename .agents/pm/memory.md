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

---

## Session close — 2026-04-24 (evening) — TAG: infra-unstable session

> **Session tag for next-day PM:** This session is marked **infra-unstable**. 4 subagent stalls across 4 dispatches in ~8h (Hamza A2 sandbox-blocked → PM-direct; Hamza B3+B4 stream idle timeout; Hamza B5 600s watchdog; Youssef ConnectionRefused proxy retry loop). Default to **sequential dispatch + narrow scope + PM-direct fallback** per `feedback_cluster_stall_sequential_dispatch.md` until a session restart confirms infra has stabilized. Do not resume parallel dispatch on the next session without a quick stability probe (single small dispatch first, observe outcome).

### Sprint 1 fully closed
- PR #92 (Antonio docs): MERGED — `35cbed0`
- PR #93 (A1 i18n) MERGED with E2E flake override — `cd65f57`
- PR #94 (B2 driver CTAs) MERGED with same flake override — `8369f80`
- **PR #96 (A2 money-bug fix) MERGED with founder override** — `f531550`. Override comment posted: 11 unit tests cover PLZ-1008 repro + edges, Phase 5 deferred to founder manual spot-check (within 24h) due to known Mapbox/Playwright watchdog issue. Static gates + CI green on tip SHA `0286eb8`.
- PR #97 (QA CI-gate rule + PM session log): MERGED — `b4484f6`. CI-gate now permanent on `.agents/qa/CLAUDE.md` Phase 1.
- PR #98 (Saad CLAUDE.md with R1–R4 rules): MERGED — `58a54ba`. Saad persona codified.

### Issue #99 filed — Anas watchdog infrastructure fix
P1 tech-debt, labelled `infrastructure`/`qa`/`tech-debt`. Tracks the recurring 600s watchdog stalls on Mapbox/Playwright flows. Owner: Youssef-adjacent. Acceptance: Anas subagent runs full Phase 5 on checkout-with-map and driver-app flows without watchdog trip. Until fixed, the watchdog escalation rule (in `feedback_watchdog_escalation_in_briefs.md` user memory) is embedded in every dispatch brief.

### Sprint 2 — partial close (B5 landed PM-direct, B3 dispatched, B4 queued)
First parallel dispatch attempt failed entirely (3-of-3 stalls):
- **Hamza B3+B4** (`worktree-agent-abebfae7`) — Stream idle timeout / partial response after 50 tool calls. Worktree had only `lib/db/driver.ts` modified, no commits. **Re-dispatched as B3 alone** with narrow-scope rules (40-call hard cap, 30-call early-stop trigger, no retries).
- **Hamza B5** (`worktree-agent-a6fbb70d`) — 600s watchdog stall on `tsc --noEmit`. Worktree empty. **Landed via PM-direct as PR #100** (merged `1695cc4`) with founder override; manual spot-check within 24h.
- **Youssef schema consult** (`adf9a6b1...`) — ConnectionRefused + retry loop. **Parked** until B3 + B4 land (founder directive). Fallback options if next attempt also stalls: PM runs schema analysis directly via Supabase Management API, or backlog ticket parked until post-admin-panel sprint.

After B5 landed, switched to **narrow-scope sequential dispatch**: Hamza B3 alone (`feat/driver-pickup-confirmation-b3`) running with 40-call cap, single-feature scope (pickup screen + code verify + photo upload + support CTAs + failure-CTA stub only). B4 queued — do not dispatch until B3 lands.

### Resilience rules added today (now permanent protocol)
1. **Stream watchdog** (Mapbox/Playwright compile, silent `browser_wait_for`) → falls under issue #99; agent briefs include the option-(a) escalation rule; founder accepts deferred Phase 5 trade-off.
2. **ConnectionRefused + retry loop** (proxy / API connectivity from agent sandbox) → DO NOT auto-retry. Parking the task is safer than burning 10 retries that all fail the same way.
3. **Cluster-stall sequential rule** (>1 agent failure in <2h) → switch to sequential + narrow scope + PM-direct fallback. Resume parallel only after session restart confirms stability. See `feedback_cluster_stall_sequential_dispatch.md`.
4. **PM-direct landing** is acceptable attribution when an agent is sandbox-blocked or stalls on last-mile mechanics. Same precedent as A2 fix `f531550` and B5 fix `1695cc4`.

### What's next (founder-owned + PM-owned items)
- Founder manual spot-check PR #96 + PR #100 on localhost (24h, founder-owned).
- B3 PR landing (Hamza dispatched, awaiting completion or stall).
- B4 dispatch (queued after B3 lands).
- Youssef schema consult re-dispatch (after B3 + B4 land, per founder).
- Item 3 (`back-button-flow.md` review → A3 gate) is founder-owned, separate.

### Today's process learnings logged to user memory
- `feedback_bundle_docs_with_code.md` — bundle session-learning docs with the related code PR, not separate chore PRs.
- `feedback_watchdog_escalation_in_briefs.md` — embed the stop-and-switch-to-option-a rule in every Mapbox/driver dispatch brief.
- `feedback_cluster_stall_sequential_dispatch.md` — on cluster-stall days, sequential + narrow + PM-direct.
- `feedback_anas_merge.md` — rewritten: GitHub MCP tools for all PR/CI ops; no `.env.local` grep; `gh` CLI not installed; check-runs gap documented.

---

## Sprint 2 closure — 2026-04-27/28 — TAG: infra-unstable session (still applies)

> **Session tag for next-day PM:** Infra-unstable session continues to apply. 5 subagent stalls across 5 dispatches in ~10h wall-clock (Hamza A2 sandbox-blocked; Hamza B3+B4 stream idle; Hamza B5 600s watchdog; Hamza B3-narrow commit-blocked; Hamza B4-narrow commit-blocked; Youssef ConnectionRefused). PM-direct landed 4 of 5 PRs from this session's code work. Default tomorrow's first dispatch to a small stability probe (e.g. Saad post-Sprint-2 retest at narrow scope) before resuming any parallel work.

### Sprint 2 — fully closed, driver lifecycle end-to-end shippable
- **PR #100 (B5 — success page real data)** MERGED with founder override — `1695cc4`. PM-direct land after Hamza B5 watchdog stall. `lib/db/driver.ts` `getDeliverySummary` + driver-ownership enforcement; computed duration prefers `delivered_at - accepted_at` with `estimated_duration_min` fallback; `'—'` placeholder for missing values.
- **PR #101 (B3 — pickup confirmation + collection page)** MERGED with founder override — `add37876`. Hamza dispatched narrow-scope (40-call cap, 30-call early-stop), code complete, commit blocked at sandbox layer → PM-direct commit + push + PR. `confirmCollectionAction` validates against `delivery.merchant_pickup_code` (text on deliveries row, authoritative per PLZ-058) — no longer reads `delivery.order.merchant_pickup_code` (integer). 16 new i18n keys under `driver.collect.*`. Support CTA + failure-CTA stub wired to `/driver/livraisons/[id]/issue`.
- **PR #103 (B4 — delivery failure form i18n + validation)** MERGED with founder override — `9c8fcc4`. Same Hamza narrow-scope-then-commit-blocker pattern as B3. `/driver/livraisons/[id]/issue` route already existed from PLZ-057 — Hamza filled the gaps: `driver.issue.*` namespace (35 keys × 2 locales), 6-value enum whitelist (`client_absent | client_refuse | wrong_address | damaged | payment_issue | other`), 500-char cap, "other requires notes" guard, ARIA `radiogroup` wiring.

### Founder-ratified naming + enum precedents (now in conventions.md)
- **`issue_*` columns kept** (not renamed to `failure_*` per brief). Rule locked: "When an existing schema convention exists, agents follow it; only PM can authorize a rename, and renames need a real reason beyond word choice." Added to `.agents/shared/conventions.md` as new "Schema naming — never rename live columns to match brief wording" section. Origin event referenced: PR #103.
- **6-value `issue_type` enum kept** (includes `payment_issue`, brief had only 5). The brief was incomplete, not the schema; preserving the live enum constraint was correct.

### Legacy data finding — backfill applied + Sprint 3 ticket filed
- Audit found 5 `deliveries.merchant_pickup_code IS NULL` rows: 1 in-flight (`accepted`, test fixture `TEST-DRIVER-001` / `d1342df2-3365-4e53-80d4-1d8b60dcc6da`) + 2 `delivered` + 2 `failed`.
- In-flight row backfilled in-place to `'123456'` via Management API UPDATE before dispatching B4. Verified post-update: zero in-flight NULLs.
- 4 terminal NULL rows tracked in **issue #102** (P3 / data-hygiene / tech-debt). Plan: bundle backfill migration with Youssef's deferred schema consult (`orders.merchant_pickup_code` int vs `deliveries.merchant_pickup_code` text — the deeper inconsistency).
- This stuck row also seeded an admin-panel ops gap: `TEST-DRIVER-001` sat in `accepted` for 12 days with no operator alert. Logged to `docs/admin/ops-inventory-seed.md` as the first entry — "Stuck deliveries — non-terminal states with no recent state transition" — with proposed view, per-state stuck thresholds, and Slack alert plan. Antonio + PM build on this during Phase 1 admin-panel ops inventory.

### Issue #99 still open (Anas watchdog infrastructure)
P1 tech-debt remains the gating reason for accepting deferred Phase 5 on every Mapbox/driver-flow PR this session. Until #99 is resolved, the watchdog escalation rule in `feedback_watchdog_escalation_in_briefs.md` continues to be embedded in every dispatch brief.

### What's parked for tomorrow's clean session (founder directive — DO NOT dispatch tonight)
- **Saad post-Sprint-2 retest** — first dispatch tomorrow as the stability probe. If clean → re-enable parallel dispatch.
- **Youssef schema consult** — second dispatch tomorrow. Schema unification is research-only and benefits from a stable agent run; today's infra hostility makes it likely to ConnectionRefused again.
- **A3 implementation (back-button flow)** — gated on founder reading `back-button-flow.md` and replying with the gate decision.
- **Admin panel Phase 1 ops inventory in earnest** — PM + Antonio. Seeded today (`docs/admin/ops-inventory-seed.md`); promotion to Phase 1 sprint tickets happens during planning.
- **Sprint 3 polish** as capacity allows.

### Founder-owned items tonight (post-merge spot-checks)
- PR #96 (A2 money-bug fix) on localhost
- PR #100 (B5) + #101 (B3) + #103 (B4) end-to-end as one driver lifecycle pass on localhost
- Read `back-button-flow.md` → A3 gate decision

### Resilience protocol now permanent in user memory
1. **Stream watchdog** (Mapbox/Playwright compile, silent `browser_wait_for`) → option-(a) escalation embedded in every dispatch brief; founder accepts deferred Phase 5 trade-off.
2. **ConnectionRefused + retry loop** → DO NOT auto-retry; park the task.
3. **Cluster-stall sequential rule** (>1 agent failure in <2h) → sequential + narrow + PM-direct fallback. Resume parallel only after a stability probe on the next session.
4. **PM-direct landing** is acceptable attribution when an agent is sandbox-blocked or stalls on last-mile mechanics. Precedent: A2 `f531550`, B5 `1695cc4`, B3 `add37876`, B4 `9c8fcc4`.

### Stopping point
Sprint 2 fully closed. Awaiting founder spot-checks + A3 gate decision. Tomorrow's session opens with Saad retest as the stability probe.

---

## Session — 2026-04-28 (start) — TAG REMOVED: infra recovered

### Stability probe — CLEAN
Saad-persona probe (`a750abc17d75e0211`) ran in ~30s with 4/10 tool calls. No stalls, no retries triggered, watchdog did not trip, ToolSearch loaded Playwright schemas cleanly. Persona file loaded fine. Local dev server was not running so the navigate returned `ERR_CONNECTION_REFUSED` and landed on Chrome's error page — that is a valid probe outcome since the probe tested *infrastructure*, not app uptime.

### Operating defaults today
- **Infra-unstable tag REMOVED** — yesterday's session-close tag no longer applies.
- **Parallel dispatch re-enabled** as default.
- **Fail-fast hand-back rule** kept regardless (good hygiene). 30-call early-stop / 40-call hard cap continues to be embedded in dispatch briefs.
- **No retries on stream watchdog or ConnectionRefused** still applies (issue #99 not yet resolved; the resilience rules in user memory remain permanent).

### Network blip during PM working time
Founder noted network was briefly down during this session's start; came back online before any subagent work was in flight. No impact on the probe (already returned). Logged as a single point-in-time observation, not a pattern.
