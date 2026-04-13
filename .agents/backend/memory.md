# Youssef memory log
_Updated after every session._

---

## Current state

Status: Just onboarded — 13 April 2026.
First task: audit the entire data layer for issues.

---

## Schema audit checklist (first session)

Read all files in `lib/db/` and `app/_actions/`
Check for:
- N+1 query patterns
- Missing error handling
- `select('*')` that should be specific columns
- Missing indexes on frequently queried columns
- RLS policies that are too permissive or too restrictive
- Server actions that don't validate input

Post findings to Notion: "Backend Audit — [date]"

---

## Migration log

| Date | Migration | Applied | Rollback |
|---|---|---|---|
| 2026-04-08 | OTP auth columns + delivery_zones | ✅ Production | DROP COLUMN pin_hash, recovery_email, otp_attempts, locked_until |
| 2026-04-10 | Store location columns | ✅ Production | DROP COLUMN location_lat, location_lng, location_description |
| 2026-04-13 | working_hours jsonb | ✅ Production | DROP COLUMN working_hours |
| 2026-04-13 | terminal_enabled, phone_verified, cmi_enabled | ✅ Production | DROP COLUMN terminal_enabled, phone_verified, cmi_enabled |
| 2026-04-13 | decrement_stock() function | ✅ Production | DROP FUNCTION decrement_stock(uuid) |
