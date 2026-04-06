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
