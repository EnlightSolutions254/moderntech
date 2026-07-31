# Homepage Blueprint
### Laptop Parts & Accessories Store (Kenya) — Assembled from Approved Component Architecture

**Compliance note:** Every section below is built exclusively from atoms/molecules/organisms already defined in the Component Architecture document. Two sections in the requirements — Announcement Bar and Delivery Coverage — have no dedicated organism in the existing library; both are called out explicitly as **compositions of existing atoms/molecules**, not new components, per the "no invented patterns" rule.

---

## 1. Announcement Bar

**Section purpose:** Top-of-page micro-strip for a single, time-relevant trust or logistics message — reduces bounce from users unsure about delivery/payment before they scroll.

**Content hierarchy:** Single line, centered, dismissible.

**Headline:** *"Same-day delivery in Nairobi • M-Pesa accepted • Genuine parts only"*

**Supporting copy:** None — this is a single-line strip by design, no secondary text.

**CTA text:** None (informational only — no competing CTA above the primary nav/WhatsApp actions).

**Recommended component composition:** Not a defined organism — composed directly from `Icon` (sm, rotating between truck / shield / check per message if multi-message) + text (Small type scale) + `Button` (ghost, icon-only, close) from the Atoms layer. Sits in a thin strip above `Header`, `color-primary` background, white text.

**Mobile behavior:** Single message shown, auto-rotates every 4s if multiple messages configured (optional), dismissible via close icon, dismissal persists for the session.

**Desktop behavior:** Identical, full-width, slightly more horizontal padding.

**SEO considerations:** None direct (not crawlable-priority content), but reinforces trust signals matching Schema.org `LocalBusiness`/delivery data used elsewhere.

**Conversion purpose:** Pre-emptively answers the two most common pre-purchase objections (delivery speed, payment method) before the user even reaches the hero — reduces hesitation entering the WhatsApp flow later.

---

## 2. Header

**Section purpose:** Persistent wayfinding and secondary conversion access point.

**Content hierarchy:** Logo → Nav (Shop by Part / Shop by Brand / Technicians / Repair Help) → Search → Contact actions.

**Headline / Supporting copy:** N/A (structural component).

**CTA text:** "Chat on WhatsApp" (compact, desktop only — mobile relies on `StickyWhatsAppBar` instead, per component rules preventing duplicate competing CTAs).

**Recommended component composition:** `Organism/Header` exactly as specified — Logo, `NavItem` row, `SearchBar`, `Icon`(phone), `WhatsAppCTAInline` (compact). Mobile variant: Logo, `Icon`(search), `Icon`(hamburger) → `MobileNavDrawer`.

**Mobile behavior:** Condensed bar, hamburger opens `MobileNavDrawer`; sticky on scroll with slight height reduction.

**Desktop behavior:** Full nav visible, mega-menu on hover/click for "Shop by Part" and "Shop by Brand" (both taxonomies exposed directly in primary nav — reinforces the dual-taxonomy strategy from page 1 of the site).

**SEO considerations:** Nav links are the top-level internal linking source for crawl discovery of all category and brand pages — every category/brand must be reachable from this single component.

**Conversion purpose:** Keeps search and contact always within reach; mega-menu lets a technician jump straight to a part type without touching the homepage body at all.

---

## 3. Hero Section

**Section purpose:** Immediately confirm to two very different visitors (technician vs. non-technical owner) that they're in the right place, and offer both a fast path forward.

**Content hierarchy:** Headline → supporting line → dual-path entry (search-style / guided) → trust micro-line.

**Headline:** *"Genuine Laptop Parts, Delivered Fast Across Kenya"*

**Supporting copy:** *"Batteries, chargers, screens, keyboards, hinges, fans and casings for HP, Dell, Lenovo, Acer, Toshiba, Asus and MacBook. Know your part or just your laptop model — we'll help you find it."*

