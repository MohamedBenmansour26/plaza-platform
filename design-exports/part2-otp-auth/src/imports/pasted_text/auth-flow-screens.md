Plaza Platform — Auth Flow — Phone OTP + PIN
  Mobile-first (375px). Warm Moroccan brand. French primary, Arabic RTL secondary.
  Target user: solo Moroccan entrepreneur, non-technical, uses phone primarily.
  Style: white backgrounds, primary blue #2563EB, accent orange #E8632A, neutral #FAFAF9.
  All screens full-height mobile layout (min-h-screen). No bottom nav bar on auth screens.
  Spacing system: 8px base grid. Touch targets minimum 44×44px.
  Font: system-ui / -apple-system. Weights: 400, 500, 600 only.

  6 screens — paste in order:

  Screen 1 — Phone Entry (Welcome)
  SCREEN 1 — Phone Entry (Welcome)
  Purpose: First screen a new or returning user sees. Entry point for both signup and login flows.

  Layout (mobile 375px, full height):
  - Top 30%: centered Plaza logo (text "Plaza" in #2563EB, bold 28px) + tagline "Votre boutique en ligne, en 5
   minutes." (14px #78716C, centered)
  - Middle 40%: form section
    - Label: "Votre numéro de téléphone" (13px #78716C, font-medium)
    - Input row (h-14, border #E2E8F0, rounded-xl, bg-white):
      - Left section (w-20, border-r #E2E8F0): Morocco flag emoji 🇲🇦 + "+212" (14px #1C1917 font-medium) tap
  to open country selector
      - Right section: large number input, placeholder "6 XX XX XX XX" (16px, no leading zero)
    - Below input: helper text "Nous enverrons un code de vérification par SMS" (12px #78716C)
  - Bottom 30%: CTA section
    - Primary button: "Continuer" h-14 full-width rounded-xl bg-[#2563EB] text-white 16px font-semibold.
  Disabled state: bg-[#E2E8F0] text-[#A8A29E] cursor-not-allowed
    - Small print (11px #A8A29E centered): "En continuant, vous acceptez nos Conditions d'utilisation et notre
   Politique de confidentialité."

  States to show:
  1. Default: empty input, Continuer button disabled
  2. Typing: valid number entered, Continuer button active (blue)
  3. Invalid number: border turns #DC2626, helper text changes to "Numéro invalide. Format: 6XX XX XX XX" in
  red

  Desktop adaptation (1280px): center card max-w-[420px] with rounded-2xl shadow-lg on bg-[#FAFAF9].

  Screen 2 — OTP Verification
  SCREEN 2 — OTP Verification
  Purpose: Verify the merchant's phone number. Used in both signup and PIN reset flows.

  Layout (mobile, full height):
  - Top: back arrow (←) button top-left h-11 w-11
  - Center content (mt-12):
    - Headline: "Vérifiez votre numéro" (24px font-semibold #1C1917)
    - Sub: "Code envoyé par SMS au" + masked number "+212 6•• •• •• 42" (14px #78716C, number in #1C1917)
    - OTP input: 6 separate square boxes (w-12 h-14 each, gap-2, border #E2E8F0 rounded-xl, centered)
      - Active box: border-2 #2563EB with subtle blue glow ring
      - Filled box: bg-[#F8FAFC] border #E2E8F0, shows digit large (20px font-semibold)
      - Error box: border #DC2626 bg-[#FEF2F2]
    - Error message (below boxes, 13px #DC2626): "Code incorrect. 2 tentative(s) restante(s)."
    - Resend section (mt-6):
      - Inactive (counting down): "Renvoyer le code dans 0:45" (13px #A8A29E)
      - Active: "Renvoyer le code" (13px #2563EB underline, tappable)
    - "Mauvais numéro ?" link (13px #78716C, bottom of content)

  States to show:
  1. Default: empty boxes, countdown active (e.g. 0:52)
  2. Filling: boxes fill left to right as user types
  3. Checking (after 6th digit): boxes show loading pulse animation, "Vérification..." below
  4. Error: boxes red, error message visible, countdown continues
  5. Lockout: all boxes disabled, large message "Trop de tentatives. Réessayez dans 24h." (#DC2626), countdown
   gone
  6. Success: brief green checkmark animation before transitioning

  Desktop: same center card as Screen 1.

  Screen 3 — PIN Setup
  SCREEN 3 — PIN Setup (first-time only, after OTP verified)
  Purpose: Merchant creates their 4-digit daily login PIN. Two-step: choose PIN → confirm PIN.

  Layout (mobile, full height):
  - Top: back arrow, progress dots (2 steps: ● ● step indicator, step 1 = filled, step 2 = outline)
  - Centered content (mt-8):
    - Step label (12px #78716C uppercase tracking-wide): "SÉCURISEZ VOTRE COMPTE"
    - Headline: "Créez votre code PIN" (22px font-semibold #1C1917) — changes to "Confirmez votre code PIN" on
   step 2
    - Sub: "Vous l'utiliserez pour vous connecter chaque jour" (14px #78716C)
    - PIN dots display: 4 large circles (w-5 h-5) in a row centered. Empty = border-2 #E2E8F0 bg-white. Filled
   = bg-[#2563EB]. Gap-4.
    - Below dots: error state "Les codes ne correspondent pas. Réessayez." (13px #DC2626)
    - Custom number pad (3×4 grid, mt-8):
      - Keys 1-9: rounded-2xl bg-white border border-[#E2E8F0] h-16 w-full text-xl font-medium #1C1917, active
   state bg-[#F0F4FF]
      - Key 0: center of bottom row
      - Backspace key: Lucide Delete icon, same style as digit keys, bottom-right
      - Key tap: brief scale animation (scale 0.95)
    - Biometric section (below number pad, mt-6):
      - Row: fingerprint icon (#A8A29E w-5 h-5) + "Activer Face ID / empreinte digitale" (13px #78716C) +
  toggle (disabled, bg-[#E2E8F0]) + "Bientôt disponible" pill (bg-[#F5F5F4] text-[#A8A29E] text-xs px-2
  rounded-full)

  States to show:
  1. Step 1 empty: 4 empty circles, no error
  2. Step 1 filling: circles fill blue as digits entered
  3. Step 1 complete: transitions to step 2 (progress dots update)
  4. Step 2 mismatch: circles shake animation, red error message, clear to retry

  Desktop: same center card.

  Screen 4 — Daily Login
  SCREEN 4 — Daily Login (returning merchant)
  Purpose: Fast daily access for a merchant who has already set up their PIN.

  Layout (mobile, full height):
  - Top (pt-16): Plaza logo centered (same as Screen 1)
  - Merchant identity card (mx-4 mt-8, bg-white rounded-2xl shadow-sm p-4):
    - Avatar circle (w-16 h-16 bg-[#EFF6FF] rounded-full, centered) showing merchant initials in #2563EB (20px
   font-semibold)
    - Store name (18px font-semibold #1C1917, centered, mt-2): "Fatima Store"
    - Masked phone (13px #78716C, centered): "+212 6•• •• •• 42"
  - PIN entry section (mt-8):
    - Label (12px #78716C uppercase tracking-wide centered): "ENTREZ VOTRE CODE PIN"
    - PIN dots: same 4-circle row as Screen 3
    - Error: "PIN incorrect. X tentative(s) restante(s)." (13px #DC2626)
    - Custom number pad (same 3×4 grid as Screen 3)
    - "PIN oublié ?" link (13px #2563EB, centered, mt-4, below number pad)
  - Bottom: "Changer de compte" (12px #A8A29E, centered, absolute bottom pb-8)

  States to show:
  1. Default: empty dots, no error
  2. Filling: dots fill blue
  3. Error (attempt 1-2): red error message, dots clear
  4. Lockout (after 3 fails): all dots disabled gray, "Compte verrouillé. Utilisez PIN oublié." message

  Desktop: same center card.

  Screen 5 — Forgot PIN
  SCREEN 5 — Forgot PIN
  Purpose: Merchant has their phone but forgot the PIN. Verified via OTP, then resets PIN.

  This flow reuses Screen 2 (OTP) and Screen 3 (PIN setup). Only show the entry screen here.

  Layout (mobile):
  - Back arrow top-left
  - Top content (mt-12):
    - Lock icon (Lucide Lock, w-16 h-16, bg-[#FFFBEB] rounded-full p-4, icon color #D97706, centered)
    - Headline: "PIN oublié ?" (22px font-semibold #1C1917, mt-4, centered)
    - Sub: "Nous allons vérifier votre identité via SMS avant de réinitialiser votre PIN." (14px #78716C,
  centered, max-w-[280px] mx-auto)
  - Phone confirmation card (mx-4 mt-8, bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4):
    - Row: phone icon (Lucide Phone, #78716C w-4 h-4) + masked number "+212 6•• •• •• 42" (14px #1C1917)
    - Small note: "Un code vous sera envoyé à ce numéro." (12px #78716C)
  - CTA (fixed bottom, pb-8 px-4):
    - Primary button: "Envoyer un code SMS" h-14 full-width rounded-xl bg-[#2563EB] text-white 16px
  font-semibold
    - Below button: "Ce n'est pas votre numéro ?" link (13px #78716C) → goes to phone recovery

  Flow arrow: this screen → Screen 2 (OTP verify) → Screen 3 (new PIN setup)

  Screen 6 — Phone Recovery
  SCREEN 6 — Phone Recovery (lost phone / email magic link)
  Purpose: Merchant lost their phone/SIM and cannot receive SMS. Uses recovery email set at signup.

  Layout (mobile):
  - Back arrow top-left
  - Top content (mt-12):
    - Icon: Lucide MailOpen, w-16 h-16, bg-[#EFF6FF] rounded-full p-4, icon #2563EB, centered
    - Headline: "Récupérez votre accès" (22px font-semibold #1C1917, mt-4, centered)
    - Sub: "Entrez l'email de récupération que vous avez fourni à l'inscription." (14px #78716C, centered,
  max-w-[280px])
  - Form (mx-4 mt-8):
    - Label: "Email de récupération" (13px #78716C font-medium)
    - Input: h-12 full-width border #E2E8F0 rounded-xl px-4 text-sm, placeholder "votre@email.com"
    - Error state: border #DC2626, message "Email non reconnu. Vérifiez l'adresse ou contactez le support."
  - CTA (fixed bottom, pb-8 px-4):
    - Primary: "Recevoir le lien de récupération" h-14 full-width rounded-xl bg-[#2563EB]
  - Footer: "Vous n'avez pas configuré d'email de récupération ?" + "Contacter le support" link (#E8632A)

  SUCCESS STATE (replace form after send):
  - Checkmark circle (w-20 h-20, bg-[#F0FDF4], Lucide CheckCircle2 #16A34A, centered)
  - Headline: "Email envoyé !" (22px font-semibold #1C1917)
  - Sub: "Vérifiez votre boîte mail. Le lien vous permettra de changer votre numéro de téléphone." (14px
  #78716C, max-w-[280px] centered)
  - Note (mt-4, 12px #A8A29E): "Le lien expire dans 15 minutes."
  - "Renvoyer l'email" link (#2563EB, 13px, mt-6)

  Global rules (append to all screens):
  GLOBAL RULES FOR ALL SCREENS

  RTL / Arabic:
  - All layouts mirror horizontally when dir=rtl
  - Arrows reverse direction (← becomes →)
  - Number pad stays LTR (digits always read left-to-right)
  - Phone numbers always in dir=ltr span
  - Text alignment switches to text-end (right) in Arabic
  - Tailwind: use start/end variants, never left/right

  Typography hierarchy across all screens:
  - Screen headline: 22-24px font-semibold #1C1917
  - Input labels: 13px font-medium #78716C
  - Input text: 16px (prevents iOS auto-zoom) #1C1917
  - Helper text: 12-13px #78716C
  - Error text: 13px #DC2626
  - Micro copy: 11-12px #A8A29E

  Primary button pattern (all screens):
  - h-14 (56px) full-width rounded-xl
  - Active: bg-[#2563EB] text-white font-semibold 16px, hover bg-[#1d4ed8]
  - Disabled: bg-[#E2E8F0] text-[#A8A29E] cursor-not-allowed
  - Loading: bg-[#2563EB] with centered Loader2 spin animation

  Transitions between screens:
  - Slide left for forward navigation
  - Slide right for back navigation
  - OTP check → brief loading state before transitioning
  - PIN step 1→2 → fade transition (same screen)

  i18n namespaces: auth.welcome, auth.otp, auth.pin, auth.login, auth.forgotPin, auth.recovery