# Admin Panel — Ops Inventory (seed)

This document seeds the operational-monitoring inventory for the admin panel. It captures the dashboards, alerts, and oversight surfaces that the Plaza ops team needs to run the platform day-to-day. It is the working starting point for **Phase 1 admin-panel ops inventory** (Antonio + PM).

Each entry is a candidate observability surface, not a committed deliverable. PM and Antonio prioritise during Phase 1 planning; some will land as cards on the existing admin home, others as dedicated views, others as scheduled alerts.

---

## How to use this document

- **Add an entry** when an incident, audit, or operational gap reveals that ops has no visibility into a category of data. Capture the original triggering event so future PMs can judge the entry's load-bearing weight.
- **Promote an entry** to a build ticket once it's been included in a Phase 1 sprint — link the ticket here.
- **Retire an entry** if the underlying gap has been closed by a different surface (e.g. a Supabase scheduled function alert replaces a manual admin view).

Entries are grouped by data category, not by priority. Priority is assigned during Phase 1 planning.

---

## 1. Stuck deliveries — non-terminal states with no recent state transition

**Status:** seed entry — Phase 1 candidate, not yet ticketed
**Triggering event:** 2026-04-27 — fixture `TEST-DRIVER-001` (`deliveries.id = d1342df2-3365-4e53-80d4-1d8b60dcc6da`) sat in `accepted` status for 12 days with no operator alert. Discovered only because the B3 dispatch (PR #101) audit surfaced it as a NULL `merchant_pickup_code` row blocking the new runtime path.

### What's missing

Ops has no view that answers "which deliveries are non-terminal but haven't moved in N minutes?" There's no dashboard, no alert, no scheduled email. The only way to find a stuck delivery today is a manual SQL query against the Management API.

### Proposed surface

- **Admin panel view:** "Stuck deliveries" — table of rows where `status NOT IN ('delivered','failed','cancelled')` AND `updated_at < NOW() - INTERVAL '30 minutes'`.
- **Columns:** delivery id, status, time-since-last-transition, driver name (if assigned), merchant name, customer phone, "open in admin" link.
- **Actions:** force-cancel (with reason note), reassign to driver, contact driver/customer.
- **Default sort:** longest-stuck first.

### Threshold suggestions (to validate during Phase 1)

| State | Stuck threshold | Reasoning |
|---|---|---|
| `pending` (no driver assigned) | 5 min | Dispatch should match within seconds; 5 min = real backlog |
| `assigned` (offered to driver) | 2 min | Driver has 60s to accept; 2 min = stuck offer |
| `accepted` (driver en route to merchant) | 30 min | Most pickups complete within 20 min; 30 min = wandering driver or real-world block |
| `picked_up` (en route to customer) | 45 min | Generous to cover Casa traffic; tighten after we have data |
| `at_customer` (arrived, no confirmation) | 10 min | Driver should confirm or fail within minutes |

### Alerting

In addition to the visual dashboard, push a Slack alert to ops when ANY delivery crosses its state-specific threshold. Alert content includes the delivery ID, the time-stuck, the assigned driver's last-known location, and a deep link to the admin row.

### Open questions for Phase 1 planning

- Do we want per-merchant thresholds (high-value merchants alert sooner)?
- Do we auto-cancel after some hard upper bound (e.g. 4h `accepted` with no movement) or always wait for human review?
- Where do test fixtures sit in this view? Should a `is_test_fixture` column hide them from the alert path while keeping them visible in the dashboard?

---

## (Add new entries below as gaps surface during ops review)

---

## Cross-references

- `.agents/pm/memory.md` — Sprint 2 closure (2026-04-27/28) for the original triggering audit
- Issue #102 — `merchant_pickup_code` legacy NULL rows (related data-hygiene work)
- `.agents/admin/CLAUDE.md` — admin agent operating notes (when created)
- Antonio's `back-button-flow.md` — admin UI map (Phase 1 reference)
