Section 1 — Component Name & Purpose
  Component name: OnboardingChecklist

  A progress-tracker widget that appears at the top of the merchant dashboard home screen
  (app/dashboard/page.tsx) immediately after signup. It guides the merchant through 4 key
  activation steps and disappears automatically once all steps are completed. It must feel
  warm and celebratory — not administrative. Think of it as a friendly coach helping a new
  merchant get their first sale, not a compliance checklist. Our merchants are solo Moroccan
  entrepreneurs who use their phone most of the time and who need to feel like Plaza was
  built specifically for them.

  Section 2 — Frames to Generate (13 total)
  Organise in a Figma canvas grid with rows = states (A, B, C, Skeleton) and columns =
  breakpoint + language (Desktop FR, Desktop AR, Mobile FR, Mobile AR). Label each frame clearly.

  Breakpoints:
  - Desktop — 1280px canvas width. Widget width: 680px, centred in dashboard layout.
  - Mobile — 375px canvas width. Widget full width minus 16px side padding = 343px.

  Languages:
  - FR — French, left-to-right (LTR).
  - AR — Arabic, right-to-left (RTL). Full layout mirror. See Section 9 for RTL rules.

  States (generate for both languages at both breakpoints):
  - State A — 0/4 complete (fresh merchant, just signed up)
  - State B — 2/4 complete (steps 1 and 2 done, mid-progress)
  - State C — 4/4 complete (celebration state, shown before auto-dismiss)
  - Frame 13 — Skeleton / Loading State (see Section 11 below)
  - Plus 1 ghost frame: "State C — Dismissing" for exit animation

  Section 3 — Card Layout & Dimensions
  Desktop card:
  - Width: 680px | Padding: 24px all sides | Border radius: 16px
  - Background: white (#FFFFFF) in States A and B; warm gradient (plaza-color-primary-50 →
    white, top to bottom) in State C
  - Shadow: 0 2px 12px rgba(0,0,0,0.07)
  - Leading-edge accent border: 4px solid plaza-color-primary-500 (#E8632A) in States A+B.
    4px solid plaza-color-success-500 (#16A34A) in State C.
    Applied to left edge in LTR, right edge in RTL.

  Mobile card:
  - Width: 343px | Padding: 16px all sides | Border radius: 12px
  - Background and shadow: same as desktop | Accent border: same rules.

  Section 4 — Internal Structure
  SECTION 1 — Card header (bottom margin: 24px desktop / 16px mobile)
  - Icon container: 32×32px circle. Background plaza-color-primary-50. Icon: Lucide Zap or
    Flame, 18px, colour plaza-color-primary-500.
  - Gap icon-to-text: 12px.
  - Title: 18px / weight 600 / line-height 1.3 / plaza-color-neutral-900.
    FR: "Lancez votre boutique" | AR: "كرجتم قلطأ"
  - Subtitle: 14px / weight 400 / line-height 1.5 / plaza-color-neutral-500.
    FR: "Quelques étapes pour recevoir votre première commande." | AR: "بلط لوأ لابقتسال ةطيسب تاوطخ."

  SECTION 2 — Progress bar (bottom margin: 8px)
  - Full-width track. Height 6px. Border radius 999px. Background plaza-color-neutral-100.
  - Fill: plaza-color-primary-500. Width = (completed/4) × 100%.
    State A: 0% | State B: 50% | State C: 100%
  - Fill direction: left-to-right in LTR. Right-to-left in RTL.

  SECTION 3 — Progress counter label (bottom margin: 16px desktop / 12px mobile)
  - 12px / weight 500 / plaza-color-neutral-500 (A+B) / plaza-color-success-600 (C)
    State A FR: "0 sur 4 étapes complétées" | AR: "0 ةلمتكم تاوطخ 4 نم"
    State B FR: "2 sur 4 étapes complétées" | AR: "2 ةلمتكم تاوطخ 4 نم"
    State C FR: "4 sur 4 — Félicitations !" | AR: "4 كوربم — 4 نم !"

  SECTION 4 — Step list
  Vertical stack of 4 steps. Divider between steps: 1px solid plaza-color-neutral-100.
  Each step row (desktop height 56px; mobile: auto with 12px top/bottom internal padding):
  - LEADING: Checkbox 24×24px. Incomplete: circle outline, stroke 1.5px, plaza-color-neutral-300.
    Complete: filled circle plaza-color-primary-500 + white checkmark (Lucide CheckCircle2).
  - GAP: 12px between checkbox and label block.
  - LABEL BLOCK: Primary label — 14px / weight 500 / plaza-color-neutral-900 when incomplete;
    plaza-color-neutral-400 + strikethrough when complete.
    Secondary label — 12px / weight 400 / plaza-color-neutral-400.
  - TRAILING: CTA button or badge. Only on incomplete steps (except Step 4 = always badge).
  - CTA button (desktop): h32px, px12px, radius 8px, border 1px plaza-color-primary-200,
    bg plaza-color-primary-50, text 12px / weight 500 / plaza-color-primary-600.

  Section 5 — Step Copy (FR + AR) (as generated above — all 4 steps with FR/AR copy and CTAs)

  Section 6 — State Details (States A, B, C as described — including celebration banner and ghost dismiss
  frame)

  Section 7 — Color Tokens (all plaza-color- tokens as listed)*

  Section 8 — Typography
  Font: Plus Jakarta Sans (primary). Noto Sans Arabic / IBM Plex Arabic for AR content.
  Numbers in AR: Western Arabic numerals (0-9), not Eastern Arabic.

  Section 9 — RTL Rules
  - dir="rtl" on the card wrapper when locale = ar
  - All Tailwind classes use start/end variants (not left/right)
  - Progress bar fill direction reverses in RTL
  - Accent border moves from left edge to right edge in RTL
  - CTA button aligns to start (right in RTL)

  Section 10 — Dev Notes
  - Component placement: above stats grid in app/dashboard/page.tsx
  - Supabase: onboarding_steps JSON column on merchant record
  - Supabase realtime for Step 4 auto-check (first order arrives)
  - Framer Motion for: step completion animation, State C dismiss (translateY -12px + opacity 0,
    4s delay, 300ms ease-in)
  - RTL: dir attribute + Tailwind start/end variants
  - Step 2 publish toggle updates is_published on merchant record (no nav away)
  - Step 3 copy link: copies /store/[slug] to clipboard, 2s success state
  - Auto-dismiss: 4s after State C renders, no manual dismiss button

  Section 11 — Frame 13: Skeleton / Loading State (NEW — added 08 April 2026)
  FRAME 13 — SKELETON / LOADING STATE
  Purpose: Shown while the app fetches onboarding_steps from Supabase. Prevents layout shift.
  Matches State A dimensions exactly so no reflow occurs on data load.

  Frames to generate: 4
  - Frame 13a: Desktop FR (680px wide card)
  - Frame 13b: Mobile FR (343px wide card)
  - Frame 13c: Desktop AR (RTL mirror, 680px)
  - Frame 13d: Mobile AR (RTL mirror, 343px)

  Card shell:
  - Same border radius, padding, shadow as live states.
  - NO accent border — it is state-dependent and should not appear during loading.
  - Background: white (#FFFFFF).

  Skeleton anatomy (all elements use pulse animation — see below):
  - Title bar: rectangle, 160×16px (desktop) / 140×16px (mobile). Rounded 4px.
    Positioned where card title sits. Colour: plaza-color-neutral-100 (base) pulsing to neutral-200.
  - Subtitle bar: rectangle, 80×12px (desktop) / 72×12px (mobile). Rounded 4px.
    Below title, same gap as live layout.
  - Progress bar track: full-width rectangle, 8px height, rounded 999px.
    Colour: plaza-color-neutral-100 pulsing to neutral-200. No fill.
  - Progress counter: rectangle, 100×10px. Rounded 4px. Below progress bar.
  - 4 step rows (same height as live rows: 56px desktop / auto mobile):
    - Circle placeholder: 20×20px circle, plaza-color-neutral-100 → neutral-200 pulsing.
    - Label rect (primary): 200×12px (desktop) / 160×12px (mobile). Rounded 4px.
    - Label rect (secondary): 140×10px (desktop) / 120×10px (mobile). Rounded 4px. Below primary.
    - CTA rect: 80×24px. Rounded 8px. Trailing position. Rows 1-3 only.
    - Row 4 trailing: badge rect 72×20px. Rounded 999px.
    Dividers between rows: same 1px solid plaza-color-neutral-100 as live state.

  Animation spec:
  - Type: opacity pulse. plaza-color-neutral-100 → neutral-200.
  - Opacity: 0.5 → 1.0 → 0.5 (smooth, no sharp edges).
  - Duration: 1.4s per cycle. Easing: ease-in-out. Loop: infinite.
  - All skeleton elements pulse in sync (no stagger — avoids visual noise).
  - Framer Motion code ref:
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}

  Transition to State A (data loaded):
  - Cross-fade: opacity 0 → 1 over 200ms ease-out using AnimatePresence.
  - Terra cotta accent border fades in simultaneously with State A card.
  - IMPORTANT for Dev: returning merchants may resolve directly to State B or C —
    do not assume data always resolves to 0/4 complete.

  RTL (Frames 13c + 13d):
  - Mirror all skeleton element positions horizontally.
  - dir="rtl" on card wrapper. Tailwind start/end handles the rest.
  - Progress bar: full width, no directional fill in skeleton — no change needed for RTL.

  Error state (if Supabase fetch fails or times out >5s):
  - Replace skeleton with inline error inside the card shell (no skeleton elements).
  - Error row: Lucide CircleAlert icon (16px, plaza-color-warning-500 #D97706) + text
    FR: "Impossible de charger les étapes. Réessayez." | AR: "ةلواحملا دعأ .تاوطخلا ليمحت رذّعت."
    Text: 13px / plaza-color-neutral-600.
  - Ghost retry button: "Réessayer" / "ةلواحملا دعأ" — same CTA button style as step rows.
    Positioned inline to the right of the error text (trailing in LTR, leading in RTL).
  - Card shell retained (same border radius, padding, no accent border) to prevent layout shift.