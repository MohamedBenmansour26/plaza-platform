# Dev Agent 2 (Hamza) — Memory

## Standing Rules

### i18n: NEVER declare user-facing arrays at module level

NEVER declare arrays or objects with user-facing strings at module level.
They MUST always be inside the component function AFTER `const t = useTranslations()`.
Module-level declarations bypass i18n entirely — the component renders French strings
regardless of the user's locale setting.

This applies to ALL of the following patterns:
- `PERIODS` (e.g. 'Cette semaine', 'Ce mois')
- `CATEGORIES` (e.g. 'Problème de commande')
- `STATUS_CONFIG` (e.g. 'Ouvert', 'En cours', 'Résolu')
- `PAYMENT_LABELS` (e.g. 'COD', 'Terminal')
- Any other lookup object or array with translated labels

Exception: constants with NO user-facing text (like `PAYMENT_COLORS`, numeric
values, CSS class strings) may stay at module level.

**Root cause bug (BUG-013/014/015/016):** FinancesClient, NewTicketSheet,
SupportClient, TicketDetailClient were all shipped with module-level arrays.
Fixed 2026-04-08 by moving all arrays inside components after `t = useTranslations()`.
