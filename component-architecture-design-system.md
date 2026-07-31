# Component Architecture & Design System
### Laptop Parts & Accessories E-Commerce (Kenya) — Reusable UI Foundation

This document defines every reusable component in the system, organized using an **atomic hierarchy** (Foundations → Atoms → Molecules → Organisms → Patterns). Every future page is assembled by composing these — no page should ever require a bespoke, one-off section.

---

## 0. Structural Philosophy

**Rule 1 — No orphan components.** Every component must be reusable across at least 2 page types, or it doesn't belong in the system (it's a page-specific layout decision instead).

**Rule 2 — Composition over duplication.** Organisms are built from molecules, molecules from atoms. Nothing is styled twice — if a Category page card and a Search Results card look the same, they *are* the same component (`ProductCard`), not two components that happen to look alike.

**Rule 3 — Every component ships with states.** A component spec is incomplete without: Default, Hover, Active/Pressed, Focus (keyboard), Disabled, Loading, Empty, and Error (where applicable).

**Rule 4 — Mobile is the base spec.** Every measurement below is defined mobile-first; desktop variants are documented as overrides, not separate designs.

**Naming convention:** `Category/ComponentName` (e.g., `Atom/Button`, `Molecule/ProductCard`, `Organism/Header`). This maps directly to a future component library folder structure (Section 8).

---

## 1. Foundations (Design Tokens)

These underpin every component below — no component may use a hardcoded value outside this token set.

### 1.1 Spacing Scale (8px base unit)
```
space-1  = 4px   (micro — icon-to-label gaps)
space-2  = 8px   (tight — within a component, e.g. badge padding)
space-3  = 16px  (default — standard internal padding)
space-4  = 24px  (comfortable — between related components)
space-5  = 32px  (section — between distinct component groups)
space-6  = 48px  (block — between major page sections)
space-7  = 64px  (section break — top-level layout separation)
```

### 1.2 Breakpoints
```
mobile:   0–599px      (base spec, default)
tablet:   600–959px
desktop:  960–1279px
wide:     1280px+
```

### 1.3 Radius Scale
```
radius-sm = 4px   (badges, tags, small inputs)
radius-md = 8px   (cards, buttons, inputs)
radius-lg = 12px  (modals, large panels)
radius-full = 999px (pills, avatar-style icons)
```

### 1.4 Elevation (Shadow)
```
elevation-0 = none                          (flat surfaces, default cards)
elevation-1 = 0 1px 3px rgba(15,37,64,0.08) (hover state on cards)
elevation-2 = 0 4px 12px rgba(15,37,64,0.12) (sticky bars, dropdowns)
elevation-3 = 0 8px 24px rgba(15,37,64,0.16) (modals, drawers)
```

### 1.5 Z-Index Scale
```
z-base       = 0
z-sticky     = 10   (sticky nav, sticky WhatsApp bar)
z-dropdown   = 20   (filter dropdowns, autosuggest)
z-drawer     = 30   (mobile filter drawer, mobile nav)
z-modal      = 40   (image zoom, confirmation modals)
z-toast      = 50   (stock alerts, form confirmations)
```

### 1.6 Motion
```
duration-fast   = 120ms  (hover/press feedback)
duration-base   = 200ms  (drawer/dropdown open-close)
duration-slow   = 320ms  (page-level transitions, modal entrance)
easing-standard = cubic-bezier(0.2, 0, 0, 1)
```

### 1.7 Color & Typography
Inherited from the approved blueprint (Sections 6–7) — referenced here as tokens, not redefined:
`color-primary`, `color-secondary`, `color-accent-whatsapp`, `color-highlight`, `color-success`, `color-error`, `color-bg`, `color-surface`, `color-border` / `font-heading`, `font-body`, `font-mono`, type scale `H1–Small`.

---

## 2. Atoms

The smallest indivisible UI elements. No atom contains another component.

### 2.1 `Button`
**Purpose:** Every clickable action in the system routes through one Button component with variants — never a one-off styled link.

