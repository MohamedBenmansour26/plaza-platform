Create a fully clickable mobile prototype (375px) for Plaza — a platform that helps Moroccan small business owners manage their online store end to end. All text in French. Use Inter font.

Design system:
  Primary: #2563EB | Accent: #E8632A | Success: #16A34A
  Error: #DC2626 | Dark: #1C1917 | Mid: #78716C
  Surface: #FAFAF9 | Card: #FFFFFF
  Radius: 8px standard, 12px cards, 9999px badges
  Spacing: 8px grid

Navigation: bottom tab bar (always visible, 5 tabs):
  Accueil (home icon) | Produits (grid icon) | Commandes (list icon) | Finances (chart icon) | Plus (dots icon)
Active tab: #2563EB icon + label. Inactive: #78716C.

---

SCREEN 1 — Accueil (Home Dashboard) — /dashboard

Top bar: Plaza logo left + merchant avatar right (tappable, links to Screen 11 Account)
Greeting: "Bonjour, Fatima ! 👋" (20px semibold #1C1917)
Subtext: "Mardi, 7 avril 2026" (14px #78716C)

Stats grid (2x2, white cards, 12px radius, shadow 0 1px 3px rgba(0,0,0,0.08), 8px gap):
  Card 1: bag icon (#2563EB) + "Commandes aujourd'hui" (12px #78716C) + "12" (28px semibold #1C1917)
  Card 2: banknote icon (#E8632A) + "Revenus aujourd'hui" (12px #78716C) + "1 840 MAD" (22px semibold)
  Card 3: clock icon (#D97706) + "En attente" (12px #78716C) + "3" (28px semibold) — tappable, links Screen 5 filtered pending
  Card 4: check icon (#16A34A) + "Livrees" (12px #78716C) + "9" (28px semibold)

Section "Activite recente" (18px semibold #1C1917, margin-top 24px):
3 order cards (white, 12px radius, shadow, 12px padding each, 8px gap):
  Each: "#PLZ-042" bold left + customer name + amount MAD right + status badge below left + "Il y a 23 min" gray right
  Card 1: #PLZ-042, Fatima Z., 879 MAD, "En attente" (gray pill)
  Card 2: #PLZ-041, Youssef E., 250 MAD, "Confirmee" (blue pill)
  Card 3: #PLZ-040, Meryem A., 1 450 MAD, "Livree" (green pill)
  All cards tappable, link to Screen 6 Order Detail.

Banner (margin-top 24px, #FFF7ED bg, radius 12px, padding 16px, border-left 4px #E8632A):
  "Votre boutique est en ligne !" (14px semibold #1C1917)
  "plaza.ma/fatima-store" (13px #2563EB, underline)
  "Copier le lien" button (32px, white bg, border 1px #E2E8F0, radius 8px, 13px #1C1917)

Empty state (show as annotation — when 0 orders and 0 products):
  Setup checklist card (white, 12px radius, shadow, 16px padding):
    Title "Configurez votre boutique" (16px semibold)
    3 checklist items with circles (empty: gray, done: green checkmark):
      "Ajoutez votre premier produit" — links Screen 4
      "Partagez votre lien de boutique"
      "Recevez votre premiere commande"

---

SCREEN 2 — Produits (Products List) — /dashboard/produits

Top bar (white, 56px, shadow 0 1px 0 #E2E8F0):
  "Mes produits" (18px semibold #1C1917) left + "Ajouter" button (primary blue #2563EB, 36px, radius 8px, white text 14px) right
Search bar (margin 12px 16px, 40px, radius 8px, border 1px #E2E8F0, search icon left, placeholder "Rechercher un produit..." 14px #A8A29E)
Filter chips row (horizontal scroll, 16px left padding, 8px gap):
  "Tous" (active, #2563EB bg white text 9999px radius) | "En stock" | "Rupture" | "Masques"
  Inactive chips: white bg, #78716C text, border 1px #E2E8F0

Product list (16px padding, 8px gap):
5 cards (white, 12px radius, shadow, 12px padding, flex row, 12px gap):
  Image (80x80px, #F5F5F4, radius 8px) | content (flex 1): name 14px medium #1C1917 + price "350 MAD" 14px semibold + stock "12 en stock" 12px #78716C | right: visibility toggle + edit chevron

Products:
  "Robe d'ete fleurie" — 350 MAD — 12 en stock — toggle ON
  "Sac a main cuir" — 580 MAD — 3 en stock — toggle ON
  "Sandales dorees" — 220 MAD — 0 en stock — "Rupture" red badge (pill, #FEE2E2 bg, #DC2626 text) instead of toggle
  "Foulard soie" — 180 MAD — 8 en stock — toggle OFF (hidden)
  "Ceinture brodee" — 120 MAD — 15 en stock — toggle ON

Each card tappable (links Screen 3). "Ajouter" button links Screen 4.

Empty state (annotated):
  Box icon (48px, #E2E8F0, centered) + "Aucun produit pour le moment" (16px semibold) + "Ajoutez votre premier produit" button (primary blue, full width)

---

SCREEN 3 — Product Detail/Edit — /dashboard/produits/[id]

Top bar: back arrow (links Screen 2) + "Modifier le produit" (16px semibold) centered
Content (scrollable, 16px padding, pb-96px for sticky bar):

Product photo (white card, 12px radius, shadow):
  200px height placeholder, fill #F5F5F4, camera icon centered
  "Changer la photo" link (14px #2563EB, centered, margin-top 8px)

Form card (white, 12px radius, shadow, 16px padding, margin-top 12px):
  Label + input blocks (12px gap):
  "Nom du produit (FR)": input filled "Robe d'ete fleurie"
  "Nom du produit (AR)": input hint "(RTL)" — placeholder "اسم المنتج" dir=rtl
  "Description": textarea 3 rows, "Robe legere et coloree, parfaite pour l'ete..."
  "Prix (MAD)": number input "350" + "MAD" suffix badge (#F5F5F4, radius 4px, right inside input)
  "Stock disponible": number input "12"
  "Visible sur la boutique": toggle row (label left, toggle switch right) — ON state #2563EB

Danger zone (margin-top 24px, white card, 12px radius, border 1px #FEE2E2, 16px padding):
  "Supprimer ce produit" button (full width, 40px, white bg, border 1.5px #DC2626, radius 8px, text #DC2626 14px medium)
  Below: delete confirmation modal annotation — "Etes-vous sur ?" modal with "Supprimer" red + "Annuler" ghost

Sticky bottom bar (white, 80px, shadow 0 -1px 0 #E2E8F0):
  "Enregistrer" button (full width, 48px, #2563EB, radius 8px, white 16px semibold)
  Loading state: spinner inside button while saving

---

SCREEN 4 — Nouveau Produit — /dashboard/produits/nouveau

Same layout as Screen 3, all fields empty.
Top bar: back + "Nouveau produit"
Show validation state: name field with red border + "Ce champ est obligatoire" below in red 12px (when submit attempted without filling it)
Sticky CTA: "Publier le produit" (blue, full width, 48px)
Loading state: "Publication..." + spinner inside button

---

SCREEN 5 — Commandes (Orders List) — /dashboard/commandes

Top bar: "Commandes" (18px semibold)
Filter tabs (horizontal scroll, 44px tall, border-bottom 1px #E2E8F0):
  "Toutes" | "En attente" | "Confirmees" | "Expediees" | "Livrees" | "Annulees"
  Active: #2563EB text + 2px border-bottom #2563EB. Inactive: #78716C.

Order cards (16px padding, 8px gap, each white, 12px radius, shadow):
  Row 1 (flex, space-between): order number bold #1C1917 + customer (14px #78716C) | amount (14px semibold) + time "Il y a 1h" (12px #78716C)
  Row 2: status badge + payment badge (left) | (space)
  Full card tappable, links Screen 6.

6 orders shown with statuses: En attente, Confirmee, Expediee, Livree, Annulee, En attente.
Badge colors: En attente #F3F4F6/#6B7280 | Confirmee #EFF6FF/#2563EB | Expediee #FFF7ED/#E8632A | Livree #F0FDF4/#16A34A | Annulee #FEF2F2/#DC2626
Payment: COD #F3F4F6/#6B7280 | Terminal #EFF6FF/#2563EB | Carte #F3E8FF/#7C3AED

Empty state (per tab): "Aucune commande en attente" + subtext + illustration icon placeholder centered

---

SCREEN 6 — Order Detail — /dashboard/commandes/[id]

Top bar: back arrow (Screen 5) + "Commande #PLZ-042" (16px semibold)
Status banner (full width, 44px, border-radius 0): "En attente de confirmation" (#FFF7ED bg, #E8632A text, centered 14px medium)

Section "Client" (white card, 12px radius, shadow, 16px padding, margin 16px):
  Name row: user icon + "Fatima Zahra Benali" (14px semibold)
  Phone row: phone icon + "06 12 34 56 78" (14px, tappable tel: link, #2563EB)
  Address row: pin icon + "12 Rue Hassan II, Casablanca" (14px #78716C, multiline)

Section "Articles commandes" (same card style):
  Item rows (48px each): image 40x40px radius 6px + name 14px medium + "x1" + price "250 MAD" right
  Items: "Robe d'ete" x1 250 MAD, "Sac cuir" x2 300 MAD
  Divider. "Sous-total" + "550 MAD" (14px). "Livraison" + "29 MAD" #E8632A. Divider 2px. "Total" semibold 16px + "579 MAD" semibold 20px #1C1917.

Section "Paiement" (card): COD badge + "Paiement a la livraison"

Section "Statut de livraison" (card, 16px padding):
  Vertical timeline (4 steps, 32px between):
    Step 1 done: green circle + checkmark + "Commande recue" (14px) + timestamp gray
    Step 2 current: blue pulse ring + "En attente de confirmation" (14px semibold #2563EB)
    Step 3 future: gray circle + "Expediee" (14px #A8A29E)
    Step 4 future: gray circle + "Livree" (14px #A8A29E)

Action area (sticky, white, 80px, shadow):
  Status=pending: "Confirmer" (primary blue, 50% width, 48px) + "Annuler" (red outline, 50%)
  Status=confirmed: "Marquer comme expediee" (accent #E8632A, full width)
  Status=dispatched: "Marquer comme livree" (#16A34A, full width)
  Status=delivered or cancelled: read-only, no buttons

Cancel confirmation modal annotation: "Annuler cette commande ?" modal — "Oui, annuler" red + "Non" ghost.

---

SCREEN 7 — Finances — /dashboard/finances

Top bar: "Finances" (18px semibold)
Period selector (3 pills, gap 8px, centered, margin 16px 0):
  "Cette semaine" (active, #2563EB bg white text) | "Ce mois" | "Tout"

Revenue card (white, 12px radius, shadow, 20px padding):
  "Revenus totaux" (12px #78716C uppercase)
  "24 600 MAD" (28px semibold #1C1917, dir=ltr)
  "+18% vs le mois dernier" (14px #16A34A)
  Line chart area (full width, 160px height, #FAFAF9 bg, orange line #E8632A, smooth curve, X-axis days, Y-axis MAD)

Stats row (2 cards side by side, white, 12px radius, shadow, 16px padding, gap 8px):
  "Commandes" (12px #78716C) + "148" (24px semibold) + "+12%" (#16A34A, 12px pill)
  "Panier moyen" (12px #78716C) + "166 MAD" (24px semibold) + "+5%" (#16A34A)

Section "Repartition des paiements" (white card, 12px radius, shadow, 20px padding):
  Donut chart (160px, centered): COD 65% gray | Terminal 28% #2563EB | Carte 7% #7C3AED
  Legend below: 3 rows — color dot + label + percentage

Section "Meilleures ventes" (white card):
  3 product rows (48px each): rank number + image 40x40px + name + "24 vendus" + "8 400 MAD" right
  Each tappable, links Screen 3.

---

SCREEN 8 — Support Hub — /dashboard/support

DESKTOP LAYOUT (1280px):
Left panel (320px, white, border-right 1px #E2E8F0, full height):
  Header (64px, 24px padding): "Support Plaza" (18px semibold) + "Nouveau ticket" button (primary blue, 36px, full width minus padding)
  Divider.
  Ticket list (scrollable):
    3 tickets (each 72px, 16px padding, hover #F8FAFC):
      Title 14px semibold #1C1917 + status badge right
      Preview 12px #78716C truncated + time 12px #78716C right
    Ticket 1: "#PLZ-T001 — Commande non recue" | "En cours" blue | "Hier 09:14"
    Ticket 2: "#PLZ-T002 — Probleme de paiement" | "Resolu" green | "Hier"
    Ticket 3: "#PLZ-T003 — Bug sur la plateforme" | "En attente" gray | "Il y a 5j"
  Empty state: chat icon 48px gray + "Aucun ticket pour le moment"

Right panel (#FAFAF9, flex 1):
  Default: centered chat icon 80px + "Selectionnez un ticket ou creez-en un nouveau" (16px #78716C)

  Active (ticket #PLZ-T001 selected):
    Top bar (white, 64px, border-bottom): back + "Commande non recue" + "En cours" blue badge right
    Context card (white, 12px radius, shadow, 16px margin, 16px padding): "Commande liee: #PLZ-038" blue link + "Ouvert le: 5 avril 2026"
    Chat thread (scrollable, 16px padding, gap 12px):
      Date pill centered: "Aujourd'hui" (gray, 9999px radius)
      Plaza message (left): avatar 32px blue "P" + "Plaza Support" 12px + gray bubble 12px radius "Bonjour ! Nous avons recu votre demande..." + "09:14" 11px #A8A29E
      Merchant message (right): blue bubble #2563EB white text "Bonjour, le client dit qu'il n'a pas recu sa commande..." + "09:32" right
      Plaza message (left): gray bubble "Merci. Nous allons contacter le livreur et revenir dans 2h." + "09:45"
    Reply bar (white, 72px, border-top sticky): paperclip icon + text input "Ecrivez un message..." + send button 40px circle #2563EB arrow icon

MOBILE (375px): show ticket list as Screen 8a, ticket detail as Screen 8b (linked from ticket row).

---

SCREEN 9 — Nouveau Ticket (Drawer) — /dashboard/support/nouveau

Overlay: rgba(0,0,0,0.4) behind drawer. Drawer 480px wide, full height, white, shadow left.
Header (64px, border-bottom): "Nouveau ticket" 18px semibold + X close right.

Form (16px padding, scrollable):
  "Sujet" dropdown (full width, 44px, radius 8px, border 1px #E2E8F0):
    Options: "Probleme avec une commande" | "Probleme de paiement" | "Probleme technique" | "Autre"

  Conditional field (visible when "Probleme avec une commande" selected):
    Label "Numero de commande" + input "#PLZ-XXX" + helper "Vous trouverez ce numero dans la section Commandes" (12px #78716C)

  "Description" textarea (6 rows, border 1px #E2E8F0, radius 8px) + character count "0 / 500" (12px #78716C, bottom-right)

  Upload zone (dashed border 1px #E2E8F0, radius 8px, 120px height): upload icon + "Glissez une image ici ou cliquez" (14px #78716C)
  Filled state: "capture-commande.jpg" file chip (gray bg, 9999px radius, X to remove)

Footer (white, border-top, 72px): "Annuler" ghost + "Envoyer le ticket" primary blue

Success state (post-send, replaces form): green checkmark circle 64px + "Ticket envoye !" 20px semibold + "Notre equipe vous repondra dans les 24h." + "Voir mes tickets" outline button

---

SCREEN 10 — Plus Menu — /dashboard/plus

White card list (16px padding, 8px gap between items):
  Each item 56px: icon left (24x24px #78716C) + label (14px medium #1C1917) + chevron right (#A8A29E)
  "Mon compte" (user icon) — links Screen 11
  "Ma boutique" (store icon) — links Screen 12
  "Parametres" (gear icon) — links Screen 13
  "Aide & Support" (help icon) — links Screen 8
  "Deconnexion" (logout icon, text #DC2626) — shows confirm modal

---

SCREEN 11 — Mon Compte — /dashboard/compte

Top bar: back + "Mon compte"
Profile card (white, 12px radius, shadow, 24px padding, centered):
  Avatar 80px circle (#EFF6FF bg, #2563EB text "FA", 24px semibold)
  "Changer la photo" (14px #2563EB, margin-top 8px)
  "Fatima Amrani" (20px semibold #1C1917, margin-top 12px)
  "fatima@example.com" (14px #78716C)

Form card (white, 12px radius, shadow, 16px padding, margin-top 12px):
  "Nom complet" input filled "Fatima Amrani"
  "Email" input filled "fatima@example.com"
  "Telephone" input filled "06 12 34 56 78" dir=ltr
  "Changer le mot de passe" — row item with chevron (14px #2563EB)

Sticky bottom: "Enregistrer les modifications" (full width, 48px, #2563EB)

---

SCREEN 12 — Ma Boutique — /dashboard/boutique

Top bar: back + "Ma boutique"
Preview banner (white card, 12px radius, shadow, 16px padding, margin-bottom 16px):
  "Votre boutique" (12px #78716C uppercase) + "plaza.ma/fatima-store" (14px #2563EB underline) + "Voir la boutique" outline button (32px)

Form sections (white cards, 12px radius, shadow, 16px padding, 12px gap):
  Section "Identite":
    "Nom de la boutique": "Boutique Fatima"
    "Slug (URL)": "fatima-store" + preview below "plaza.ma/fatima-store" (12px #78716C)
    "Description": textarea "Boutique de mode feminine a Casablanca..."

  Section "Apparence":
    "Logo": upload zone dashed border 80x80px + camera icon
    "Couleur principale": 6 color swatches (40x40px each, 8px gap, 2px border on selected): #2563EB (selected), #E8632A, #16A34A, #7C3AED, #D97706, #EC4899. Custom swatch "+" after.

  Section "Livraison":
    "Zones desservies": city chips row — "Casablanca" chip (blue bg, X) + "Rabat" chip (blue bg, X) + "+ Ajouter" dashed chip
    "Frais de livraison": number input "29" + "MAD" suffix

Sticky bottom: "Enregistrer" (full width, 48px, #2563EB)

---

SCREEN 13 — Parametres — /dashboard/parametres

Top bar: back + "Parametres"
Sections (white cards, 12px radius, shadow, 16px padding, 16px gap between sections):

  "Notifications" (16px semibold #1C1917, margin-bottom 8px):
    Toggle rows (each 48px, flex space-between): label 14px #1C1917 + toggle switch
    "Nouvelles commandes" — ON (#2563EB)
    "Commandes livrees" — ON
    "Messages support" — ON
    "Promotions Plaza" — OFF (gray)

  "Langue":
    "Francais" row (48px): flag emoji + label + blue checkmark right (selected)
    "Arabe (العربية)" row (48px): flag + label + empty circle

  "Securite":
    "Changer le mot de passe" — row with chevron
    "Authentification a 2 facteurs" — row with toggle OFF

  "Danger" (border 1px #FEE2E2, radius 12px):
    "Supprimer mon compte" (48px, text #DC2626 14px, chevron)
    Delete modal annotation: type "SUPPRIMER" confirm field + red destructive button

---

NAVIGATION CONNECTIONS — ALL MUST BE LIVE LINKS:

Bottom tab bar (all screens): Accueil→S1 | Produits→S2 | Commandes→S5 | Finances→S7 | Plus→S10
S1 avatar→S11 | S1 recent order cards→S6 | S1 "En attente" card→S5 (filtered)
S2 product cards→S3 | S2 "Ajouter"→S4
S5 order cards→S6
S10 "Mon compte"→S11 | S10 "Ma boutique"→S12 | S10 "Parametres"→S13 | S10 "Aide"→S8
S8 ticket rows→active ticket view | S8 "Nouveau ticket"→S9 (drawer)
All back arrows→previous screen

INTERACTIVE STATES:
- All form inputs tappable (show focused state: blue border #2563EB)
- All toggles show ON/OFF states
- All status badges use correct colors
- All buttons show pressed state (slightly darker bg)
- Confirmation modals shown as annotations for delete/cancel actions
- Loading states: spinner inside CTA buttons while async actions complete
- Toast success: green bar top of screen "Produit enregistre !" after save

Language: French throughout. Realistic Moroccan data — names, cities, products, amounts in MAD.