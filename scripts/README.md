# scripts/

Dev/QA seed + admin scripts. All read `.env.local` and require
`SUPABASE_SERVICE_ROLE_KEY`. All scripts that mutate data refuse to run
when `NODE_ENV=production`.

## QA seed scripts (PLZ-091)

Run these in a fresh agent worktree so authed QA probes can log in.

- `npm run seed:admin` — creates/updates the admin `auth.users` row and
  upserts the `admin_users` row. Default password `PlazaDev!2026`
  (override via `ADMIN_SEED_PASSWORD=...`). Run when an agent can't log
  into `/admin/login`.
- `npm run seed:test-merchant-pin` — resets the test merchant
  `+212666666666` PIN to `1234` (PIN is the Supabase auth password on
  the synthetic `212666666666@plaza-merchant.internal` email). Run when
  an agent can't log into the merchant dashboard.

Both scripts are idempotent — safe to re-run.

## Other scripts

- `activate-admin.js` — founder-admin magic-link activation (PLZ-060).
- `admin-set-password.js` — sets a password on an existing admin row.
  Errors with a pointer to `seed:admin` if the auth.users row is missing.