**Variants:**
- `primary` — solid navy, white text (default actions: "View Details," "Apply Filters")
- `whatsapp` — solid WhatsApp green, white text, WhatsApp icon left — **reserved exclusively** for order/contact actions
- `secondary` — outlined navy, navy text (e.g., "Call to Confirm")
- `ghost` — no border/fill, navy text (tertiary actions: "Clear Filters")
- `danger` — red, used only in admin/future contexts, not customer-facing at v1

**Sizes:** `sm` (32px height, filter chips), `md` (44px height, default), `lg` (52px height, primary PDP CTA)

**States:** default, hover (elevation-1 + 4% darken), active/pressed (2% darken, scale 0.98), focus (2px accent outline, keyboard nav), disabled (40% opacity, no pointer events), loading (spinner replaces label, button width locked to prevent layout shift)

**Anatomy:** `[icon-left?] [label] [icon-right?]` — icon slots optional, label required, min-width 88px to prevent cramped tap targets.

**Spacing:** Horizontal padding = space-4 (24px), vertical padding = space-2 (8px) for `md`, scales proportionally for `sm`/`lg`.

**Relationships:** Used inside `ProductCard`, `PDPActionPanel`, `FilterBar`, `StickyWhatsAppBar`, `FormField` groups, `EmptyState`.

---

### 2.2 `Badge`
**Purpose:** Compact status/label indicator — stock status, condition, warranty flags.

**Variants:** `in-stock` (green), `low-stock` (amber, includes unit count), `out-of-stock` (red), `new-oem` (navy), `warranty` (grey outline)

**Anatomy:** Optional icon (dot or check) + short text label. Never wraps to 2 lines — max ~20 characters.

**Spacing:** Padding space-2 horizontal / space-1 vertical. Radius-sm.

**Relationships:** Lives inside `ProductCard`, `PDPHeader`, `CompatibilityTable`.

---

### 2.3 `Tag` / `CompatibilityChip`
**Purpose:** Represents a single compatible model (e.g., "HP EliteBook 840 G3") — distinct from Badge because it's *informational/filterable*, not a status.

**States:** default (grey outline), selected (navy fill — used in filter context), overflow (`+3 more` chip that expands the list on tap)

**Relationships:** Used in `ProductCard` (compact, max 2 shown + overflow), `CompatibilityTable` (full list), `FilterSidebar` (as selectable filter chips).

---

### 2.4 `Icon`
**Purpose:** Single-source icon system — no inline SVGs scattered across components.

**Core set required:** WhatsApp, phone, search, filter, chevron (up/down/left/right), close, check, warning, truck (delivery), shield (warranty), star (testimonials), menu (hamburger), zoom, cart-off (we have no cart, but a "compare" icon may use similar affordance).

**Sizing tokens:** `icon-sm` 16px, `icon-md` 20px, `icon-lg` 24px, `icon-xl` 32px (used in trust bar / empty states).

**Rule:** Icons are never used alone as an interactive target without a visible label or `aria-label` — critical given the less tech-savvy segment of the audience (Section 13 of blueprint).

---

### 2.5 `Price`
**Purpose:** Standardized price display — must always read as trustworthy and unambiguous (KES currency, thousand separators).

**Anatomy:** `KES [amount]` — bold, `color-primary`. Optional strikethrough "was" price for discounts (future-proofing, not required at launch).

**Sizes:** `sm` (product card, 16px bold), `lg` (PDP hero price, 28px bold).

**Relationships:** `ProductCard`, `PDPActionPanel`.

---

### 2.6 `Input` (text field)
**Purpose:** Single text-entry component for the minimal forms in the system (Contact form, newsletter, search bar).

**States:** default, focus (2px accent border), filled, error (red border + helper text below), disabled.

**Anatomy:** Optional label above, input field (44px height min for tap target), optional helper/error text below.

**Relationships:** Used inside `SearchBar`, `ContactForm`.

