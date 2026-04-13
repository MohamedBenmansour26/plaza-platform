# Plaza Platform — conventions.md All agents must read and follow these conventions. They are non-negotiable.
When in doubt, ask the PM agent before deviating.

---

## Language rules

| Context | Language |
|---|---|
| Code (variables, functions, files, comments) | English |
| Notion tasks and internal docs | English |
| User-facing UI copy (labels, buttons, messages) | French + Arabic (both, always) |
| Error messages shown to merchants | French + Arabic |
| Git commit messages and PR descriptions | English |

Never mix languages within the same context. A component named TableauDeBord.tsx or a comment in French is a convention violation.

---

## Git — branching strategy

We use trunk-based development: all work happens on short-lived feature branches that merge directly into main. There is no long-lived dev branch.

### Branch naming

feat/<ticket-id>-short-description     → new feature
fix/<ticket-id>-short-description      → bug fix
chore/<ticket-id>-short-description    → tooling, deps, config
docs/<ticket-id>-short-description     → documentation only

Examples:
feat/PLZ-12-merchant-onboarding
fix/PLZ-34-stripe-webhook-error
chore/PLZ-41-update-supabase-client

### Rules
- Branch off main, merge back into main only
- Branches must be short-lived — ideally merged within 2 days
- Never commit directly to main — always via PR
- Never force-push to main
- Delete the branch after the PR is merged
- One feature or fix per branch — no bundling unrelated changes

### Branch protection on main
- Requires QA agent sign-off before merge
- Requires founder approval before merge (see approval-protocol.md)
- CI must pass (type check + lint)

---

## Git workflow — mandatory (no exceptions)

**NEVER push directly to main.**

Every change — no matter how small — must go through:

1. Create branch: `git checkout -b feat/PLZ-XXX-description`
2. Make changes + run `/simplify` on all changed files
3. Open PR on GitHub
4. Anas reviews with plaza-qa skill
5. Anas merges — never the dev themselves

### The ONLY exceptions allowed for direct main push
- P0 hotfix that breaks the app during founder testing
- Single-line config fix (e.g. middleware SKIP_INTL entry)
- In both cases: notify Othmane immediately after the push

### Violations
If a dev pushes directly to main without a hotfix reason, Othmane flags it in the daily Notion report.

### Why this rule exists
- Direct pushes caused regressions this sprint
- Anas caught bugs that devs missed
- The PR flow is the only quality gate we have

---

## Git — commit messages

We use Conventional Commits format:

<type>(<scope>): <short description in imperative mood>

[optional body — what and why, not how]

### Types
| Type | When to use |
|---|---|
| feat | New feature or user-facing change |
| fix | Bug fix |
| chore | Tooling, dependencies, config — no production code change |
| docs | Documentation only |
| test | Adding or updating tests |
| refactor | Code change that neither fixes a bug nor adds a feature |
| style | Formatting, whitespace — no logic change |

### Scope (optional but encouraged)
Use the product area: auth, store, orders, payments, delivery, dashboard, ui

### Examples
feat(store): add product image upload with preview
fix(payments): handle Stripe webhook signature mismatch
chore(deps): upgrade supabase-js to v2.39
test(orders): add E2E test for order creation flow
refactor(dashboard): extract revenue chart into separate component

### Rules
- Description in lowercase, imperative mood ("add", not "added" or "adds")
- No period at the end
- Keep under 72 characters
- If the commit closes a Notion task, add at the bottom: Closes PLZ-42

---

## Code — general rules

### TypeScript
- Strict mode is enabled ("strict": true in tsconfig)
- No any types — use unknown and narrow, or define a proper type
- All function parameters and return types must be explicitly typed
- Unused variables and imports are warnings (not blocking) — clean them up before PR
- Prefer type over interface for object shapes unless extending is needed

### React and Next.js
- Functional components only — no class components
- Named exports only — no default exports from component files
- One component per file
- Keep components under 150 lines — extract if larger
- Server components by default; add "use client" only when needed (event handlers, hooks, browser APIs)
- Use Next.js App Router conventions (page.tsx, layout.tsx, loading.tsx, error.tsx)
- Every page must have a loading.tsx and error.tsx sibling

### Styling
- Tailwind utility classes only — no inline style={{}} attributes
- No hardcoded color hex values anywhere in code — use design tokens
- Use shadcn/ui primitives as the base for all UI components before building custom
- RTL support required from day 1 — use dir="rtl" on Arabic content, use start/end Tailwind variants instead of left/right

### API routes (Next.js Route Handlers)
- Located at app/api/<resource>/route.ts
- Every route must handle errors explicitly — no unhandled promise rejections
- Return consistent response shape: { data, error } or { success, message }
- Validate all inputs before processing (use zod for schema validation)
- Never expose internal error messages to the client — log server-side, return generic message

### Database (Supabase)
- Use the Supabase client only — no raw SQL in components or API routes
- Use server-side client (createServerClient) in Route Handlers and Server Components
- Use client-side client (createBrowserClient) only in Client Components
- All DB queries must handle errors explicitly
- Row Level Security (RLS) must be enabled on every table — never bypass it
- Generate types from Supabase schema after every migration: supabase gen types typescript
- Migrations live in supabase/migrations/ — never edit the DB schema manually in the dashboard

### Internationalisation (i18n)
- All user-facing strings must use the i18n system — never hardcode French or Arabic text in components
- Translation files: messages/fr.json and messages/ar.json
- Use next-intl for translations
- Every string added in French must have an Arabic equivalent before the PR is opened

---

## File and folder naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | MerchantDashboard.tsx |
| Hooks | camelCase, use prefix | useOrders.ts |
| Utilities | camelCase | formatCurrency.ts |
| Constants | SCREAMING_SNAKE_CASE | MAX_DELIVERY_DISTANCE |
| API routes | lowercase, kebab-case folder | app/api/delivery-orders/route.ts |
| Types/interfaces | PascalCase, in types/ | types/Order.ts |
| Supabase migrations | timestamp prefix (auto) | 20240401_create_orders.sql |

---

## Design tokens

- All colors, spacing, border radii, font sizes, and shadows are defined in Figma
- The Designer agent exports tokens to styles/tokens.css and tailwind.config.ts
- Dev agent must never hardcode a value that has a token equivalent
- When in doubt, ask the Designer agent for the correct token name
- Token naming convention: --plaza-color-<role>-<variant> (e.g. --plaza-color-primary-500)

---

## Testing

- E2E tests: Playwright, in tests/e2e/
- Unit tests: Vitest, colocated with the file being tested (Button.test.tsx next to Button.tsx)
- Every new feature must have at least one E2E test covering the happy path
- Every bug fix must have a test that would have caught it
- Tests must pass locally before opening a PR — do not open a PR with failing tests

---

## What to do when conventions conflict with speed

At MVP stage, if following a convention would block shipping for more than a day, flag it to the PM agent. The PM agent escalates to the founder for a judgment call. Never silently skip a convention — always flag it explicitly.
