Figma Make Prompt — Storefront — Customer
  (paste this into Notion, then founder runs it in Figma Make)

  ---
  Design a fully clickable mobile-first Figma prototype for Plaza's customer-facing storefront. Use Inter as
  the font throughout. The primary color is #2563EB (blue), success #16A34A (green), warning #D97706 (amber),
  danger #DC2626 (red), orange accent #E8632A for discount badges, background #FAFAF9, surface #FFFFFF, border
   #E2E8F0, text primary #1C1917, text secondary #78716C, text muted #A8A29E. Apply 12px border radius to
  cards, 8px to buttons, 16px to bottom sheets. The primary frame is 375px wide (mobile). Create desktop
  variants at 1280px wide for Screen 1 and Screen 3 only.

  Create Screen 1 as the Store Home at path /store/[slug]. Place a sticky header 56px tall with a white
  background and a bottom border. In the header, show a 48px circular store logo on the left, next to the
  store name "Zara Maroc" in 18px bold and a "Mode" category chip. On the right, show a cart icon with a badge
   showing "3". Below the store name in the header, add a subtitle "Livraison 30 MAD · Casablanca" in 12px
  muted text. Below the header, render a full-width 200px store banner image with a gradient overlay showing
  the store name and category chip. Below the banner, place a 40px rounded search bar with placeholder
  "Rechercher dans la boutique..." (display only, not interactive). Add a horizontal scrolling row of 36px
  filter chips: "Tous" selected in blue, then "Robes", "Hauts", "Pantalons", "Accessoires". Below the chips,
  render a 2-column product grid with 12px gaps showing 6 products. Product 1: "Robe Caftan Brodée", 450 MAD,
  original price 600 MAD with strikethrough, orange -25% badge. Product 2: "Djellaba Femme Soie", 380 MAD.
  Product 3: "Sac Cuir Artisanal", 290 MAD, original 350 MAD with strikethrough, orange -17% badge. Product 4:
   "Sandales Traditionnelles", 0 stock — show a red "Rupture de stock" badge, gray out the card, and disable
  the "Ajouter" button. Product 5: "Ceinture Tissée", 120 MAD. Product 6: "Foulard Soie", 180 MAD. Each card
  contains a square rounded image, product name capped at 2 lines, bold price, discount display when
  applicable, and a blue 32px "Ajouter" button. For the 1280px desktop variant, use 4 columns and add a sticky
   left sidebar with store info and cart summary.

  Create Screen 2 as the Store Info bottom sheet, 80% screen height, with a drag handle at the top and 16px
  border radius on the top corners. Show a 64px circular store logo, "Zara Maroc" store name, and "Mode &
  Vêtements" category. Below, add a description: "Boutique de mode et vêtements traditionnels et modernes.
  Livraison rapide à Casablanca." Add a Horaires section listing "Lun–Sam 9h–20h" and "Dim 10h–18h", with
  today — Vendredi — highlighted in blue. Add a Location section with a 200px Mapbox-style static map preview
  showing a pin marker, and the label "Casablanca — Maarif, Rue Ibnou Rochd". Add a Delivery section with a
  blue info pill: "Livraison 30 MAD · Gratuite dès 500 MAD d'achat". At the bottom, place a full-width
  outlined blue CTA button with a phone icon labeled "Appeler la boutique".

  Create Screen 3 as the Product Detail at /store/[slug]/produit/[id] for "Robe Caftan Brodée". Show a
  full-width 280px product image with a back arrow at top left and a cart icon with badge "3" at top right.
  Below the image, show 3 dot indicators with the first active. In a 16px padded content section, show a
  breadcrumb "Mode › Robes › Caftans" in 12px muted text. Show the product name "Robe Caftan Brodée" in 20px
  bold. On the price row, show "450 MAD" in 24px bold blue, "600 MAD" in 14px strikethrough muted, and an
  orange -25% badge. Show "Plus que 3 en stock" in 13px amber warning text. Show a collapsible description:
  "Magnifique caftan brodé à la main, tissu de qualité supérieure. Taille unique ajustable. Disponible en
  rouge bordeaux." with a "Voir plus" link if truncated. Add a quantity selector row with bordered [−] [1] [+]
   buttons, each 40px. Affix a sticky bottom bar with a full-width 56px blue CTA "Ajouter au panier — 450
  MAD". For the 1280px desktop variant, use a 2-column layout with image on the left and details on the right,
   with a sticky add-to-cart panel.

  Create Screen 4 as the Cart, rendered as a bottom sheet with rounded top corners, 90% screen height, and a
  drag handle. The header shows "Mon panier" in 18px bold, "3 articles", and an X close button. List 3 items:
  "Robe Caftan Brodée" qty 1 at 450 MAD, "Ceinture Tissée" qty 2 at 240 MAD (2×120), "Foulard Soie" qty 1 at
  180 MAD. Each row shows a 56px thumbnail, product name, −/+ quantity controls, price, and a trash icon.
  Below a divider, show a summary: Sous-total 870 MAD, Livraison "Gratuit" in green (threshold met), Total 870
   MAD in 20px bold, and a green checkmark note "Livraison gratuite atteinte !". Place a full-width 56px blue
  CTA "Passer la commande" and a centered text link "Continuer mes achats".

  Create Screen 5 as Checkout at /store/[slug]/commande. Show a back arrow and title "Votre commande". In a
  white card labeled "Vos coordonnées", pre-fill fields: Prénom "Fatima", Nom "El Amrani", Téléphone
  "0661234567", Adresse "12 Rue Al Massira, Appt 4, Quartier Maarif", Ville dropdown set to "Casablanca"
  (options: Casablanca, Rabat, Marrakech, Agadir, Fès, Tanger), and an optional Note livreur field with gray
  placeholder "Sonner 3 fois". In a second white card labeled "Mode de paiement", show two options: "Paiement
  à la livraison" with a cash icon (selected, blue border and blue radio) and "Carte à la livraison" with a
  card icon. In a third white card "Résumé de commande", show the 3 items compact, Sous-total 870 MAD,
  Livraison Gratuit, Total 870 MAD bold. Place a full-width 56px active blue CTA "Confirmer la commande". Add
  a loading state variant showing a spinner and "Envoi en cours…".

  Create Screen 6 as the Order Confirmation at /store/[slug]/confirmation. Use a centered layout with a 100px
  green top section. Show a 64px green circle with a checkmark (animated pulse). Show "Commande confirmée !"
  in 24px bold, "#PLZ-042" in 16px muted, and the message "Nous vous contacterons dans les 30 minutes pour
  confirmer la livraison." in 14px centered gray. Add a blue pill "Livraison estimée : aujourd'hui 15h–17h" in
   13px. Show a compact order summary card listing 3 items, Total 870 MAD, Livraison Gratuite, and "12 Rue Al
  Massira, Maarif, Casablanca". Add a full-width green outlined button with a WhatsApp icon "Partager ma
  commande" and a centered muted link "Retour à la boutique Zara Maroc".

  Create Screen 7 as the Order Status at /store/[slug]/commande/[id]. Show the header "Commande #PLZ-042" and
  "Zara Maroc". Render a vertical 4-step status timeline: step 1 "Commande reçue" with a green checkmark at
  09h14, step 2 "En cours de confirmation" with a blue pulsing dot as the current step at 09h15, step 3 "En
  livraison" grayed out, step 4 "Livrée" grayed out. Show a customer summary card: "Fatima El Amrani ·
  0661234567" and "12 Rue Al Massira, Maarif, Casablanca". Show an order card with 3 items, 870 MAD, Livraison
   Gratuite. Add an outlined blue CTA "Contacter la boutique" with a phone icon, and a small muted link
  "Besoin d'aide ? Contacter Plaza".

  Create Screen 8 as the 404 Store Not Found screen. Use a centered layout with a simple SVG-style sad-face or
   empty-shop illustration. Show the message "Cette boutique n'existe pas ou n'est plus disponible." in 16px
  centered text. Add a full-width blue button "Découvrir Plaza". At the bottom, show the Plaza logo and
  tagline "La boutique de demain".

  Wire all prototype interactions as follows: tapping any in-stock product card on Screen 1 navigates to
  Screen 3; tapping the cart icon on Screen 1 opens Screen 4 as a bottom sheet overlay; tapping a "Voir les
  infos" trigger on Screen 1 opens Screen 2 as a bottom sheet overlay; tapping "Ajouter au panier" on Screen 3
   opens Screen 4 with the cart count incremented by 1; tapping "Passer la commande" on Screen 4 navigates to
  Screen 5; tapping "Confirmer la commande" on Screen 5 triggers the loading state variant then navigates to
  Screen 6; tapping "Partager ma commande" on Screen 6 triggers a mock WhatsApp action; tapping "Retour à la
  boutique Zara Maroc" on Screen 6 navigates back to Screen 1; the timeline on Screen 7 is static with no
  interactions; all back arrows navigate to the immediately preceding screen.