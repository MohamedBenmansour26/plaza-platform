# Plaza Platform — approval-protocol.md

This file defines what every agent can do autonomously, what requires founder approval, and how the PM agent communicates with the founder daily. All agents must read and respect this protocol without exception.

---

## The golden rule

When in doubt, stop and ask. It is always better to pause and flag something than to proceed and cause an irreversible action. The PM agent is the first escalation point — never go directly to production, external parties, or spending without a clear approval on record.

---

## Approval tiers

### Tier 1 — Always requires founder approval (full stop)

Agents must stop work, notify the PM agent, and wait for explicit written approval before proceeding.

| Action | Why |
|---|---|
| Deploy to Vercel production | Affects live merchants and real users |
| Any DB schema change (new table, migration, column change) | Risk of data loss or breaking changes |
| Any spend above 0 euros (tools, ads, APIs, subscriptions) | Zero autonomous spend at this stage |
| Merging any PR into main | Code that reaches main can be deployed |
| Publishing any public content (blog, landing page, social post) | Brand and legal exposure |
| Sending any new outreach message not in the pre-approved template library | Reputation risk |
| Replying to any inbound message (lead, user, partner) outside a pre-approved template | Same |
| Adding or revoking any third-party integration or API key | Security and cost exposure |
| Any pricing or packaging decision | Business model impact |
| Contacting any real person for the first time | Legal and brand risk |

---

### Tier 2 — Notify founder, but can proceed

Agents should post a note to Notion and tag the founder, but do not need to wait for a response before continuing.

| Action | Note to include |
|---|---|
| Opening a PR | PR link + summary of what changed |
| Deploying a Vercel preview | Preview URL + what to test |
| Creating a new branch | Branch name + associated Notion task |
| Writing tests | Test file and what scenario is covered |
| Drafting any copy or content | Mark clearly as DRAFT — NOT PUBLISHED |
| Using a pre-approved outreach template | Log contact name, date, template used |
| Using a pre-approved reply template | Log channel, contact, template used |
| Updating internal documentation | Doc name and what changed |
| Generating Figma mockups or design drafts | Figma link + task reference |

---

### Tier 3 — Fully autonomous (no notification needed)

| Action |
|---|
| Reading any file, repo, or database (read-only) |
| Writing or running unit and E2E tests locally |
| Refactoring code within an existing approved branch |
| Updating Notion task statuses |
| Generating SQL SELECT queries (read-only, no writes) |
| Researching competitors, market, or technical topics |
| Creating design mockups for internal review |
| Writing first drafts of any content (not publishing) |

---

## Communications protocol

### Outbound outreach (Growth agent)

The Growth agent may send outreach messages only using templates from the pre-approved template library stored in Notion under Growth / Approved Templates.

Rules:
- Log every outreach sent: contact name, channel, date, template ID used
- Never modify a template — use it verbatim or escalate for a new approved version
- Never contact the same person twice within 7 days without founder approval
- If a prospect replies, do not respond autonomously — escalate to Tier 1

To add a new template to the library: Growth agent drafts it → PM flags to founder → founder approves and adds to Notion library.

### Inbound replies (Growth agent)

The Growth agent may reply to inbound messages (WhatsApp, Instagram, email, social comments) only if a matching pre-approved template exists.

Rules:
- Match the reply template to the message type (inquiry, complaint, pricing question, delivery issue, etc.)
- If no matching template exists → Tier 1 escalation, do not reply
- If the message is partially covered by a template but requires customisation → Tier 1 escalation
- Log every reply: channel, contact, date, template ID used

### Social media comments (Growth agent)

The Growth agent may reply to standard social media comments using pre-approved templates.

Rules:
- Generic positive comments → use standard acknowledgement template autonomously
- Questions about pricing, delivery, or features → use FAQ template if available, otherwise Tier 1
- Complaints or negative comments → always Tier 1, never reply autonomously
- Never delete or hide a comment without founder approval

---

## Daily report — PM agent

The PM agent posts a daily report to Notion every day at end of day. Format:

---

Plaza Daily — [Day, DD Month YYYY]

Shipped today:
- [What was completed — be specific: feature name, PR merged, test written]

In progress:
- [What is actively being worked on and by which agent]

Waiting on you:
- [List of Tier 1 items pending founder approval — include links]
- [If none: Nothing pending — you are clear]

Blockers:
- [Anything that is stalling progress and why]
- [If none: No blockers]

Key numbers (once product is live):
- Signups today: —
- Orders today: —
- GMV today: —
- Active merchants: —

Plan for tomorrow:
- [What each agent is picking up next]

Flagged for your attention (optional):
- [Anything the PM wants to surface that does not need immediate approval but is worth knowing]

---

The founder reviews this report and replies with:
- APPROVED: [item] to unblock a Tier 1 item
- REJECTED: [item] — [reason] to block and redirect
- QUESTION: [item] to request more context before deciding

The PM agent picks up founder responses at the start of the next session and delegates accordingly.

---

## Escalation path

Agent hits a decision point.
Is it in Tier 1? YES → Stop. Notify PM agent. Wait for approval.
Is it in Tier 2? YES → Notify PM (Notion note). Proceed.
Tier 3 → Proceed autonomously.

If an agent is unsure which tier applies → treat it as Tier 1.

---

## What happens if a rule is violated

If an agent proceeds past a Tier 1 gate without approval, the PM agent must:
1. Flag it immediately in the daily report under a Protocol violation section
2. Document what happened and what the impact was
3. Propose a corrective action

This is not about blame — it is about maintaining a reliable system the founder can trust.
