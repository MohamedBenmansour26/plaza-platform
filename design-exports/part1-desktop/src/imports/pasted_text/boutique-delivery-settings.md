In the existing Plaza business owner platform prototype, 
update two sections only. Keep all other screens unchanged.
Apply to both mobile (375px) and desktop (1280px).

Design system (unchanged):
  Primary: #2563EB | Accent: #E8632A | Success: #16A34A
  Error: #DC2626 | Dark: #1C1917 | Mid: #78716C
  Surface: #FAFAF9 | Card: #FFFFFF
  Font: Inter | Radius: 12px cards | Spacing: 8px grid

---

UPDATE 1 — Ma Boutique: Delivery Settings
Screen: /dashboard/boutique
Replace the entire "Livraison" section with this:

Section "Livraison" (white card, 12px radius, shadow, 24px padding):
  Title "Parametres de livraison" (16px semibold, border-bottom pb 12px)

  --- HOW DELIVERY WORKS (info block) ---
  Info banner (#EFF6FF bg, radius 8px, 12px padding, 
    blue info icon left, margin-bottom 20px):
    "Comment fonctionne la livraison Plaza" (13px semibold #1C1917, mb 6px)
    "• Le client paie 30 MAD de frais de livraison a chaque commande"
    "• Ces 30 MAD sont collectes par Plaza et couvrent la livraison"
    "• Vous pouvez choisir d'offrir la livraison a partir d'un certain montant de panier — dans ce cas, les 30 MAD sont deduits de votre revenu"
    (all lines 12px #78716C, line-height 1.6)

  --- FREE DELIVERY THRESHOLD ---
  Toggle row (flex space-between, 48px, border-bottom 1px #F1F5F9):
    Left:
      "Offrir la livraison gratuite" (14px medium #1C1917)
      "A partir d'un montant de panier que vous definissez" 
        (12px #78716C, mt 2px)
    Right: toggle switch — show OFF state by default (gray)

  Conditional block (hidden when OFF, slides down when ON,
    margin-top 16px, padding-top 16px):
    
    Label "Offrir la livraison gratuite a partir de" 
      (13px medium #1C1917, mb 8px)
    
    Input row (flex, gap 8px, align-center):
      Number input (120px, 48px height, 20px semibold centered,
        border 2px #2563EB when focused, radius 8px)
        Placeholder: "500"
      "MAD" label (16px #78716C)
      "de panier" label (14px #78716C)
    
    Preview card (margin-top 12px, #F0FDF4 bg, radius 8px, 
      12px padding, border 1px #BBF7D0):
      Two scenario rows:
        Row 1 (flex space-between):
          Left: cart icon (#78716C) + "Panier en dessous de 500 MAD"
            (13px #1C1917)
          Right: "Client paie 30 MAD" (13px #78716C)
        Divider (1px #D1FAE5, margin 8px 0)
        Row 2 (flex space-between):
          Left: green checkmark icon + "Panier au-dessus de 500 MAD"
            (13px #1C1917)
          Right: "Livraison gratuite" (13px #16A34A semibold)
        
        Note below (margin-top 8px, padding-top 8px, 
          border-top 1px #D1FAE5):
          "Les 30 MAD de livraison seront deduits de votre revenu 
          sur ces commandes." (12px #78716C italic)

  --- IMPACT ON YOUR PAYOUT ---
  (Always visible, below the toggle block)
  Divider (margin 20px 0)
  Label "Impact sur votre revenu" (14px medium #1C1917, mb 12px)
  
  Example card (#FAFAF9, border 1px #E2E8F0, radius 8px, 
    16px padding):
    Title "Exemple — commande de 350 MAD" 
      (12px #78716C uppercase, mb 10px)
    
    Row: "Prix produit(s)" ............ "350 MAD"
    Row: "Commission Plaza (5%)" ....... "- 17,50 MAD" (#DC2626)
    Row: "Frais livraison client" ....... "+ 30 MAD" (#78716C)
      Small note: "(payes par le client, non deduits de vous)"
      (11px #A8A29E italic, below this row)
    Thin divider (margin 8px 0)
    Row: "Votre revenu net" (14px semibold) ..... 
      "332,50 MAD" (14px semibold #16A34A)
    
    Show second example when free delivery threshold is ON:
    Separator "Si panier > 500 MAD (livraison gratuite activee):"
      (12px #78716C, centered, margin 12px 0)
    Row: "Prix produit(s)" ............ "600 MAD"
    Row: "Commission Plaza (5%)" ....... "- 30 MAD" (#DC2626)
    Row: "Frais livraison (pris en charge par vous)" .. 
      "- 30 MAD" (#DC2626)
    Thin divider
    Row: "Votre revenu net" (14px semibold) ..... 
      "540 MAD" (14px semibold #16A34A)

Save button: "Enregistrer" (primary blue, 200px, 48px, 
  margin-top 24px)
Success toast: "Parametres de livraison mis a jour !" (green, top)

---

UPDATE 2 — Produits: Simplified Price Display
Screen: /dashboard/produits/[id] and /dashboard/produits/nouveau
Replace the existing pricing block with this simpler version:

Pricing card (white, 12px radius, shadow, 24px padding,
  border-left 4px #2563EB):
  Title "Prix du produit" (16px semibold #1C1917, mb 4px)
  Helper "Definissez le prix que le client verra sur votre boutique"
    (13px #78716C, mb 16px)

  --- PRICE INPUT ---
  Label "Prix pour le client" (13px medium #1C1917, mb 6px)
  Input (full width, 56px height, radius 8px, 
    border 1px #E2E8F0, focused border 2px #2563EB):
    Value "350" (24px semibold #1C1917, padding-left 16px)
    "MAD" suffix (16px #78716C, padding-right 16px, right-aligned)

  --- YOUR REVENUE BREAKDOWN ---
  Revenue block (margin-top 12px, #FAFAF9 bg, radius 8px,
    12px padding, border 1px #E2E8F0):
    Title "Votre revenu sur ce produit" 
      (12px #78716C uppercase, mb 10px)
    
    Row: "Prix client" ................. "350 MAD" (14px #1C1917)
    Row: "Commission Plaza (5%)" ........ "- 17,50 MAD" (14px #DC2626)
    Thin divider (margin 8px 0)
    Row: "Votre revenu net" (14px semibold #1C1917) ... 
      "332,50 MAD" (14px semibold #16A34A)
    
    Separator (margin 10px 0, border-top 1px dashed #E2E8F0)
    
    Note row (flex, gap 6px, align-start):
      Info icon (16px #78716C, flex-shrink 0, mt 1px)
      "Les 30 MAD de livraison sont factures par commande 
      et non par produit. Ils sont visibles dans le recapitulatif 
      de vos revenus." (12px #78716C, line-height 1.5)

  Numbers update in real time as merchant types the price.
  Show loading shimmer on revenue rows for 200ms on input change.

---

INTERACTIVE STATES:

Delivery toggle (Ma Boutique):
  OFF → conditional block hidden, example shows single scenario
  ON → conditional block slides down (200ms ease), 
    both examples visible in the impact card
  Threshold input → typing updates the preview card numbers 
    in real time

Price input (Produits):
  Typing updates "Commission Plaza" and "Votre revenu net" 
    in real time
  Empty input → revenue rows show "—" placeholders
  Input below 1 MAD → show inline error below input:
    "Le prix minimum est 1 MAD" (12px #DC2626)

Both mobile (375px) and desktop (1280px):
  Mobile: all blocks full width, stacked
  Desktop: price calculator in right column of product form,
    delivery settings in left column of boutique screen
    with the impact example card spanning full width below