---

### 2.7 `Select` / `Dropdown Trigger`
**Purpose:** Tap-to-select input — the preferred input pattern per the blueprint's mobile-UX strategy (favor selection over typing).

**States:** default, open (chevron rotates, elevation-2 panel appears), selected (shows chosen value), disabled (e.g., "Model" disabled until "Brand" is chosen).

**Relationships:** Core building block of `FindMyPartWizard`, `FilterSidebar`.

---

### 2.8 `Divider`
Thin `color-border` line, horizontal or vertical, used to separate list items and sections without introducing a full spacing gap. 1px, no shadow.

---

### 2.9 `SkeletonBlock`
**Purpose:** Loading placeholder — grey animated pulse block matching the shape of the content it replaces (image rectangle, text lines). Required per the blueprint's "never a blank white screen" rule on patchy connections.

**Relationships:** Used inside `ProductCard` (loading state), `PDPGallery` (loading state), any organism fetching/rendering data.

---

## 3. Molecules

Combinations of 2+ atoms that form a functional, reusable unit.

### 3.1 `ProductCard`
**Purpose:** The single most-repeated component in the system — appears on Category pages, Brand pages, Search Results, Related Parts carousels, and the Home page featured grid.

**Composition:** `Image` (with `SkeletonBlock` loading state) → `Badge` (stock status, top-left overlay on image) → `H3` product name → `Tag` row (max 2 compatible models + overflow chip) → `Price` (sm) → `Button` (whatsapp variant, sm, full-width on mobile)

**States:**
- Default
- Hover (desktop only): elevation-1, slight image scale (1.03), border color shifts to `color-primary` at 20% opacity
- Loading: full skeleton version (image block + text line blocks + button block)
- Out-of-stock: image desaturated 30%, Badge shows red "out-of-stock", WhatsApp button label changes to "Notify Me" (secondary variant, disabled interaction pending future backend) or removed at v1 in favor of "Ask About Restock"

**Spacing:** Internal padding space-3 (16px). Image aspect ratio locked 1:1 or 4:3 (consistent across all cards). Gap between image and text block = space-2.

**Responsive behavior:**
- Mobile: 1 column full-width OR 2-column grid depending on context (search results = 2-col, featured carousel = horizontal scroll)
- Tablet: 3-column grid
- Desktop: 4-column grid
- Card itself does not change internal layout across breakpoints — only the grid wrapping it changes.

**Relationships:** Child of `ProductGrid`, `RelatedPartsCarousel`, `SearchResultsGrid`. Contains `Badge`, `Tag`, `Price`, `Button`, `SkeletonBlock`.

---

### 3.2 `FilterChip`
**Purpose:** A single active/removable filter shown above search results (e.g., "Brand: HP ✕").

**Composition:** `Tag` (selected variant) + `Icon` (close, sm) as a combined pressable unit.

**Relationships:** Lives in `ActiveFiltersBar`, generated from `FilterSidebar` selections.

---

### 3.3 `NavItem`
**Purpose:** Single navigation link/trigger, used in both desktop mega-menu and mobile accordion nav.

**States:** default, hover/active (underline or color shift), current-page (bold + accent underline), expanded (for items with sub-menus — chevron rotates)

**Relationships:** Child of `Header` (desktop mega-menu) and `MobileNavDrawer` (accordion).

---

### 3.4 `Breadcrumb`
**Purpose:** Hierarchical path indicator, present on every page below Home.

**Composition:** Sequence of text links separated by `Icon` (chevron-right, sm), final item non-interactive (current page, `color-secondary`, not a link).

**Responsive behavior:** Mobile — truncates to `Home / … / Current Page` if path exceeds 3 levels, with `…` expandable on tap. Desktop — shows full path.

**Relationships:** Sits directly below `Header` on every Tier 2+ page.

---

### 3.5 `SpecRow`
**Purpose:** Single label-value row inside a spec table (e.g., "Voltage: 11.4V").

