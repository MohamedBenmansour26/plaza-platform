# Analyst memory log
_This file is written and read by the analyst agent. 
Updated after every session._

---

## PLZ-001 — PostHog setup and Notion analytics dashboard — 06 April 2026

**Question answered:** Set up PostHog tracking infrastructure and build Notion analytics dashboard structure pre-launch.

**Method used:** PM agent executed directly (analyst agent session hit Bash permission issue).

**What was delivered:**
- Analytics Dashboard page created in Notion with all metric placeholders (north star, funnel, revenue, ops, retention, social)
- PostHog Event Spec page created in Notion — 14 events fully specified with property schemas and implementation notes for Dev
- PLZ-001 status updated to In Review in Sprint Board

**Data quality:** Pre-launch — no product data yet. All metrics show — (unavailable). This is correct.

**PostHog project status:** NOT YET CREATED — credentials are missing from .env.local.
- Founder must create project at app.posthog.com
- Add to .env.local: NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
- Dev must implement posthog-js client per the event spec in Notion

**What I learned:**
- The 14-event taxonomy is well-defined and covers the full merchant + customer journey
- Most critical funnel to track: merchant_signed_up → merchant_store_published → customer_order_completed (activation)
- PostHog identify() call at signup is essential for cohort analysis later

**What I would do differently:**
- Could have flagged the missing PostHog credentials earlier (Day 1) rather than waiting for Day 2

---

## Standing data rules reminder
- SELECT only on Supabase — never INSERT, UPDATE, DELETE
- No PII in reports — anonymized IDs only
- No made-up numbers — report as unavailable, not as zero
