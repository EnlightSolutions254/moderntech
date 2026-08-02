# Reusable page templates: category listing + PDP

This turns `shop-laptop-batteries.html` and `pdp-hp-elitebook-840-g3-g4-battery.html`
into two data-driven templates, so the other 6 categories and every remaining
product page can be generated from a JSON file instead of hand-copying HTML.

Nothing about the visual design changed — every class, id, ARIA attribute and
structural comment from the originals is preserved. The only thing that
changed is that page-specific text (titles, copy, prices, product lists,
FAQs, nav "active" state, etc.) is now a `{{placeholder}}` filled in from a
JSON data file at build time.

## Files

```
templates/
  category.template.html   <- shop/*.html template (was shop-laptop-batteries.html)
  pdp.template.html        <- PDP template (was pdp-hp-elitebook-...html)
  generate.js              <- CLI: reads a template + JSON, writes finished HTML
  lib/engine.js             <- tiny dependency-free template engine (see below)
  data/
    shared.json                          <- store info + the full 7-part / 7-brand nav (used on every page)
    laptop-batteries.category.json       <- example data, reproduces the original category page
    hp-elitebook-840-g3-g4.pdp.json      <- example data, reproduces the original PDP
  out/                       <- generated HTML lands here (git-ignore this)
```

## Quick start

```bash
cd templates
node generate.js all
# -> out/shop/laptop-batteries/index.html
# -> out/shop/laptop-batteries/hp-elitebook-840-g3-g4/index.html
```

Or generate one page at a time:

```bash
node generate.js category data/laptop-batteries.category.json
node generate.js pdp      data/hp-elitebook-840-g3-g4.pdp.json
```

## Publishing to the live site (GitHub Pages)

**`templates/out/` is a scratch folder, not the live site.** GitHub Pages
serves the files at the *repo root* (`index.html`, `css/`, `js/`, `shop/`,
`brand/` one level up from `templates/`). Running `node generate.js all` only
writes into `templates/out/` — it does **not** touch those root files, so a
plain "generate, then commit, then push" will leave the live site showing
stale HTML/CSS even though `git push` succeeded.

Two commands close that gap:

```bash
# copy whatever is already in templates/out/ up into the repo root
node generate.js deploy

# regenerate everything AND copy it to the repo root, in one shot
node generate.js publish
```

`deploy` recursively copies every file under `templates/out/` into the
matching path at the repo root, overwriting anything already there (so
stale root files, like an out-of-date `css/styles.css`, get replaced). It
never deletes root files that aren't also present under `templates/out/`.

**Recommended workflow whenever you change a template or a data file:**

```bash
cd templates
node generate.js publish
cd ..
git status        # sanity-check what actually changed at the repo root
git add .
git commit -m "..."
git push origin main
```

After pushing, GitHub Pages typically rebuilds within a minute. If the
browser still shows old CSS, hard-refresh (Ctrl+Shift+R) or open a private
window — this is separate from the deploy step and is just browser/CDN
caching.

I diffed both generated files against your originals — the only differences
are harmless whitespace/indentation (loop bodies aren't re-indented) and two
intentional tweaks: the "Load More" button now says the full category name,
and the PDP's desktop hero image reuses `images[0].alt` instead of a
separate, slightly different alt string. Everything else — markup, classes,
IDs, ARIA, JSON-LD — is byte-identical.

## Adding a new category (e.g. Chargers & Adapters)

1. Copy `data/laptop-batteries.category.json` → `data/chargers.category.json`.
2. Fill in `meta`, `og`, `category` (slug/url/name/description/result_count),
   the `products` array, `technician_cta` (or delete the key entirely to hide
   that block — it's wrapped in `{{#if technician_cta}}`), `faqs`, and the two
   WhatsApp default-message strings (`empty_state`, `sticky_whatsapp`).
3. `node generate.js category data/chargers.category.json`

You do **not** need to touch `nav_parts` / `nav_brands` / the brand filter
list — those come from `data/shared.json` automatically, and the generator
marks the right nav item `aria-current="page"` based on `category.slug`.

## Adding a new PDP

1. Copy `data/hp-elitebook-840-g3-g4.pdp.json` → `data/<new-slug>.pdp.json`.
2. Fill in `meta`, `og`, `category` (which category this product belongs to —
   drives the breadcrumb and the "active" brand/part nav highlighting),
   `delivery_note`, `faqs`, and the full `product` object (images, badges,
   specs, compatible models, related products).
3. `node generate.js pdp data/<new-slug>.pdp.json`

## WhatsApp message strings

All `*_whatsapp_text` / `*.text` fields must already be URL-encoded (spaces
as `%20`, commas as `%2C`, etc.) — copy the pattern from the example files.
This keeps the template dumb and avoids needing a JS encoding step, and it's
what the original hand-written pages already did.

## The template syntax

The engine (`lib/engine.js`, ~150 lines, zero dependencies) supports just
enough Mustache-style syntax for this site:

| Syntax | Meaning |
|---|---|
| `{{store.name}}` | prints a value, resolved by dotted path against the JSON data |
| `{{product.images.0.src}}` | numeric path segments index into arrays |
| `{{#each products}} ... {{/each}}` | loop over an array |
| `{{this}}` / `{{this.name}}` | current loop item / a field on it |
| `{{#each this.tags}}{{this}}{{/each}}` | nested loop over a plain string array |
| `{{@index1}}` / `{{@index}}` | 1-based / 0-based loop position |
| `{{@first}}` / `{{@last}}` | booleans, true on first/last item |
| `{{#if technician_cta}} ... {{else}} ... {{/if}}` | conditional block (optional `{{else}}`) |

`node generate.js` merges `data/shared.json` (store phone/domain/name + the
full nav) with your per-page JSON file and renders the template — no build
step beyond Node.js is required, and nothing here needs `npm install`.

## Notes / things worth knowing before scaling to all 7 categories

- **Filenames**: the generator writes `out/<url>/index.html`, mirroring the
  clean-URL structure already used in the source files (`/shop/.../`,
  `/shop/.../hp-elitebook-.../`). Copy the finished files into your real
  site folders (alongside `css/styles.css` and `js/main.js`, unchanged).
- **`category.description`** is the single supporting paragraph under the H1
  — for categories that list every brand, keep the "HP, Dell, Lenovo..."
  pattern from the battery page; for categories with fewer relevant brands
  (e.g. Hinges), just write accurate copy — nothing in the template assumes
  a specific brand list here.
- **`technician_cta`** is optional — per Component Architecture §4.15 it
  should only appear on the highest-volume repair parts. Omit the key (or
  set it to `null`/`false`) for lower-volume categories like Casings.
- **Product `extra: true`** cards render with `is-extra hidden` and are
  revealed by `js/main.js`'s "Load More" handler — no JS changes needed,
  since the CSS classes/ids main.js targets (`#product-grid`, `.is-extra`,
  `#load-more`, filter checkbox `name="brand"`, etc.) are untouched.
- **PDP `product.images`** — add as many as you have; the mobile carousel,
  desktop thumbnail rail, and zoom modal all loop off the same array, so a
  1-image or 5-image product both work without template changes.
