In the existing Plaza business owner platform prototype, 
update two sections with new pricing features. Keep all 
existing screens unchanged — only modify the screens 
specified below. Apply to both mobile (375px) and 
desktop (1280px) versions.

Design system (unchanged):
  Primary: #2563EB | Accent: #E8632A | Success: #16A34A
  Error: #DC2626 | Dark: #1C1917 | Mid: #78716C
  Surface: #FAFAF9 | Card: #FFFFFF
  Font: Inter | Radius: 12px cards | Spacing: 8px grid

---

UPDATE 1 — Ma Boutique: Dynamic Delivery Pricing
Screen: /dashboard/boutique
Replace the existing "Livraison" section with this:

Section "Livraison" (white card, 12px radius, shadow, 24px padding):
  Title "Regles de livraison" (16px semibold, border-bottom pb 12px)

  --- SUBSECTION: Tarifs par zone ---
  Label "Tarifs par ville" (14px medium #1C1917, margin-bottom 8px)
  Helper "Definissez un prix de livraison par zone de livraison" 
    (12px #78716C, margin-bottom 12px)

  City pricing table (white, border 1px #E2E8F0, radius 8px, 
  overflow hidden):
    Header row (40px, #F8FAFC bg, border-bottom):
      "Ville" (12px semibold #78716C, 40% width) | 
      "Frais de livraison" (12px semibold #78716C, 40%) |
      "Action" (12px semibold #78716C, 20%)
    
    Data rows (48px each, border-bottom #F1F5F9):
      Row 1: "Casablanca" | input "20" + "MAD" suffix (gray bg) | 
        trash icon (#DC2626)
      Row 2: "Rabat" | input "25" + "MAD" suffix | trash icon
      Row 3: "Autres villes" (italic #78716C, non-editable label) | 
        input "30" + "MAD" suffix | — (no delete, always present)
    
    "Autres villes" row is always the last row and cannot be deleted.
    It acts as the fallback for any city not explicitly listed.

  "+ Ajouter une ville" button (outline, #2563EB, 36px, 
    radius 8px, full width, margin-top 8px, + icon left)
    On click: new empty row appears at bottom of table 
    (before "Autres villes") with city name input + price input

  Info banner (margin-top 12px, #EFF6FF bg, radius 8px, 12px padding,
    info icon #2563EB left):
    "Plaza ajoute 35 MAD de frais de service par livraison.
    Ces frais sont transparents pour le client sur la page de commande."
    (12px #1C1917)

  --- SUBSECTION: Livraison gratuite ---
  Divider (margin 16px 0)
  
  Toggle row (flex space-between, 44px):
    Label "Livraison gratuite a partir d'un montant" 
      (14px medium #1C1917)
    Toggle switch — ON state (#16A34A)
  
  Conditional block (visible when toggle is ON, 
    animated slide-down, margin-top 12px):
    
    Row (flex, gap 8px, align-center):
      "Si le panier depasse" (14px #78716C)
      Input (80px, center-aligned, "500") + "MAD" suffix
      "→ livraison offerte" (14px #16A34A, semibold)
    
    Preview pill (margin-top 8px, #F0FDF4 bg, 9999px radius, 
      12px padding horizontal, 6px vertical, inline-flex):
      Green checkmark icon + "Panier > 500 MAD = Livraison gratuite"
      (13px #16A34A)

  --- SUBSECTION: Resume des frais pour le client ---
  Divider (margin 16px 0)
  Label "Ce que verra le client" (14px medium #1C1917, mb 8px)
  
  Example scenario card (#FAFAF9, border 1px #E2E8F0, radius 8px, 
    12px padding):
    Title "Exemple — commande a Casablanca, panier 350 MAD" 
      (12px #78716C, mb 8px)
    Row: "Sous-total produits" ... "350 MAD"
    Row: "Livraison ville (Casablanca)" ... "20 MAD" 
    Row: "Frais de service Plaza" ... "35 MAD" (#78716C)
    Divider
    Row: "Total client" (14px semibold) ... "405 MAD" (14px semibold #1C1917)
    
    Small note below: "Si le panier depasse 500 MAD, 
    les 20 MAD de livraison ville sont offerts. 
    Les 35 MAD Plaza restent applicables." 
    (11px #78716C, italic)

---

UPDATE 2 — Produits: Price Calculator
Screen: /dashboard/produits/[id] (Edit) and /dashboard/produits/nouveau (Add)
Replace the existing "Prix (MAD)" field with this full pricing block:

Pricing card (white, 12px radius, shadow, 24px padding, 
  border-left 4px #2563EB):
  Title "Prix et revenus" (16px semibold #1C1917, mb 4px)
  Helper "Calculez le bon prix en tenant compte des frais Plaza" 
    (13px #78716C, mb 16px)

  --- MODE SELECTOR ---
  Two-option toggle (full width, 44px, border 1px #E2E8F0, 
    radius 8px, flex, no gap):
    Option A (50%): "Je fixe le prix client" 
      (13px medium, centered, 44px height)
    Option B (50%): "Je fixe mon revenu" 
      (13px medium, centered, 44px height)
    Active option: white bg, #2563EB text, shadow inset
    Inactive: #FAFAF9 bg, #78716C text
    Show Option A as active by default.

  Divider (margin 12px 0)

  --- MODE A: Je fixe le prix client (default) ---
  Show when Option A is active:

  Input row:
    Label "Prix final pour le client" (13px medium #1C1917)
    Input (full width, 48px, radius 8px, border 1px #E2E8F0,
      large text 20px semibold #1C1917, center-aligned)
      Value: "350" + "MAD" suffix (gray, inside input right)
    Helper: "C'est le montant que le client paiera pour ce produit"
      (12px #78716C)

  Results block (margin-top 12px, #FAFAF9 bg, radius 8px, 
    12px padding, border 1px #E2E8F0):
    Title "Votre revenu sur ce produit" (12px #78716C uppercase mb 8px)
    
    Row: "Prix client" ... "350 MAD" (14px)
    Row: "Commission Plaza (5%)" ... "- 17,50 MAD" 
      (14px #DC2626)
    Thin divider
    Row: "Votre revenu net" (14px semibold #1C1917) ... 
      "332,50 MAD" (14px semibold #16A34A)
    
    Separator line (margin 8px 0)
    Note (12px #78716C, italic):
      "Les frais de livraison (35 MAD + tarif ville) 
      sont factures par commande, pas par produit."

  --- MODE B: Je fixe mon revenu ---
  Show when Option B is active (swap content, keep same layout):

  Input row:
    Label "Revenu souhaite par vente" (13px medium #1C1917)
    Input (same style as Mode A)
      Value: "300" + "MAD" suffix
    Helper: "Entrez le montant que vous souhaitez recevoir"
      (12px #78716C)

  Results block (same styling):
    Title "Prix a afficher au client" (12px #78716C uppercase mb 8px)
    
    Row: "Votre revenu souhaite" ... "300 MAD" (14px)
    Row: "Commission Plaza (5%)" ... "+ 15,79 MAD"
      (14px #E8632A)
      Helper below this row: 
        "(300 ÷ 0.95, arrondi au dirham)" 
        (11px #A8A29E, italic)
    Thin divider
    Row: "Prix client final" (14px semibold #1C1917) ... 
      "315,79 MAD" (14px semibold #2563EB)
    
    CTA hint (margin-top 8px, #EFF6FF bg, radius 6px, 8px padding):
      Blue info icon + "Ce prix sera automatiquement applique 
      sur votre boutique" (12px #2563EB)

  --- SHARED FOOTER NOTE ---
  (Below both modes, always visible)
  Info banner (#FFF7ED bg, radius 8px, 12px padding, 
    orange info icon, margin-top 12px):
    "Recapitulatif des frais Plaza" (13px semibold #1C1917, mb 4px)
    "• 5% du prix produit, preleve par vente" (12px #78716C)
    "• 35 MAD par livraison + tarif ville (defini dans Ma Boutique)"
    (12px #78716C)
    "• Aucun abonnement mensuel — vous payez uniquement a la vente"
    (12px #16A34A, semibold)

---

INTERACTIVE STATES:

Delivery pricing table:
  "+ Ajouter une ville": click adds new editable row
  City input: text field, placeholder "Nom de la ville"
  Price input: number field, shows MAD suffix
  Trash icon: hover turns #DC2626, click removes row
  "Autres villes" row cannot be deleted (trash icon disabled/hidden)

Free delivery toggle:
  ON → threshold input + preview pill slide down (animate)
  OFF → threshold block collapses (animate)
  Threshold input: typing a number updates the preview pill in real time

Price calculator:
  Mode toggle: clicking Option B slides content 
    (animate opacity + translate, 200ms ease)
  Price input: as merchant types, recalculation updates 
    result rows in real time (show updated numbers)
  Show loading shimmer on result rows for 300ms when input changes
    before showing final numbers (simulates calculation)

Both screens (mobile 375px and desktop 1280px):
  Mobile: all blocks stacked vertically, full width
  Desktop: pricing calculator appears in the right column 
    of the two-column product form layout