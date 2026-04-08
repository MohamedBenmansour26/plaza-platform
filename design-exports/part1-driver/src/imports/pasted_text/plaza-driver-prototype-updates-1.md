In the existing Plaza driver app prototype, update the 
following screens. Keep all other screens unchanged.
Mobile only (375px). French. Inter font. Same design system.

Design system (unchanged):
  Primary: #2563EB | Accent: #E8632A | Success: #16A34A
  Error: #DC2626 | Warning: #D97706 | Dark: #1C1917
  Mid: #78716C | Surface: #FAFAF9 | Card: #FFFFFF
  Radius: 12px cards | 9999px badges | Spacing: 8px grid

---

UPDATE 1 — Delivery cards (Screen 2 — Livraisons)
On every delivery card in both "A collecter" and 
"En livraison" sections, add:

EARNINGS ROW (add below the order number row):
  Left: banknote icon (#16A34A) + "Votre gain" label 
    (12px #78716C)
  Right: "35 MAD" (14px semibold #16A34A)
  This is always visible before the driver accepts.

TIME SLOT ROW (add below earnings row):
  Left: clock icon + delivery window label (12px #78716C)
    "Livraison entre 14h00 et 15h00"
  Right: urgency pill (9999px radius, 11px semibold):
    Green pill (#F0FDF4 bg, #16A34A text): 
      "Dans 1h 20" — when >30 min remaining
    Orange pill (#FFF7ED bg, #E8632A text): 
      "Dans 18 min" — when <30 min remaining
    Red pill (#FEF2F2 bg, #DC2626 text): 
      "En retard !" — when past the window

Show one card with green pill, one with orange pill 
for visual variety.

---

UPDATE 2 — Delivery Detail (Screen 3)
Add two new sections:

SECTION "Votre gain" (white card, 12px radius, shadow,
  16px padding, mx 16px, mt 12px):
  Row: "Gain pour cette livraison" ... 
    "35 MAD" (16px semibold #16A34A)
  Row: "Gains aujourd'hui" ... 
    "175 MAD" (14px #78716C)
  Small note: "Virement effectue chaque lundi" 
    (12px #78716C italic)

SECTION "Creneau de livraison" (white card, same style,
  mt 12px):
  Header row:
    Clock icon (#2563EB) + "Creneau demande par le client"
      (14px semibold #1C1917)
    Urgency pill right (same colors as above): "Dans 1h 20"
  
  Time window row (mt 8px, centered):
    "14h00 — 15h00" (24px semibold #1C1917, centered)
    "Mardi 7 avril 2026" (13px #78716C, centered, mt 4px)
  
  Progress bar (mt 12px, full width, 8px height, 
    radius 9999px, #F1F5F9 bg):
    Filled portion (#16A34A) representing time elapsed
    in the window — show at ~30% filled
  
  Warning banner (only shown when <30 min remaining,
    #FFFBEB bg, #D97706 border-left 4px, 12px padding,
    mt 8px, radius 8px):
    "⚠ Depechez-vous ! Il vous reste moins de 30 minutes
    pour livrer dans le creneau." (13px #D97706)

Replace "Ouvrir dans Maps" button label with:
  "Naviguer — 2.3 km (estimé 18 min)" 
  to give driver a sense of travel time vs window.

---

UPDATE 3 — Collection Confirmation (Screen 4)
Replace the checklist + photo section with:

TITLE SECTION:
  "Confirmer la collecte" (18px semibold, mx 16px, mt 16px)
  "Demandez le code au marchand" (14px #78716C, mt 4px)

MERCHANT CODE CARD (white, 12px radius, shadow, 
  24px padding, mx 16px, mt 16px):
  Store icon + "Code de collecte — Boutique Fatima" 
    (14px semibold, mb 16px)
  
  "Saisissez le code a 6 chiffres" (13px #78716C, mb 12px)
  
  6-digit code input row (flex, gap 8px, justify-center):
    6 individual boxes (48x56px each, white bg, 
      border 2px #E2E8F0, radius 8px, 20px semibold 
      #1C1917 centered):
      Show filled state: [ 4 ][ 2 ][ 7 ][ _ ][ _ ][ _ ]
      Active box (4th): border 2px #2563EB, blue cursor
      Error state: all 6 boxes border #DC2626 + 
        "Code incorrect. Reessayez." (12px #DC2626, mt 8px)
      Success state: all 6 boxes border #16A34A bg #F0FDF4

  Helper: "Le marchand trouve ce code dans son application"
    (12px #78716C italic, mt 8px, centered)

PACKAGE PHOTO CARD (white, 12px radius, shadow,
  16px padding, mx 16px, mt 12px):
  "Photo du colis" (14px semibold)
  Helper: "Prenez une photo avant de partir" (12px #78716C)
  Upload zone (dashed border, 140px height, radius 8px):
    Camera icon + "Prendre une photo" (13px #78716C)
  Filled state: full-width thumbnail (140px, radius 8px)
    + green checkmark overlay bottom-right

STICKY BOTTOM:
  "Confirmer la collecte" CTA (full width, 48px, #E8632A)
  Disabled state (gray) when: code not complete OR 
    photo not taken
  Enabled when: 6 digits entered + code validated (green) 
    + photo taken
  → on confirm: Screen 2 with success toast
    "Collecte confirmee ! En route vers Fatima Zahra."

---

UPDATE 4 — Delivery Confirmation (Screen 5)
Replace signature section with customer code section.
Remove signature entirely.

Updated screen structure:

TITLE SECTION:
  "Confirmer la livraison" (18px semibold, mx 16px, mt 16px)
  "Demandez le code au client" (14px #78716C, mt 4px)

TIME SLOT REMINDER (if <30 min remaining — 
  orange banner, mx 16px, mt 12px, radius 8px,
  #FFF7ED bg, border-left 4px #E8632A, 12px padding):
  "Creneau: 14h00–15h00 — Dans 18 min" 
    (13px #E8632A semibold)

COD COLLECTION CARD (same as before, if COD order):
  Keep exactly as previously designed — 
  show amount to collect prominently

CUSTOMER CODE CARD (white, 12px radius, shadow,
  24px padding, mx 16px, mt 12px):
  User icon + "Code de livraison — Fatima Zahra Benali"
    (14px semibold, mb 16px)
  
  "Saisissez le code a 6 chiffres" (13px #78716C, mb 12px)
  
  6-digit code input row (same style as Screen 4):
    Show filled + validated state: 
    [ 8 ][ 3 ][ 1 ][ 9 ][ 0 ][ 5 ] — all green
  
  Helper: "Le client trouve ce code dans son SMS 
    de confirmation de commande" 
    (12px #78716C italic, mt 8px, centered)

PROOF PHOTO CARD (white, 12px radius, shadow,
  16px padding, mx 16px, mt 12px):
  "Photo de livraison" (14px semibold)
  Helper: "Photo obligatoire — colis remis au client" 
    (12px #DC2626, 13px)
  Upload zone (dashed border 2px #DC2626, 160px height):
    Camera icon + "Prendre une photo" (13px #78716C)
  Filled state: full-width thumbnail (160px, radius 8px)
    + green checkmark overlay

NO SIGNATURE SECTION — remove entirely.

"Signaler un probleme" link remains at bottom 
  (13px #DC2626, underline) → Screen 6

STICKY BOTTOM:
  "Confirmer la livraison" (full width, 48px, #16A34A)
  Disabled when: customer code incomplete OR 
    code not validated OR photo not taken
  Enabled when: all 3 complete
  → Screen 7 (success)

---

UPDATE 5 — Success Screen (Screen 7)
Add time slot outcome to the stats card:

In the stats card, add a new row:
  If delivered within window:
    Green checkmark + "Dans le creneau ✓" (#16A34A)
  If delivered late:
    Orange warning + "Hors creneau (+12 min)" (#D97706)

Show "Dans le creneau ✓" green for this prototype.

---

INTERACTIVE STATES TO SHOW:

6-digit code inputs:
  Empty: light gray border, empty boxes
  Typing: active box has blue border + cursor
  Complete + valid: all boxes green border + green bg
  Complete + invalid: all boxes red border + error text

Time urgency pills:
  Show green on Screen 2 card 1 (Dans 1h 20)
  Show orange on Screen 2 card 2 (Dans 18 min)
  Show orange warning banner on Screen 5 
    (under 30 min scenario)

CTA disabled states:
  Screen 4: gray until code valid + photo taken
  Screen 5: gray until code valid + photo taken

All existing navigation connections remain unchanged.