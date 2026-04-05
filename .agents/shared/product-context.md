# Plaza Platform — product context

---

## What it is

Plaza is an all-in-one commerce platform for solo entrepreneurs and small online merchants in Morocco and North Africa. It lets merchants create their online store, manage orders, collect payments, and dispatch deliveries — all from a single dashboard.

Plaza replaces the fragmented workflow of selling via WhatsApp DMs, managing payments manually, and coordinating with couriers by phone. It is the operating system for Morocco's informal and semi-formal e-commerce economy.

---

## The problem we solve

Solo merchants in Morocco today sell through Instagram and WhatsApp. They have no structured storefront, no payment infrastructure, no delivery tracking, and no visibility into their business performance. Every order is a manual conversation. Every delivery is a phone call. There is no data, no automation, and no way to scale.

Plaza consolidates all of this into one simple tool they can set up in minutes.

---

## Ideal customer profile (ICP)

- **Who:** Solo entrepreneurs and side-hustle merchants selling physical goods online
- **Where:** Morocco first, then broader North Africa
- **Vertical:** General retail — fashion, accessories, beauty, home goods, mixed
- **Current tools:** WhatsApp, Instagram DMs, phone calls, no structured system
- **Pain points:** Lost orders in DMs, no payment tracking, delivery coordination chaos, zero business visibility
- **Technical comfort:** Low to moderate — must be extremely simple to onboard and use
- **Language:** French and Arabic (bilingual product from day 1)

---

## What Plaza offers

### 1. Store builder (free — the acquisition hook)
- Merchants create a branded online storefront in minutes
- Product catalog, photos, descriptions, pricing
- Shareable link they can post on Instagram/WhatsApp bio
- No technical skills required

### 2. Payments (monetized — 5% transaction fee)
- Card payment via terminal or Stripe integration
- Plaza processes and reconciles payments on behalf of the merchant
- Merchant receives payouts with clear breakdown

### 3. Delivery dispatch (monetized — flat fee per delivery)
- **29 MAD** for same-city delivery
- **39 MAD** for inter-city delivery
- Plaza manages a fleet of delivery people
- Merchant books a delivery from the dashboard; Plaza dispatches

### 4. Consolidated dashboard
- Orders, revenue, delivery status — all in one view
- Key business metrics: GMV, order volume, conversion, top products
- Support channel integration (WhatsApp / in-app)

---

## Business model

| Revenue stream | Model | Rate |
|---|---|---|
| Payment processing | Transaction fee | 5% of order value |
| Same-city delivery | Flat fee per order | 29 MAD |
| Inter-city delivery | Flat fee per order | 39 MAD |
| Store builder | Free | — |

The store is free to maximize merchant adoption. Revenue is earned on every transaction and delivery — aligned with merchant success (we only earn when they sell and ship).

---

## Competitive landscape

| Competitor | Why merchants don't use it |
|---|---|
| Shopify / WooCommerce | Too complex, English-first, no local payment/delivery |
| Youcan / Zid | Closer, but still subscription-gated, no integrated delivery fleet |
| Instagram + courier | Zero structure, no data, no payment, manual everything |

**Plaza's moat:** The combination of store + payments + owned delivery fleet + dashboard in one product, built specifically for the Moroccan market, in French and Arabic, priced for solo merchants.

---

## North star metric

**50 active merchants live on the platform within 6 months of launch**

"Active" = merchant has a published store AND has processed at least one paid order.

### Key leading indicators
- Merchant signups per week
- Store publish rate (signed up → store live)
- Activation rate (store live → first order processed)
- Orders per active merchant per week
- GMV (total transaction volume)
- Delivery completion rate (dispatched → delivered successfully)

---

## Current stage

**Idea — product not yet built.** No code in production. Building from scratch.

Immediate priority: reach MVP that allows a merchant to sign up, create a store, share a link, accept a payment, and book a delivery.

---

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend / DB:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Payments:** Stripe (international cards) + local payment terminal integration (TBD)
- **Infra:** Vercel (hosting), GitHub Actions (CI/CD)
- **Analytics:** PostHog (product analytics)
- **Design:** Figma (design system and component library)
- **Project management:** Notion

---

## Brand & tone

**Personality:** Warm, approachable, and empowering — built for Moroccan hustlers.

Plaza should feel like it was made specifically for them, not adapted from a Western SaaS tool. Confidence-inspiring without being corporate. Modern without being cold.

**References:** Wave (Africa-native fintech warmth), Paystack (trust + clarity), with a Moroccan visual and cultural sensibility.

**Voice principles:**
- Speak like a smart, supportive friend — not a bank or a tech company
- Use simple language — no jargon, no complexity
- Celebrate the merchant's success ("Your store is live 🎉", "First order received!")
- Bilingual: French and Arabic with equal quality — no second-class language

**Visual direction:**
- Warm color palette (earthy tones, not cold blues)
- Clean layouts with breathing room
- Illustrations or iconography that reflect local context
- Mobile-first: most merchants will use Plaza on their phone

---

## MVP scope (phase 1)

The smallest version of Plaza that delivers real value:

1. Merchant signup + onboarding (name, store name, product upload)
2. Shareable storefront link (public-facing store page)
3. Order management (customer places order → merchant sees it in dashboard)
4. Payment processing (Stripe card payment on checkout)
5. Delivery booking (merchant clicks "dispatch" → delivery request created)
6. Basic dashboard (orders today, revenue today, pending deliveries)

Everything else (analytics depth, support channels, multi-city fleet, marketing tools) is phase 2+.

---

## What we are NOT building (yet)

- Multi-vendor marketplace
- Merchant mobile app (web-first, mobile-responsive)
- Inventory management system
- Loyalty or referral programs
- Advertising or promoted listings
- Customer-facing accounts or profiles
