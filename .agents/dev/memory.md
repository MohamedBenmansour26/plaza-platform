# Dev memory log
_This file is written and read by the dev agent. 
Updated after every session._

---

## PLZ-003 — Next.js project scaffold — 06 April 2026

**What I built:** Next.js 14.2.29 App Router scaffold with Supabase SSR clients, Tailwind CSS + shadcn/ui token system, next-intl v3 (FR + AR, RTL via middleware), Playwright E2E config, GitHub Actions CI workflow.

**Decisions made:**
- Used `next.config.mjs` (not `.ts`) — Next.js 14 does not support TypeScript config files
- Added `export const dynamic = 'force-dynamic'` to root layout — next-intl's `getLocale()` calls `headers()` internally which forces dynamic rendering; correct for an auth-gated app
- Used `requestLocale` (not deprecated `locale`) in `i18n/request.ts`
- Kept `postcss.config.mjs` for ES module compatibility
- `lib/supabase/server.ts` needs explicit `CookieOptions` type import from `@supabase/ssr` to satisfy strict TypeScript

**Shortcuts taken:**
- SWC binary (`@next/swc-win32-x64-msvc`) had to be installed manually via `curl` — npm registry download was blocked by ECONNRESET on this machine. The binary was extracted from `/tmp/swc-win32.tgz` and copied to `node_modules/@next/swc-win32-x64-msvc/`. This is not reproducible without the manual step. TODO: add to `optionalDependencies` and document in README.
- CI workflow pushed without being tracked in git — GitHub PAT lacks `workflow` scope. File is at `.github/workflows/ci.yml` locally. Founder must regenerate token with `workflow` scope.

**Friction encountered:**
- `create-next-app` could not be run in-place due to existing `.agents/` and `.env.local` files — had to scaffold manually
- SWC binary download blocked by network ECONNRESET (npm registry connection reset on this machine)
- Initial `i18n/request.ts` used deprecated `locale` parameter — updated to `requestLocale`
- `.babelrc` fallback I added blocked SWC once binary was installed — had to remove it

**What I would do differently:**
- Add `@next/swc-win32-x64-msvc` to `optionalDependencies` in package.json so it installs automatically when available
- Use `create-next-app` in a fresh temp directory and merge files, rather than building manually
- Check next-intl version compatibility with Next.js 14 before starting (the `requestLocale` API change was in next-intl 3.22)

**PR:** https://github.com/MohamedBenmansour26/plaza-platform/pull/1

---

## Feedback received

_None yet — awaiting QA review of PLZ-003._