**Composition:** Label (`color-secondary`, left) + Value (`color-primary`, right or below on mobile) + `Divider` beneath.

**Responsive behavior:** Mobile — label above value (stacked) if value text is long; Desktop — always inline label/value.

**Relationships:** Repeats inside `SpecTable` organism.

---

### 3.6 `CompatibilityListItem`
**Purpose:** Single model entry inside the full compatibility table on a PDP (as opposed to the compact `Tag` shown on `ProductCard`).

**Composition:** `Icon` (check, sm, `color-success`) + model name text.

**Relationships:** Repeats inside `CompatibilityTable` organism.

---

### 3.7 `TrustBadgeItem`
**Purpose:** Single trust-signal unit (e.g., "Genuine Parts," "6-Month Warranty," "Countrywide Delivery").

**Composition:** `Icon` (lg) above short bold label + one-line supporting text.

**Relationships:** Repeats inside `TrustBar` organism (3–4 across on desktop, horizontal scroll on mobile).

---

### 3.8 `TestimonialCard`
**Purpose:** Single customer quote unit.

**Composition:** Optional `Icon` (star rating row) + quote text (max ~2 lines, truncate with "read more" if longer) + attribution line (name/role, e.g., "Technician, Nairobi CBD").

**Relationships:** Repeats inside `TestimonialCarousel` organism.

---

### 3.9 `FAQItem`
**Purpose:** Single accordion question/answer pair.

**States:** collapsed (default), expanded (chevron rotates 180°, answer slides down with `duration-base`)

**Relationships:** Repeats inside `FAQAccordion` organism.

---

### 3.10 `SearchBar`
**Purpose:** Global product/model search with autosuggest.

**Composition:** `Icon` (search, left) + `Input` + autosuggest dropdown panel (elevation-2, appears below on typing, shows matching product names/model numbers with `Icon` thumbnails).

**States:** idle, focused (dropdown open), typing (results filtering live), no-results (`EmptyState` mini-variant inside dropdown), loading (SkeletonBlock rows in dropdown).

**Relationships:** Lives in `Header` (desktop) and `MobileNavDrawer`/dedicated search overlay (mobile).

---

### 3.11 `WhatsAppCTAInline`
**Purpose:** A pre-configured `Button` (whatsapp variant) that always carries a pre-filled message payload specific to its context (product name+SKU on a PDP, general inquiry elsewhere).

**Rule:** This is technically a configured instance of `Atom/Button`, but documented as its own molecule because of the message-templating logic attached to it — every instance must reference `whatsapp_message_template` from the product data (per blueprint Section 11) or a page-level default template.

**Relationships:** Used inside `ProductCard`, `PDPActionPanel`, `StickyWhatsAppBar`, `TechnicianCTA`.

---

## 4. Organisms

Composed of multiple molecules/atoms — these are the large, distinct sections that pages are assembled from.

### 4.1 `Header`
**Purpose:** Sitewide navigation, persistent across all pages.

**Composition (desktop):** Logo (left) → `NavItem` row / mega-menu trigger (center) → `SearchBar` + `Icon`(phone, click-to-call) + `WhatsAppCTAInline` (compact, right)

**Composition (mobile):** Logo (left) → `Icon`(search, opens overlay) + `Icon`(hamburger, opens `MobileNavDrawer`) (right). WhatsApp CTA is NOT duplicated here — it lives in `StickyWhatsAppBar` instead, to avoid redundant competing CTAs on a cramped mobile header.

**Behavior:** Sticky on scroll (all breakpoints), condenses height slightly on scroll-down (logo/nav shrink by ~20%) to preserve content viewport on mobile.

**States:** default, scrolled (condensed + elevation-1 shadow appears), mega-menu open (dropdown panel, elevation-2), mobile drawer open (full-screen overlay, elevation-3).

**Relationships:** Parent to `NavItem`, `SearchBar`. Sibling/coordinator with `StickyWhatsAppBar` (mobile) to avoid CTA duplication.

