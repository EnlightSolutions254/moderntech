# Project Blueprint: Laptop Parts & Accessories E-Commerce (Kenya)
### Static Site | WhatsApp-First Conversion Model

---

## 1. Brand Positioning

**Category:** Laptop spare parts, repair components, and accessories retailer, Kenya-based.

**Positioning statement:**
"The fastest, most trusted source for genuine laptop parts in Kenya — built for technicians who need it right, and for owners who just want it fixed."

**Brand pillars:**
- **Technical credibility** — model-number accuracy, compatibility data, and specs presented like a parts catalog, not a generic shop. This is what wins trust with repair technicians (the highest-value, highest-repeat-order segment).
- **Speed to order** — every product page assumes the visitor already knows what they want and is trying to get to WhatsApp in under 15 seconds.
- **Local trust signals** — Kenyan shillings pricing, Nairobi/major-town delivery language, M-Pesa mention, local phone number, physical shop/location if applicable.
- **Accessibility for non-technical buyers** — students and individual owners don't know part numbers; the site must translate "my laptop won't charge" into "here's your charger."

**Brand voice:** Direct, competent, no fluff. Speaks like a technician, not a marketer. Confidence over hype ("Compatible with HP EliteBook 840 G3–G4" beats "Amazing deal!!").

**Differentiation angle vs. informal sellers (Jiji, WhatsApp-only sellers, physical shops in River Road/Luthuli):**
- Structured search/filter by brand + model (informal sellers can't offer this)
- Visible stock status and specs before contacting anyone
- Consistent pricing (vs. haggling) — builds trust with business/bulk buyers
- SEO presence so people searching "HP 840 G3 battery Nairobi" find you organically instead of asking around

---

## 2. Website Goals

**Primary goal:** Drive qualified WhatsApp inquiries/orders — not on-site checkout.

**Secondary goals:**
1. Rank organically for high-intent, model-specific searches ("Dell Latitude 5490 keyboard Kenya," "laptop screen replacement Nairobi").
2. Reduce repetitive pre-sale questions by front-loading compatibility, price, and stock info (fewer "is this available?" chats, more "I want this, confirming address" chats).
3. Build repeat-business infrastructure for technicians (easy re-ordering, part lookup by model).
4. Establish credibility/trust for first-time individual buyers who've never bought parts online.
5. Capture browsing-stage traffic (students Googling symptoms: "laptop hinge broken fix cost Kenya") and convert it into named-part awareness → WhatsApp.

**Non-goals (explicitly out of scope for v1):**
- On-site payment/checkout
- User accounts/login
- Real-time inventory sync (manual stock flags instead)

---

## 3. Site Architecture

```
Home
├── Shop
│   ├── Laptop Batteries
│   ├── Chargers & Power Adapters
│   ├── Laptop Screens
│   ├── Keyboards
│   ├── Hinges
│   ├── Cooling Fans
│   └── Casings & Body Parts
├── Shop by Brand
│   ├── HP
│   ├── Dell
│   ├── Lenovo
│   ├── Toshiba
│   ├── Acer
│   ├── Asus
│   └── MacBook
├── Product Detail Pages (PDPs) — one per part/model
├── Find My Part (guided lookup tool)
├── For Technicians (bulk/trade page)
├── Repair Help / Blog (SEO + symptom-to-part content)
├── About Us (trust page: who we are, sourcing, warranty)
├── Contact / Location
└── FAQ (shipping, warranty, part compatibility, payment)
```

**Two parallel taxonomies (critical for this niche):**
- **By part type** (how technicians shop — they know exactly what component they need)
- **By brand/model** (how individual owners and students shop — they know their laptop brand, not the part SKU)

Both must lead to the same PDPs. This dual-path structure is the backbone of the whole IA.

---

## 4. Page Hierarchy

**Tier 1 — Entry points (SEO + direct traffic)**
- Home
- Category pages (7, one per part type)
- Brand pages (7+, one per major brand)

**Tier 2 — Conversion pages**
- Product Detail Pages (highest priority — this is where WhatsApp orders happen)
- Find My Part tool

**Tier 3 — Trust & support**
- About Us
- FAQ
- Warranty/Returns policy
- Contact

**Tier 4 — Content/SEO acquisition**
- Repair Help articles ("Signs your laptop battery needs replacing," "How to know if it's the hinge or the screen")
- Technician trade/bulk page

**URL structure (flat, keyword-rich):**
```
/shop/laptop-batteries/
/shop/laptop-batteries/hp-elitebook-840-g3-g4/
/shop/keyboards/dell-latitude-5490/
/brand/hp/
/repair-help/laptop-wont-charge-causes/
```

---

## 5. Design System

**Design philosophy:** Utilitarian-trustworthy — closer to a well-run spare-parts catalog than a lifestyle e-commerce brand. Think "the visual clarity of a hardware store, the polish of a modern SaaS product."

**Core principles:**
- **Scan-first layout** — technicians and repeat buyers skim; specs and compatibility must be scannable in under 3 seconds, not buried in paragraphs.
- **Price and stock status always visible**, never hidden behind a click.
- **One primary action per screen**: the WhatsApp CTA. Every other element is secondary.
- **Trust-dense product pages**: compatibility list, condition (new/refurbished/OEM), warranty period, and specs all above or near the fold.
- **Consistent card system** across categories, brands, and search/filter results — one component reused everywhere, not a redesign per page type.

**Grid system:** 12-column responsive grid, 8px baseline spacing scale (8/16/24/32/48/64) for predictable rhythm across cards, sections, and forms.

**Elevation/depth:** Minimal — flat design with light shadows only on interactive cards and the sticky WhatsApp CTA, to keep the "catalog" feel rather than a heavy consumer-retail look.

---

## 6. Color System

Positioning: trustworthy, technical, Kenyan-market-relevant (WhatsApp green as a functional accent, not a decorative one).

| Role | Color | Usage |
|---|---|---|
| **Primary (Brand)** | Deep Navy / Charcoal Blue `#0F2540` | Header, nav, headings — signals technical authority |
| **Secondary** | Steel Grey `#5A6B7B` | Body text, secondary UI |
| **Accent / Conversion** | WhatsApp Green `#25D366` | Reserved *exclusively* for WhatsApp CTAs — never used decoratively, so it stays a strong action signal |
| **Highlight/Alert** | Amber `#F5A623` | "Low stock," "Limited units," urgency flags |
| **Success/In Stock** | Green `#2E9E5B` (distinct from WhatsApp green to avoid CTA confusion) | Stock indicators |
| **Error/Out of Stock** | Red `#D64545` | Out-of-stock states, form errors |
| **Background (base)** | Off-white `#F7F8FA` | Page background |
| **Surface (cards)** | White `#FFFFFF` | Product cards, panels |
| **Border/Divider** | Light Grey `#E3E6EA` | Card borders, dividers |

**Rule:** WhatsApp green is a *reserved conversion color* — it must never appear anywhere except WhatsApp CTAs, so users develop an instant visual association between "green button" and "order now."

---

## 7. Typography System

**Goals:** High legibility for spec-heavy content, works well in Swahili/English mixed contexts, strong on low-end Android screens (majority of Kenyan mobile traffic).

| Use | Typeface | Notes |
|---|---|---|
| Headings | **Inter** (or Space Grotesk for a more technical feel) | Bold, clean, excellent screen rendering |
| Body/UI | **Inter** | Single-family system reduces load weight — important for 3G/4G Kenyan mobile users |
| Monospace accents (SKUs, model numbers) | **JetBrains Mono** or `system-mono` | Used specifically for part numbers/model codes so they're visually distinct and scannable, e.g. `HP-BT-840G3` |

**Type scale (mobile-first, rem-based):**
```
H1 — 28px / 1.2   (Category/PDP titles)
H2 — 22px / 1.3   (Section headers)
H3 — 18px / 1.4   (Card titles)
Body — 16px / 1.5 (never smaller than 16px — avoids mobile zoom-in behavior)
Small/meta — 13px / 1.4 (stock status, SKUs, timestamps)
```

**Weight usage:** 700 for prices and CTAs, 600 for headings, 400 for body — avoid more than 3 weights to keep font payload light.

---

## 8. Component Inventory

**Navigation**
- Sticky header (logo, search, WhatsApp quick-contact icon, hamburger on mobile)
- Mega-menu / accordion nav (Shop by Part | Shop by Brand)
- Breadcrumbs (critical for SEO + orientation: Home > Batteries > HP > 840 G3)

**Discovery**
- Product card (image, name, model compatibility tags, price, stock badge, "Order via WhatsApp" button)
- Filter sidebar/drawer (Brand, Part Type, Price Range, Availability)
- Search bar with autosuggest (model numbers, part types)
- "Find My Part" guided selector (Brand → Model → Part Type wizard)

**Product Detail Page components**
- Image gallery (multiple angles, zoom)
- Compatibility table (explicit list of supported models)
- Spec sheet (voltage, cell count, port type, size, etc. depending on category)
- Condition/warranty badge
- Price block
- Primary CTA: "Order on WhatsApp" (pre-filled message with product name)
- Secondary CTA: "Call to confirm"
- Stock status indicator
- Related/compatible parts carousel ("Customers who bought this also need...")

**Trust components**
- Warranty badge strip
- "Why buy from us" trust bar (genuine parts, tested before dispatch, delivery countrywide)
- Customer testimonials/reviews (text-based, can be simple at launch)
- Delivery info strip (Nairobi same-day, upcountry courier)

**Conversion components**
- Sticky mobile WhatsApp bar (persistent bottom bar on all pages)
- Floating WhatsApp button (desktop, bottom-right)
- Pre-filled WhatsApp message templates (auto-populates product name + SKU so the customer doesn't have to type)
- "Bulk order? Chat with us" component (technician-targeted)

**Content components**
- Repair-help article template (symptom → cause → part → CTA)
- FAQ accordion
- Brand logo strip

**Forms**
- Minimal contact form (fallback for non-WhatsApp users)
- Newsletter/updates opt-in (optional, low priority)

---

## 9. SEO Strategy

**Core opportunity:** This niche has strong long-tail, high-intent, low-competition search demand in Kenya — "[brand] [model] [part] Kenya" and "[brand] [model] [part] price Nairobi" searches convert extremely well because searchers already know exactly what's broken.

**Keyword tiers:**
1. **Transactional long-tail (highest priority):** "HP EliteBook 840 G3 battery Nairobi," "Dell Latitude keyboard replacement Kenya," "MacBook Pro screen price Kenya"
2. **Category-level:** "laptop batteries Kenya," "laptop chargers Nairobi shop"
3. **Informational/top-of-funnel:** "why is my laptop battery draining fast," "signs of a failing laptop hinge," "laptop screen flickering causes" — these feed the Repair Help section and funnel into part pages via internal links
4. **Local intent:** "laptop parts shop Nairobi," "laptop repair parts near me," "genuine laptop battery Kenya"

**On-page SEO:**
- Unique title tag + meta description per PDP, structured as `[Part] for [Brand] [Model] | Price in Kenya`
- H1 = exact match to primary keyword ("HP EliteBook 840 G3/G4 Replacement Battery")
- Structured data (Schema.org): `Product`, `Offer` (price, currency KES, availability), `BreadcrumbList`, `FAQPage` on relevant pages, `LocalBusiness` sitewide
- Compatibility tables as crawlable text (not images) — this is a major differentiator since competitors often bury this in photos
- Alt text on all product images including model numbers

**Technical SEO (static site advantages to exploit):**
- Fast load times (critical — target sub-2s on 3G) — static generation is a major asset here
- Clean flat URL structure (see Section 4)
- XML sitemap auto-generated, submitted to Google Search Console
- Mobile-first indexing compliance (given mobile-dominant Kenyan traffic)
- Canonical tags on any duplicate-feeling pages (same part listed under multiple brand-model pages)

**Content/authority strategy:**
- Repair Help blog targets informational queries, each article links to 2–4 relevant category/PDP pages
- Build model-specific landing pages even for lower-traffic queries — this niche rewards long-tail depth over broad pages
- Local SEO: Google Business Profile, NAP consistency (Name/Address/Phone), location schema, "areas we deliver to" page

**Link building:** Partnerships with laptop repair training institutions/technicians, Kenyan tech forums, and directory listings (Kenyan business directories).

---

## 10. Folder Structure

```
project-root/
│
├── src/
│   ├── pages/
│   │   ├── index.html                     (Home)
│   │   ├── shop/
│   │   │   ├── batteries/
│   │   │   │   ├── index.html             (category page)
│   │   │   │   └── [model-slug].html      (PDPs)
│   │   │   ├── chargers/
│   │   │   ├── screens/
│   │   │   ├── keyboards/
│   │   │   ├── hinges/
│   │   │   ├── cooling-fans/
│   │   │   └── casings/
│   │   ├── brand/
│   │   │   ├── hp.html
│   │   │   ├── dell.html
│   │   │   ├── lenovo.html
│   │   │   └── ...
│   │   ├── find-my-part.html
│   │   ├── technicians.html
│   │   ├── repair-help/
│   │   │   ├── index.html
│   │   │   └── [article-slug].html
│   │   ├── about.html
│   │   ├── faq.html
│   │   └── contact.html
│   │
│   ├── components/
│   │   ├── nav/
│   │   ├── product-card/
│   │   ├── pdp/
│   │   ├── whatsapp-cta/
│   │   ├── filters/
│   │   └── shared/
│   │
│   ├── data/
│   │   ├── products.json
│   │   ├── brands.json
│   │   ├── categories.json
│   │   └── compatibility-map.json
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── products/
│   │   │   └── brand-logos/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── styles/
│   │   ├── tokens.css        (colors, type scale, spacing)
│   │   ├── base.css
│   │   ├── components.css
│   │   └── utilities.css
│   │
│   └── scripts/
│       ├── whatsapp-message-builder.js
│       ├── filter-search.js
│       └── find-my-part.js
│
├── seo/
│   ├── sitemap.xml
│   ├── robots.txt
│   └── schema-templates/
│
└── docs/
    └── blueprint.md   (this document)
```

---

## 11. Product Data Structure

Central `products.json` (or per-category JSON files) as the single source of truth, referenced by category, brand, and search components alike.

```json
{
  "id": "batt-hp-840g3g4",
  "sku": "HP-BT-840G3",
  "name": "Replacement Battery for HP EliteBook 840 G3/G4",
  "category": "laptop-batteries",
  "brand": "HP",
  "compatible_models": [
    "HP EliteBook 840 G3",
    "HP EliteBook 840 G4",
    "HP EliteBook 850 G3"
  ],
  "condition": "New OEM-equivalent",
  "specs": {
    "voltage": "11.4V",
    "capacity": "4200mAh",
    "cells": 3,
    "connector_type": "Proprietary HP"
  },
  "price_kes": 4500,
  "stock_status": "in_stock",
  "stock_note": "3 units available",
  "warranty_months": 6,
  "images": [
    "battery-hp-840g3-1.jpg",
    "battery-hp-840g3-2.jpg"
  ],
  "whatsapp_message_template": "Hi, I'd like to order: Replacement Battery for HP EliteBook 840 G3/G4 (SKU: HP-BT-840G3) — KES 4,500",
  "related_parts": ["charger-hp-65w", "casing-hp-840g3"],
  "seo": {
    "title": "HP EliteBook 840 G3/G4 Battery | Price in Kenya",
    "meta_description": "Genuine replacement battery for HP EliteBook 840 G3/G4. 6-month warranty. Order via WhatsApp, delivery countrywide.",
    "slug": "hp-elitebook-840-g3-g4-battery"
  }
}
```

**Why this structure matters:**
- `compatible_models` array is what powers the dual taxonomy (part-type AND brand/model browsing) from one record
- `whatsapp_message_template` is pre-built per product so the CTA always sends a clean, pre-filled order message — reduces friction and typos
- `related_parts` powers cross-sell (a battery buyer often also needs a charger)
- `seo` block keeps metadata co-located with product data so nothing gets forgotten at scale

---

## 12. Internal Linking Strategy

**Goal:** Every page should be reachable within 3 clicks from Home, and link equity should concentrate on PDPs and category pages (the pages that convert).

**Linking rules:**
1. **Category ↔ Brand cross-linking:** Every PDP links to both its category page and its brand page (dual taxonomy reinforced in the UI, not just the URL structure).
2. **Repair Help → PDP:** Every blog article must link to at least 2–3 specific PDPs or category pages relevant to the symptom discussed (e.g., "laptop won't charge" article links to Chargers category + specific charger PDPs).
3. **PDP → Related Parts:** Cross-sell carousel links to compatible/complementary parts (battery → charger → casing for the same model).
4. **Brand pages → all PDPs under that brand**, grouped by part type.
5. **Footer sitewide links:** All 7 categories + top brand pages, present on every page for crawlability and quick navigation.
6. **Breadcrumbs on every page** below Home level — reinforces hierarchy for both users and search engines.
7. **"Find My Part" tool** links out to PDPs as its end-state, acting as an internal funneling mechanism for undecided visitors.
8. **Technician page → bulk-relevant categories** (batteries, screens, keyboards — the highest-volume repair parts).

**Anchor text discipline:** Use descriptive, keyword-relevant anchor text ("HP 840 G3 battery" not "click here") throughout for SEO benefit.

---

## 13. Mobile-First UX Strategy

Kenyan e-commerce traffic is overwhelmingly mobile (majority Android, mixed network quality). This dictates nearly every UX decision.

**Core mobile principles:**
- **Design at 375px width first**, scale up — not the reverse.
- **Sticky bottom WhatsApp bar** on every page (persistent, thumb-reachable, always visible without scrolling back up).
- **Tap targets ≥44px**, generous spacing — avoid mis-taps on dense spec tables.
- **Collapsed filters/nav by default** (drawer/accordion pattern) to preserve vertical space for product content.
- **Image optimization is non-negotiable:** lazy-loaded, compressed, WebP with fallback — data costs matter to this audience, and slow images kill conversion.
- **Minimal typed input:** favor tap-to-select (Brand → Model → Part dropdowns in Find My Part) over free text search, since typing on mobile is friction, especially for less tech-savvy users (students, individual owners).
- **One-thumb navigation:** primary actions (WhatsApp CTA, filters, search) positioned within natural thumb reach zone (bottom half of screen).
- **Offline-tolerant loading states:** skeleton loaders and graceful degradation for users on patchy 3G/4G — never a blank white screen.
- **Click-to-call as a secondary CTA** alongside WhatsApp, for users who prefer voice confirmation (common with older/less tech-savvy buyers and even some technicians confirming bulk orders).
- **Progressive disclosure on PDPs:** critical info (price, stock, primary CTA) above the fold; specs/compatibility table expandable below, not overwhelming the initial view.

**Desktop as enhancement, not the design target:** desktop layout expands the mobile-proven structure into more columns/whitespace — it isn't independently designed from scratch.

---

## 14. Conversion Optimization Strategy

**Core conversion philosophy:** Remove every unnecessary step between "user found the right part" and "message sent on WhatsApp."

**Tactics:**

1. **Pre-filled WhatsApp messages.** Every "Order on WhatsApp" button opens WhatsApp with a message template already populated with product name, SKU, and price — the buyer just hits send. This alone significantly reduces drop-off compared to a generic "Contact us" link.

2. **Persistent, unmissable CTA.** Sticky WhatsApp bar (mobile) and floating button (desktop) ensure the action is always one tap away, regardless of scroll position.

3. **Trust signals placed at the decision point**, not just on an About page: warranty badge, "genuine part" indicator, and stock count directly next to the price on every PDP.

4. **Urgency without being pushy:** honest low-stock indicators ("Only 2 left") where genuinely true — builds urgency for indecisive buyers without resorting to fake countdown timers.

5. **Reduce pre-purchase anxiety for non-technical buyers:** plain-language compatibility checker ("Not sure if this fits your laptop? Tell us your model on WhatsApp and we'll confirm") — critical for students/individual owners who don't know part numbers.

6. **Technician-specific conversion path:** dedicated bulk/trade page with a distinct WhatsApp CTA ("Chat about bulk pricing") — this segment has different needs (volume pricing, credit terms, repeat ordering) and shouldn't be funneled through the same flow as a one-time individual buyer.

7. **Social proof:** simple text-based testimonials near CTAs on category and PDP pages ("Technician in Nairobi CBD, ordered 3 times") — especially valuable for first-time buyers wary of online part-buying.

8. **Cross-sell at the moment of intent:** "Customers who bought this also needed..." directly below the CTA on PDPs (battery buyers often also need a charger or casing) — increases order value without adding friction to the primary action.

9. **Delivery clarity up front:** "Same-day delivery in Nairobi, 1–2 days upcountry" stated near the CTA, not buried in a policy page — delivery uncertainty is a major cart-abandonment driver in Kenyan e-commerce.

10. **Minimize decision fatigue on category pages:** clear filters (Brand, Part Type, Price) so technicians and businesses can narrow quickly, while a guided "Find My Part" wizard exists in parallel for less confident buyers.

11. **Analytics-driven iteration:** track WhatsApp click-through rate per PDP/category (via UTM-tagged `wa.me` links) to identify which product pages convert poorly and need copy/trust/pricing adjustments.

---

## Summary: What Makes This Blueprint Work

- **Dual taxonomy** (part-type + brand/model) serves both technician and individual-owner search behavior without compromise.
- **WhatsApp is engineered as the single conversion path**, not an afterthought — pre-filled messages, persistent CTAs, and reserved color signaling all reinforce it.
- **SEO and UX are unified**, not separate workstreams — the compatibility-table-as-text, flat URLs, and content strategy all serve both crawlers and human decision-making simultaneously.
- **Mobile-first isn't a checkbox** — it's the actual design starting point, driven by real Kenyan traffic and network conditions.
- **Static architecture** is used to its full advantage: speed, simplicity, and low hosting cost, with product data centralized in structured JSON so the site scales without becoming unmanageable.

This document should be treated as the source of truth before any HTML/CSS/JS work begins. Once approved, the next step is wireframing the Home, Category, and PDP templates against this blueprint.