**CTA text:** Primary — *"Find My Part"* (scrolls to Find My Part Wizard). Secondary — *"Order on WhatsApp"* (`WhatsAppCTAInline`, general inquiry template).

**Recommended component composition:** No dedicated "Hero" organism exists in the library, so this is composed from existing atoms only: large heading text (H1 token) + supporting paragraph (Body token) + `Button` (primary, "Find My Part") + `WhatsAppCTAInline` (secondary position) + a small inline `TrustBadgeItem` row (2 items only: "Genuine Parts," "Countrywide Delivery") beneath the CTAs. No new layout organism is introduced — this is a direct, documented composition, matching the same "compose from atoms" approach used for the Announcement Bar.

**Mobile behavior:** Stacked vertically — headline, copy, then both CTAs full-width stacked (primary above secondary), trust row condenses to 2-across beneath. No hero image required at launch (keeps load weight low per mobile-first performance rule); if used, image loads via `SkeletonBlock` and stays below the text, never delaying CTA visibility.

**Desktop behavior:** Two-column layout — text/CTA block left (60%), supporting visual right (40%, optional product collage), CTAs sit side-by-side rather than stacked.

**SEO considerations:** H1 here is the single sitewide H1 for the homepage — keep it keyword-relevant ("Laptop Parts Kenya" intent) without becoming a keyword-stuffed sentence. Supporting copy naturally includes brand names and part-type keywords in readable form, aiding topical relevance for the homepage as an entity page.

**Conversion purpose:** This is the fork point of the entire journey — "Find My Part" routes the undecided visitor into a guided flow, "Order on WhatsApp" captures the visitor who already knows exactly what they want and doesn't need to scroll further.

---

## 4. Find My Part Wizard

**Section purpose:** The core UX bridge for non-technical visitors (students, individual owners, businesses) who know their laptop brand/model but not the part SKU.

**Content hierarchy:** Section header → 3-step guided select → result routing.

**Headline:** *"Not sure exactly what you need? Tell us your laptop."*

**Supporting copy:** *"Pick your brand and model — we'll show you every compatible part in stock."*

**CTA text:** *"Show Me Parts"* (primary button, completes wizard).

**Recommended component composition:** `Organism/FindMyPartWizard` exactly as specified — Brand `Select` → Model `Select` (disabled until Brand chosen) → Part Type `Select` (disabled until Model chosen) → `Button` (primary).

**Mobile behavior:** Steps stack vertically, one active at a time; completed steps collapse into a small summary chip above the active step (per component spec) — keeps vertical space manageable on a 375px screen.

**Desktop behavior:** All three `Select` fields shown inline horizontally with the CTA button at the end of the row — single-glance completion for desktop users.

**SEO considerations:** This component is JS-driven and not independently crawlable — no direct SEO value here. Its output pages (category/brand/PDP) carry the SEO weight instead. Section header text itself is real, indexable copy, so keep the headline/support copy natural-language rather than purely UI-label style.

**Conversion purpose:** This is the highest-leverage component for converting the "I don't know what part I need" visitor into a specific product view, which then routes them to `WhatsAppCTAInline` on that PDP — without this, non-technical users bounce or send unqualified WhatsApp messages ("my laptop won't turn on, help") that are slow to resolve into an actual order.

---

## 5. Shop by Part Category Section

**Section purpose:** Primary discovery path for technicians who think in part types, not brands.

**Content hierarchy:** Section header → grid of 7 category tiles (one per part type) → each tile links to its category page.

**Headline:** *"Shop by Part"*

**Supporting copy:** *"Every category, always in stock and ready to ship."* (only if broadly true — otherwise omit rather than overclaim, per "avoid generic marketing language" rule).

**CTA text:** Each tile itself is the CTA (no separate button text needed) — tile label = category name (e.g., "Laptop Batteries").