---

### 4.2 `MobileNavDrawer`
**Purpose:** Full-height slide-in panel for mobile navigation (part-type categories, brand list, static pages).

**Composition:** Accordion of `NavItem`s grouped by section (Shop by Part / Shop by Brand / Company), close `Icon` top-right.

**Behavior:** Slides in from left/right (`duration-base`), backdrop overlay dims page content, body scroll-locked while open.

---

### 4.3 `ProductGrid`
**Purpose:** Responsive grid wrapper for any collection of `ProductCard`s — used on Category, Brand, Search Results, and Home "Featured" sections.

**Composition:** Grid container + repeated `ProductCard` + `EmptyState` (shown if zero results) + `LoadMore`/pagination control at bottom (simple "Load More" button preferred over numbered pagination, for mobile simplicity).

**Responsive behavior:** Column count per Section 3.1 responsive rules. Gap between cards = space-3 (mobile) / space-4 (desktop).

**Relationships:** Parent of `ProductCard`, `EmptyState`, pagination `Button`.

---

### 4.4 `FilterSidebar` (desktop) / `FilterDrawer` (mobile)
**Purpose:** Faceted filtering by Brand, Part Type, Price Range, Availability.

**Composition:** Section groups, each a collapsible accordion (`Select`-style groups) — Brand (checklist), Part Type (checklist, hidden if already on a category page), Price Range (min/max `Input` pair or preset chips), Availability (`in-stock only` toggle). Bottom: `Button` (primary) "Apply Filters" + `Button` (ghost) "Clear All."

**Desktop behavior:** Persistent left column, no overlay, filters apply live or via explicit "Apply."
**Mobile behavior:** Triggered via a "Filter" `Button` above the grid; opens as a bottom-sheet `Drawer` (elevation-3, slides up, backdrop dim, body scroll-locked).

**Relationships:** Outputs populate `ActiveFiltersBar` (row of `FilterChip`s) shown above `ProductGrid`.

---

### 4.5 `FindMyPartWizard`
**Purpose:** Guided 3-step selector (Brand → Model → Part Type) for non-technical users who don't know SKUs — this is the blueprint's core UX bridge for the individual-owner/student segment.

**Composition:** Step indicator (1-2-3 progress) → `Select` (Brand) → `Select` (Model, disabled until Brand chosen) → `Select` (Part Type, disabled until Model chosen) → `Button` (primary) "Show Results" → routes to filtered `ProductGrid`.

**States:** step-1-active, step-2-active (step-1 collapses to a summary chip), step-3-active, complete (redirects/scrolls to results).

**Responsive behavior:** Mobile — steps stack vertically, one visible at a time with the completed ones collapsed to summary chips above. Desktop — can show all 3 selects inline horizontally.

**Relationships:** Standalone organism, embeddable on Home page (as a hero-adjacent module) and as its own dedicated page.

---

### 4.6 `PDPGallery`
**Purpose:** Product image viewer on the Product Detail Page.

**Composition:** Primary large image + thumbnail row (tap to swap primary) + `Icon`(zoom) triggering a full-screen `ImageZoomModal`.

**Behavior:** Mobile — swipeable horizontal carousel with dot indicators instead of thumbnail row (thumbnails take too much vertical space on small screens). Desktop — thumbnail column beside main image.

**Relationships:** Top of `PDPLayout`, paired beside `PDPActionPanel` on desktop (side-by-side), stacked above it on mobile.

---

### 4.7 `PDPActionPanel`
**Purpose:** The highest-priority conversion organism in the entire system — contains everything needed to decide and act, above the fold on mobile.

**Composition (top to bottom):** Product `H1` name → `Badge` row (stock status + condition) → `Price` (lg) → short 1–2 line description → `WhatsAppCTAInline` (lg, full-width) → `Button` (secondary, "Call to Confirm") → `TrustBadgeItem` mini-row (warranty + delivery, condensed 2-across) inline beneath CTAs.