**Recommended component composition:** Grid of compact card units — reuses the `ProductCard` visual pattern at a category level is not accurate (ProductCard is product-specific), so this uses `Icon` (lg) + label text as a simple tile, wrapped in the same card surface/elevation tokens as `ProductCard` for visual consistency, laid out via the same grid pattern as `Organism/ProductGrid`. No new organism — this is `ProductGrid`'s layout logic applied to category tiles instead of product data, which is a data-source change, not a structural one.

**Mobile behavior:** 2-column grid (matches `ProductGrid` mobile spec), all 7 tiles visible with scroll — no carousel needed since 7 items is a manageable scroll length.

**Desktop behavior:** 4-column grid (matches `ProductGrid` desktop spec), wraps to a second row (3 tiles) for the 7th category.

**SEO considerations:** Each tile is a real, crawlable internal link to its category page — this is a primary internal-linking hub from the homepage (per blueprint Section 12), so anchor text must exactly match each category's target keyword ("Laptop Batteries," not "Batteries").

**Conversion purpose:** Fastest path for a returning technician who just wants to jump straight to "Keyboards" or "Screens" without any guided flow — zero friction, one tap to category page.

---

## 6. Shop by Brand Section

**Section purpose:** Secondary discovery path — serves users who know their laptop brand (HP, Dell, Lenovo, etc.) but not the part type, and reinforces the dual-taxonomy strategy from the IA.

**Content hierarchy:** Section header → horizontal row/grid of brand logo tiles.

**Headline:** *"Shop by Brand"*

**Supporting copy:** *"HP, Dell, Lenovo, Acer, Toshiba, Asus and MacBook parts — all in one place."*

**CTA text:** Each brand logo tile is itself the CTA — no separate label text needed beyond the logo (with text fallback/alt for accessibility and non-recognizable logos).

**Recommended component composition:** Same approach as Section 5 — simple `Icon`/logo-image tiles on the shared card surface, laid out with `ProductGrid`'s grid logic. Distinct visually from Shop by Part tiles (logo-centric, not icon-centric) to avoid the two discovery paths blurring together.

**Mobile behavior:** Horizontal scroll row (not a wrapped grid) — brands are a shorter, glanceable list compared to the 7 part categories, so a scroll strip keeps this section compact on mobile without pushing key content further down the page.

**Desktop behavior:** Single static row, all brands visible without scroll (7 logos comfortably fit at desktop width).

**SEO considerations:** Each brand tile links to its brand page, feeding the second half of the internal-linking dual-taxonomy structure — equally important for crawl coverage as the part-category tiles above.

**Conversion purpose:** Captures the "I have a Dell, I don't know the model number" visitor who wouldn't complete the Find My Part wizard confidently but recognizes their brand logo instantly.

---

## 7. Featured Products Section

**Section purpose:** Surface high-demand or high-margin parts directly on the homepage, giving both user types a concrete, orderable result without any navigation at all.

**Content hierarchy:** Section header → horizontally scrollable/grid row of `ProductCard`s → "View All" link.

**Headline:** *"Popular Right Now"*

**Supporting copy:** *"The parts our customers order most."* (only include if genuinely data-backed; otherwise headline alone is sufficient — avoid unverifiable claims).

**CTA text:** Each `ProductCard`'s existing `WhatsAppCTAInline` button ("Order on WhatsApp" or equivalent per-product template) + a section-level "View All Products" `Button` (ghost) at the end of the row.

**Recommended component composition:** `Organism/ProductGrid` in its horizontal-carousel configuration (same pattern documented for `RelatedPartsCarousel`, reused here at homepage level) — repeated `ProductCard` instances, each with `Badge`, `Tag`, `Price`, `WhatsAppCTAInline` exactly as specified.

**Mobile behavior:** Horizontal swipe carousel, 1.2 cards visible at a time (partial next-card visible as a scroll affordance).

**Desktop behavior:** 4-across static row or arrow-controlled carousel if the featured set exceeds 4 items.