**Rule (per blueprint Section 13):** Everything in this component must render above the fold on a 375px-wide viewport without scrolling. Specs and full compatibility table live in a separate organism (`SpecTable`/`CompatibilityTable`) below the fold — this panel is decision/action only.

**Relationships:** Sibling to `PDPGallery` in `PDPLayout`. Contains `WhatsAppCTAInline`.

---

### 4.8 `SpecTable`
**Purpose:** Full technical specification list on a PDP, below the fold.

**Composition:** Repeated `SpecRow` items, section header "Specifications."

---

### 4.9 `CompatibilityTable`
**Purpose:** Full list of compatible laptop models for a given part — a key trust/differentiation component per the blueprint's SEO strategy (crawlable text, not an image).

**Composition:** Section header "Compatible With" + repeated `CompatibilityListItem`, plus a closing line: *"Not sure if this fits? Confirm your model via WhatsApp"* linking a small `WhatsAppCTAInline` (sm variant) — addresses buyer anxiety directly at the point of doubt.

---

### 4.10 `RelatedPartsCarousel`
**Purpose:** Cross-sell component below the main PDP content ("Customers who bought this also needed...").

**Composition:** Section header + horizontally scrollable row of `ProductCard`s (mobile: swipe; desktop: arrow-controlled or 4-visible grid).

---

### 4.11 `TrustBar`
**Purpose:** Sitewide trust-signal strip — appears on Home (prominent) and as a condensed version near PDP CTAs.

**Composition:** Row of `TrustBadgeItem` (Genuine Parts / Warranty / Countrywide Delivery / [4th slot optional, e.g. M-Pesa accepted]).

**Responsive behavior:** Mobile — horizontal scroll or 2x2 grid; Desktop — single row, evenly spaced.

---

### 4.12 `TestimonialCarousel`
**Purpose:** Social proof section, appears on Home and optionally on high-traffic category pages.

**Composition:** Repeated `TestimonialCard`, swipeable on mobile, 3-across static or auto-rotating on desktop.

---

### 4.13 `FAQAccordion`
**Purpose:** Full FAQ page content, and embeddable condensed versions (e.g., 3 relevant FAQs on a PDP — "Do you offer warranty?" near a battery listing).

**Composition:** Repeated `FAQItem`, optionally grouped under category headers (Shipping / Payment / Warranty / Compatibility) on the full FAQ page.

---

### 4.14 `RepairHelpArticleTemplate`
**Purpose:** Structural wrapper for blog/SEO content — not the content itself, but the reusable shell.