**SEO considerations:** Product names/links here duplicate PDP links already reachable via category pages — acceptable and beneficial for internal link equity concentration on the homepage's highest-priority products, provided URLs are canonical and consistent (no parameter-based duplicate URLs).

**Conversion purpose:** Shortest possible path to a WhatsApp order for a visitor who lands on the homepage already knowing what they want but hasn't navigated yet — this section can convert without the visitor ever touching search, filters, or the wizard.

---

## 8. Why Choose Us / Trust Bar

**Section purpose:** Address the "why should I trust an online parts seller over a known shop/Jiji listing" objection directly, at a dedicated moment rather than scattering trust claims thinly across the page.

**Content hierarchy:** Section header → 3–4 `TrustBadgeItem` units.

**Headline:** *"Why Buy From Us"*

**Supporting copy:** None needed at section level — each `TrustBadgeItem` carries its own short supporting line.

**CTA text:** None — this section is purely persuasive, not action-prompting (the conversion ask is deliberately reserved for surrounding sections so this one isn't diluted with a competing CTA).

**Recommended component composition:** `Organism/TrustBar` exactly as specified — `TrustBadgeItem` × 4: "Genuine Parts" (tested before dispatch), "Warranty Included" (6-month standard), "Countrywide Delivery" (Nairobi same-day / upcountry 1–2 days), "M-Pesa & Cash on Delivery."

**Mobile behavior:** Horizontal scroll or 2×2 grid (per component spec) — 2×2 grid is preferable here for glanceability without requiring a swipe gesture on a purely informational section.

**Desktop behavior:** Single row, evenly spaced, 4-across.

**SEO considerations:** Genuine-part and warranty language here should mirror the language used in `Product` schema markup elsewhere (consistency between visible trust copy and structured data), and can reinforce E-E-A-T signals when similar phrasing appears on the About page.

**Conversion purpose:** Directly reduces first-time-buyer hesitation before they reach the final CTA banner — functions as the "objection handling" checkpoint of the homepage.

---

## 9. Delivery Coverage Section

**Section purpose:** Kenyan e-commerce buyers cite delivery uncertainty as a leading cause of hesitation (per blueprint Section 14) — this section makes coverage and timing explicit rather than leaving it to a policy page.

**Content hierarchy:** Section header → coverage list/map reference → confirmation CTA.

**Headline:** *"We Deliver Countrywide"*

**Supporting copy:** *"Same-day delivery within Nairobi. 1–2 days to major towns. Not sure about your area? Ask us directly."*

**CTA text:** *"Confirm Delivery to Your Area"* (`WhatsAppCTAInline`, sm).

**Recommended component composition:** No dedicated "coverage map" organism exists, so this section reuses existing molecules only: a short list of `CompatibilityListItem` (check-icon + text) repurposed here to list major coverage towns/regions instead of laptop models — same visual pattern (check + label), different data source, consistent with the "data-source change, not new component" principle used in Sections 5–6. Closed with a `WhatsAppCTAInline` exactly as the `CompatibilityTable` component already does for its own "confirm compatibility" closing line.

**Mobile behavior:** Coverage list in a single column, 2-line max before a "See full coverage list" expand (same overflow pattern already defined for `Tag` overflow chips).

**Desktop behavior:** Coverage list in 2–3 columns, no overflow truncation needed at desktop width.

**SEO considerations:** Town/region names listed here are valuable for local SEO relevance signals (matches the blueprint's local-intent keyword tier — "laptop parts delivery Nairobi/Mombasa/Kisumu" etc.) — this is real, crawlable text, not an image-based map, deliberately.

**Conversion purpose:** Removes a specific, common objection right before the visitor reaches later trust/CTA sections — a visitor unsure whether delivery reaches their town gets the answer here instead of abandoning to search elsewhere.

---

## 10. Technician & Bulk Orders CTA

**Section purpose:** Distinct conversion path for the highest-value repeat-order segment (technicians/businesses), who have different needs (volume pricing, credit terms) than a one-time individual buyer — per blueprint Section 14, this segment should never be funneled through the same generic flow.

**Content hierarchy:** Headline → supporting copy → distinct CTA.

**Headline:** *"Repair Technician or Business? Get Trade Pricing."*

**Supporting copy:** *"Bulk orders, priority stock holds, and trade pricing for repair shops and businesses across Kenya."*

**CTA text:** *"Chat About Bulk Pricing"* (`WhatsAppCTAInline`, distinct pre-filled template: "Hi, I'm a technician interested in bulk pricing...").

**Recommended component composition:** `Organism/TechnicianCTABlock` exactly as specified.

**Mobile behavior:** Full-width block, stacked headline/copy/CTA, visually distinguished with a different background tone (e.g., `color-primary` fill, white text) to separate it from the surrounding lighter sections.

**Desktop behavior:** Full-width band, text left-aligned with CTA right-aligned in the same row (not stacked), maintaining the visual distinction from mobile.

**SEO considerations:** This section's copy should naturally include "bulk," "wholesale," "trade pricing," and "technician" — feeds a smaller but valuable long-tail keyword segment ("laptop parts wholesale Kenya," "bulk laptop batteries supplier Nairobi").

**Conversion purpose:** A technician who scrolls past product sections without converting may still convert here, because this is the first moment the page speaks directly to their specific need (pricing structure) rather than assuming they're a one-time buyer.

---

## 11. Customer Testimonials

**Section purpose:** Social proof, specifically valuable for first-time individual buyers wary of ordering laptop parts online without seeing/touching them first.

**Content hierarchy:** Section header → repeated testimonial units.

**Headline:** *"What Our Customers Say"*

**Supporting copy:** None required — testimonials carry their own content.

**CTA text:** None (persuasive section, not an action prompt — consistent with Section 8's approach).

**Recommended component composition:** `Organism/TestimonialCarousel` exactly as specified — repeated `TestimonialCard` units, mixing technician and individual-owner quotes deliberately (e.g., one from "Technician, Nairobi CBD," one from "University Student, Nairobi") so both target segments see themselves represented here.

**Mobile behavior:** Swipeable single-card view.

**Desktop behavior:** 3-across static or auto-rotating.

**SEO considerations:** If real testimonials include specific part/brand mentions ("fixed my HP battery issue same day"), this contributes naturally occurring long-tail keyword variation in indexable text — do not fabricate specificity that isn't real, per "avoid generic marketing language" and honesty requirements.

**Conversion purpose:** Positioned after the trust/delivery/technician sections and before the final CTA — this is the last persuasion checkpoint before the homepage explicitly asks for the WhatsApp action again.

---

## 12. FAQ Preview

**Section purpose:** Resolve remaining friction points (warranty terms, part compatibility confidence, payment options) for visitors who are close to converting but have one unanswered question.

**Content hierarchy:** Section header → 4–5 condensed accordion items → link to full FAQ page.

**Headline:** *"Common Questions"*

**Supporting copy:** None required.

**CTA text:** *"View All FAQs"* (`Button`, ghost, links to full FAQ page).

**Recommended component composition:** `Organism/FAQAccordion` in its condensed configuration (same pattern already documented for embedding a condensed FAQ set on a PDP) — 4–5 `FAQItem` units covering: "How do I know this part fits my laptop?", "Do you offer warranty?", "How long does delivery take?", "Can I pay via M-Pesa?", "Do you buy old/broken parts?"

**Mobile behavior:** Single-column accordion, one item expanded at a time.

**Desktop behavior:** Same accordion pattern, optionally 2-column layout if item count justifies it — otherwise single column is preferable for readability.

**SEO considerations:** High-value section for `FAQPage` structured data (per blueprint SEO strategy) — this is a direct opportunity for rich snippet eligibility in search results, so questions should mirror actual search phrasing where possible.

**Conversion purpose:** Prevents last-minute drop-off from an unanswered practical question — keeps the visitor on-page and moving toward the final CTA instead of leaving to search for the answer elsewhere.

---

## 13. Final WhatsApp CTA Banner

**Section purpose:** The homepage's closing conversion moment — a dedicated, unambiguous, final ask after all discovery and trust-building sections.

**Content hierarchy:** Headline → short supporting line → single prominent CTA.

**Headline:** *"Still Not Sure What You Need?"*

**Supporting copy:** *"Send us a photo or tell us your laptop model on WhatsApp — we'll help you find the right part in minutes."*

**CTA text:** *"Chat With Us on WhatsApp"* (`WhatsAppCTAInline`, lg, full-width on mobile).

**Recommended component composition:** No new organism — composed from existing atoms exactly as the Hero section was (heading text + supporting copy + `WhatsAppCTAInline` lg), functioning as a closing mirror of the Hero's structure but with a single CTA instead of a dual path, since by this point the visitor has already been guided through discovery.

**Mobile behavior:** Full-width band, centered text, full-width CTA button beneath.

**Desktop behavior:** Centered, constrained max-width text block with CTA beneath, generous vertical padding (space-6/space-7) to give it clear visual weight as a closing statement before the footer.

**SEO considerations:** Minimal — this section is conversion-only, not a target for keyword optimization, though the phrase "laptop model" naturally reinforces topical relevance without being forced.

**Conversion purpose:** Explicitly designed for the visitor who has scrolled the entire homepage without converting elsewhere — this is the deliberate last chance, framed around removing final uncertainty ("send us a photo") rather than repeating a generic "buy now" message.

---

## 14. Footer

**Section purpose:** Sitewide crawlable link structure, secondary trust reinforcement, and contact fallback.

**Content hierarchy:** Link columns → contact info block → legal/copyright bar.

**Headline / Supporting copy:** N/A (structural), though column headers act as mini-labels ("Shop by Part," "Shop by Brand," "Company," "Contact").

**CTA text:** Contact info block includes a compact `WhatsAppCTAInline` alongside listed phone number — footer is not CTA-free even though it's the lowest-priority conversion zone, since some visitors scroll straight to the bottom looking for contact info.

**Recommended component composition:** `Organism/Footer` exactly as specified — 4 column groups, contact block, bottom bar.

**Mobile behavior:** Accordion-collapsed column groups (per component spec) to avoid an overwhelming link wall on mobile.

**Desktop behavior:** 4-column static grid, fully expanded.

**SEO considerations:** This is the final and most complete internal-linking safety net — every category and brand page must appear here even if a user never scrolled past the Shop by Part/Brand sections above, ensuring full crawl coverage from a single page load.

**Conversion purpose:** Catches the "scrolled straight to the bottom for contact info" visitor — a real and common pattern, especially among older or less tech-savvy individual buyers per the target audience definition.

---

# Post-Structure Deliverables

## A. User Journey: Landing → WhatsApp Inquiry

**Journey 1 — Technician (knows exact part):**
1. Lands on Home (often via a Google search for a specific model, but assuming homepage entry here)
2. Skips Hero copy, scans directly to **Shop by Part** grid
3. Taps "Laptop Batteries" → Category page → filters by Brand
4. Opens specific PDP → confirms specs/compatibility in `SpecTable`/`CompatibilityTable`
5. Taps `WhatsAppCTAInline` (pre-filled with product name + SKU) → sends order message
**Total taps to WhatsApp: ~4**

**Journey 2 — Individual owner/student (knows brand/model only):**
1. Lands on Home
2. Reads Hero headline/copy — recognizes this is the right kind of store
3. Uses **Find My Part Wizard** (Brand → Model → Part Type)
4. Routed to filtered results — reviews 1–3 `ProductCard`s
5. Uncertain about fit → opens PDP, sees "Not sure if this fits? Confirm via WhatsApp" line in `CompatibilityTable`
6. Taps `WhatsAppCTAInline` → sends a compatibility-confirmation message (pre-order question, still counted as a qualified inquiry)
**Total taps to WhatsApp: ~5–6**

**Journey 3 — Undecided/anxious first-time buyer:**
1. Lands on Home, browses Hero → Trust Bar → Delivery Coverage → Testimonials → FAQ Preview (full vertical read, seeking reassurance)
2. Never uses the Wizard or category grids
3. Converts directly at the **Final WhatsApp CTA Banner** with a general/photo-based inquiry
**Total taps to WhatsApp: 1 (after a full scroll-read)**

**Journey 4 — Technician/business, bulk interest:**
1. Lands on Home
2. Scrolls past product discovery sections
3. Recognizes themselves in the **Technician & Bulk Orders CTA** band
4. Converts directly there with the trade-pricing message template
**Total taps to WhatsApp: 1 (after partial scroll)**

---

## B. Mobile-First Wireframe Outline

```
[Announcement Bar — dismissible strip]
[Header — logo, search icon, hamburger]
────────────────────────────
[Hero]
  H1 + supporting copy
  Button: Find My Part (primary, full-width)
  WhatsAppCTAInline (secondary, full-width)
  TrustBadgeItem ×2 (condensed row)
────────────────────────────
[Find My Part Wizard]
  Step 1: Brand (active)
  Step 2/3: collapsed until prior step complete
  Button: Show Me Parts
────────────────────────────
[Shop by Part — 2-col grid, 7 tiles]
────────────────────────────
[Shop by Brand — horizontal scroll strip]
────────────────────────────
[Featured Products — horizontal swipe carousel]
  ProductCard ×n (1.2 visible)
  Button: View All (ghost)
────────────────────────────
[Why Choose Us — TrustBadgeItem 2×2 grid]
────────────────────────────
[Delivery Coverage]
  Coverage list (single col, truncated + expand)
  WhatsAppCTAInline (sm)
────────────────────────────
[Technician CTA Band — distinct bg color]
  Headline + copy stacked
  WhatsAppCTAInline (full-width)
────────────────────────────
[Testimonials — swipeable single card]
────────────────────────────
[FAQ Preview — accordion, single col]
  Button: View All FAQs (ghost)
────────────────────────────
[Final WhatsApp CTA Banner]
  Centered headline + copy
  WhatsAppCTAInline (lg, full-width)
────────────────────────────
[Footer — accordion-collapsed columns]
────────────────────────────
[StickyWhatsAppBar — persistent, fixed bottom, all sections above scroll beneath it]
```

---

## C. Desktop Wireframe Outline

```
[Announcement Bar — full-width strip]
[Header — full nav, search, phone icon, WhatsApp CTA]
────────────────────────────────────────────
[Hero — two-column: text/CTA (60%) | visual (40%)]
────────────────────────────────────────────
[Find My Part Wizard — inline horizontal 3-select + button]
────────────────────────────────────────────
[Shop by Part — 4-col grid, wraps to 3 on second row]
────────────────────────────────────────────
[Shop by Brand — single static row, 7 logos]
────────────────────────────────────────────
[Featured Products — 4-across row or arrow-controlled carousel]
  + "View All Products" (ghost, end of row)
────────────────────────────────────────────
[Why Choose Us — single row, 4 TrustBadgeItem evenly spaced]
────────────────────────────────────────────
[Delivery Coverage — 2–3 column list + WhatsAppCTAInline]
────────────────────────────────────────────
[Technician CTA Band — full-width, text left / CTA right, single row]
────────────────────────────────────────────
[Testimonials — 3-across static or auto-rotating]
────────────────────────────────────────────
[FAQ Preview — single or 2-column accordion + View All link]
────────────────────────────────────────────
[Final WhatsApp CTA Banner — centered, constrained max-width, generous padding]
────────────────────────────────────────────
[Footer — 4-column grid, fully expanded]
────────────────────────────────────────────
[FloatingWhatsAppButton — fixed bottom-right, all sections]
```

---

## D. Homepage Content Hierarchy Map

```
Priority 1 (Immediate conversion / orientation)
 ├── Header (WhatsApp CTA access)
 ├── Hero (dual-path fork)
 └── StickyWhatsAppBar / FloatingWhatsAppButton (persistent, all priority levels)

Priority 2 (Discovery — get the right visitor to the right product)
 ├── Find My Part Wizard
 ├── Shop by Part
 ├── Shop by Brand
 └── Featured Products

Priority 3 (Trust-building — remove hesitation before final ask)
 ├── Why Choose Us
 ├── Delivery Coverage
 └── Testimonials

Priority 4 (Segment-specific + objection-handling)
 ├── Technician & Bulk Orders CTA
 └── FAQ Preview

Priority 5 (Closing + safety net)
 ├── Final WhatsApp CTA Banner
 └── Footer
```

**Rationale:** Discovery sections are placed before trust sections deliberately — a visitor who already knows what they want (technician) shouldn't have to scroll past testimonials to reach product discovery. Trust-building sections instead work on the visitor scrolling *past* discovery without converting, catching them before they leave. The Technician CTA is placed after general trust-building rather than immediately after Hero, so it doesn't compete with the primary dual-path fork at the top — but still appears before the visitor reaches the bottom of the page and disengages.

---

## E. Recommended Order of Implementation (Development)

1. **Design tokens + base atoms** (Button, Badge, Tag, Icon, Price, Input, Select, Divider, SkeletonBlock) — everything downstream depends on these existing first.
2. **Header + Footer + StickyWhatsAppBar/FloatingWhatsAppButton** — sitewide structural shell, needed to preview any other section in context.
3. **WhatsAppCTAInline** (with message-templating logic wired to product data schema) — build and test this in isolation early since it's the most re-entrant component in the system; every later section depends on it working correctly.
4. **ProductCard + ProductGrid** — needed for Featured Products and reused immediately after for Category pages.
5. **Hero section** (composed from atoms) — first content section, establishes the dual-path pattern.
6. **FindMyPartWizard** — highest-complexity interactive component (dependent selects, routing logic) — build once core atoms/Select are stable.
7. **Shop by Part / Shop by Brand tiles** — straightforward once `ProductGrid`'s layout logic is proven from Featured Products.
8. **TrustBar / TrustBadgeItem** (Why Choose Us) — simple, low-risk, can be built in parallel with step 6–7.
9. **Delivery Coverage section** — reuses `CompatibilityListItem` pattern + `WhatsAppCTAInline`, low effort once those exist.
10. **TechnicianCTABlock** — simple composition, low risk.
11. **TestimonialCarousel + FAQAccordion** — content-dependent sections, can be built with placeholder content while real testimonials/FAQs are being collected.
12. **Final WhatsApp CTA Banner** — mirrors Hero's composition pattern, fastest to build once Hero exists.
13. **Announcement Bar** — lowest priority, purely cosmetic/informational, safe to build last or even post-launch.
14. **Full homepage assembly + responsive QA pass** against the Mobile/Desktop wireframe outlines (Sections B–C above) as acceptance criteria.
15. **Analytics instrumentation** on every `WhatsAppCTAInline` instance (UTM-tagged `wa.me` links per section) — must be wired in before launch, not after, so conversion data by section is available from day one.

---

## Summary

Every section above resolves to components already defined in the approved architecture — the only two departures (Announcement Bar, Delivery Coverage) are explicitly documented as atom-level compositions, not new organisms, keeping the system's "no invented patterns" rule intact. The homepage structure enforces the dual-taxonomy strategy twice (Shop by Part / Shop by Brand, plus the Wizard), gives the technician segment a fast exit at three separate points (Shop by Part, Featured Products, Technician CTA), and never lets more than one full section pass without a `WhatsAppCTAInline` instance in reach — consistent with the blueprint's rule that the primary action must always be close at hand.