**Composition:** `Breadcrumb` → `H1` → intro paragraph → body content blocks → **mandatory embedded CTA block**: "Think this is your issue? Here's the part you need" linking to 2–3 relevant `ProductCard`s inline within the article body (per blueprint's internal linking strategy, Section 12) → `WhatsAppCTAInline` at article end.

---

### 4.15 `TechnicianCTABlock`
**Purpose:** Distinct conversion path for the bulk/trade segment, per blueprint Section 14 (technicians need a different CTA than individual buyers).

**Composition:** Headline ("Bulk pricing for technicians & businesses") + short supporting copy + `WhatsAppCTAInline` with a distinct pre-filled message template ("Hi, I'm a technician interested in bulk pricing...").

**Relationships:** Appears on the dedicated Technicians page and as a smaller embedded variant on relevant category pages (Batteries, Screens, Keyboards — the highest-volume repair parts per the blueprint).

---

### 4.16 `StickyWhatsAppBar`
**Purpose:** The single most important conversion organism on mobile — persistent, always-visible action bar.

**Composition:** Fixed bottom bar, full-width, `elevation-2`. Contains `WhatsAppCTAInline` (context-aware: generic "Chat with us" on browse pages, product-specific pre-filled message when a PDP is active) + optional `Icon`(phone) as a secondary compact action beside it.

**Behavior:** Always visible, does not hide on scroll (unlike Header, which may condense) — this is intentional per the blueprint's "always one tap away" conversion rule. z-index = `z-sticky`.

**Desktop equivalent:** `FloatingWhatsAppButton` — circular floating action button, bottom-right, same underlying `WhatsAppCTAInline` logic, expands to show label on hover.

---

### 4.17 `Footer`
**Purpose:** Sitewide crawlable link structure + secondary trust/contact info.

**Composition:** Column groups — Shop by Part (all 7 categories) / Shop by Brand (top brands) / Company (About, FAQ, Contact) / Contact info block (phone, WhatsApp, location, hours) → bottom bar (copyright, minimal legal links).

**Responsive behavior:** Desktop — 4-column grid. Mobile — stacked accordion groups (collapsed by default) to avoid an overwhelming wall of links on small screens.

---

### 4.18 `EmptyState`
**Purpose:** Reusable "nothing here" component — zero search results, zero filter matches, out-of-stock category.

**Composition:** `Icon` (lg, muted) + short message + optional `Button` (e.g., "Clear Filters" or "Ask us on WhatsApp — we may still have it").

**Relationships:** Used inside `ProductGrid`, `SearchBar` dropdown.

---

### 4.19 `ContactForm`
**Purpose:** Fallback contact method for the minority not using WhatsApp.

**Composition:** `Input` (name), `Input` (phone/email), `Input`/textarea (message), `Button` (primary, submit).

**Note per blueprint:** explicitly secondary to WhatsApp — never styled or positioned to compete with the primary CTA.

---

## 5. Component Relationship Map

```
Header
 ├── NavItem (×n)
 ├── SearchBar
 │    └── EmptyState (mini, no-results variant)
 └── MobileNavDrawer
      └── NavItem (×n, accordion-grouped)

PDPLayout (page-level composition, not itself a component)
 ├── Breadcrumb
 ├── PDPGallery
 ├── PDPActionPanel
 │    ├── Badge (×n)
 │    ├── Price
 │    ├── WhatsAppCTAInline → Button(whatsapp)
 │    ├── Button(secondary — call)
 │    └── TrustBadgeItem (×2, condensed)
 ├── SpecTable
 │    └── SpecRow (×n)
 ├── CompatibilityTable
 │    ├── CompatibilityListItem (×n)
 │    └── WhatsAppCTAInline (sm)
 ├── RelatedPartsCarousel
 │    └── ProductCard (×n)
 ├── FAQAccordion (condensed, 2–3 items)
 └── StickyWhatsAppBar (persistent, mobile)

CategoryPageLayout
 ├── Breadcrumb
 ├── FilterSidebar / FilterDrawer
 │    └── FilterChip (×n, feeds ActiveFiltersBar)
 ├── ProductGrid
 │    ├── ProductCard (×n)
 │    │    ├── Badge, Tag, Price, WhatsAppCTAInline
 │    └── EmptyState
 └── StickyWhatsAppBar

Footer
 └── NavItem groups (×4 columns)
```

**Key structural rule:** `WhatsAppCTAInline` is the most re-entrant component in the system — it appears inside `ProductCard`, `PDPActionPanel`, `CompatibilityTable`, `StickyWhatsAppBar`, `TechnicianCTABlock`, and `RepairHelpArticleTemplate`. Any change to its behavior (message templating logic, styling) propagates everywhere by design — this is the component the whole conversion strategy hinges on, so it must never be locally overridden per-page.

---

## 6. States Matrix (Summary Reference)

| Component | Default | Hover | Loading | Empty/Error | Disabled |
|---|---|---|---|---|---|
| Button | ✓ | ✓ (desktop) | ✓ (spinner) | — | ✓ |
| ProductCard | ✓ | ✓ (desktop) | ✓ (skeleton) | — | out-of-stock variant |
| SearchBar | ✓ | — | ✓ (skeleton rows) | ✓ (EmptyState) | — |
| FilterSidebar | ✓ | — | — | ✓ (0 results → ProductGrid EmptyState) | section disabled until parent selected |
| Select | ✓ | ✓ | — | — | ✓ (dependent selects) |
| ProductGrid | ✓ | — | ✓ (n skeleton cards) | ✓ (EmptyState) | — |
| Input | ✓ | — | — | ✓ (error text) | ✓ |
| FAQItem | collapsed | ✓ | — | — | — |

---

## 7. Responsive Behavior Summary

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Header | Logo + search icon + hamburger | Same as mobile or partial nav reveal | Full nav + search + phone + WhatsApp CTA |
| ProductGrid | 2-col | 3-col | 4-col |
| FilterSidebar | Bottom-sheet Drawer | Bottom-sheet Drawer or persistent column (context-dependent) | Persistent left column |
| PDPGallery | Swipeable carousel + dots | Thumbnail column begins | Thumbnail column + large image |
| PDPActionPanel | Full-width, stacked below gallery | Same | Side-by-side with gallery |
| FindMyPartWizard | Vertical steps, one active at a time | Same or hybrid | Horizontal inline steps |
| Footer | Accordion groups | 2-col | 4-col |
| StickyWhatsAppBar | Fixed bottom bar | Fixed bottom bar (or transitions to floating button at tablet breakpoint) | Floating button, bottom-right |

---

## 8. Component Library File Structure (for implementation phase)

```
components/
├── tokens/
│   ├── colors.css
│   ├── spacing.css
│   ├── typography.css
│   ├── elevation.css
│   └── motion.css
│
├── atoms/
│   ├── Button/
│   ├── Badge/
│   ├── Tag/
│   ├── Icon/
│   ├── Price/
│   ├── Input/
│   ├── Select/
│   ├── Divider/
│   └── SkeletonBlock/
│
├── molecules/
│   ├── ProductCard/
│   ├── FilterChip/
│   ├── NavItem/
│   ├── Breadcrumb/
│   ├── SpecRow/
│   ├── CompatibilityListItem/
│   ├── TrustBadgeItem/
│   ├── TestimonialCard/
│   ├── FAQItem/
│   ├── SearchBar/
│   └── WhatsAppCTAInline/
│
├── organisms/
│   ├── Header/
│   ├── MobileNavDrawer/
│   ├── ProductGrid/
│   ├── FilterSidebar/
│   ├── FindMyPartWizard/
│   ├── PDPGallery/
│   ├── PDPActionPanel/
│   ├── SpecTable/
│   ├── CompatibilityTable/
│   ├── RelatedPartsCarousel/
│   ├── TrustBar/
│   ├── TestimonialCarousel/
│   ├── FAQAccordion/
│   ├── RepairHelpArticleTemplate/
│   ├── TechnicianCTABlock/
│   ├── StickyWhatsAppBar/
│   ├── Footer/
│   ├── EmptyState/
│   └── ContactForm/
│
└── patterns/            (documented compositions, not new components)
    ├── PDPLayout.md
    ├── CategoryPageLayout.md
    ├── HomeLayout.md
    └── ArticleLayout.md
```

---

## Summary: Why This Scales

- **Every page in the site can be assembled entirely from the 9 atoms, 11 molecules, and 19 organisms defined above** — no page in the blueprint's architecture requires a component that doesn't already exist here.
- **`WhatsAppCTAInline` is the conversion spine of the system** — its consistent presence and behavior across every organism is what operationalizes the blueprint's "WhatsApp as single conversion path" strategy at the component level.
- **Mobile-first specs with documented desktop overrides** mean no component needs to be redesigned per breakpoint — only re-arranged.
- **The states matrix and responsive table (Sections 6–7) are the acceptance criteria** for any future engineer or designer building these components — a component isn't "done" until every applicable state and breakpoint from these tables is implemented.

Next step once this is approved: wireframe the three core page layouts (Home, Category, PDP) as pure compositions of the organisms/molecules defined here — no new components should be needed at that stage.
