#!/usr/bin/env node
'use strict';
/**
 * Usage:
 *   node generate.js category data/laptop-batteries.category.json  -> out/shop/laptop-batteries/index.html
 *   node generate.js pdp      data/hp-elitebook-840-g3-g4.pdp.json -> out/<product.url>/index.html
 *   node generate.js all                                            -> generate every *.category.json and *.pdp.json in data/
 *
 * Data files are merged on top of data/shared.json (store info + full nav
 * lists), so each per-page file only needs to describe what's different.
 */

const fs = require('fs');
const path = require('path');
const { render } = require('./lib/engine.js');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR = path.join(ROOT, 'out');
// One level up from templates/ is the repo root that GitHub Pages actually
// serves (index.html, css/, js/, shop/, brand/ at the top level).
const SITE_ROOT = path.resolve(ROOT, '..');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function deepMerge(base, override) {
  if (Array.isArray(override)) return override;
  if (typeof override !== 'object' || override === null) return override;
  const out = Object.assign({}, base);
  for (const key of Object.keys(override)) {
    if (
      typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key]) &&
      typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])
    ) {
      out[key] = deepMerge(base[key], override[key]);
    } else {
      out[key] = override[key];
    }
  }
  return out;
}

function buildNav(shared, activePartSlug, activeBrandSlug) {
  const nav_parts = shared.parts.map(p => ({ slug: p.slug, name: p.name, url: p.url, icon: p.icon, active: p.slug === activePartSlug }));
  const nav_brands = shared.brands.map(b => ({ slug: b.slug, name: b.name, url: b.url, active: b.slug === activeBrandSlug }));
  return { nav_parts, nav_brands, brands: shared.brands.map(b => ({ slug: b.slug, name: b.name })) };
}

// ---------------------------------------------------------------------------
// Deploy: copy everything generated into templates/out/ up into the repo
// root, which is what GitHub Pages actually serves. `node generate.js all`
// only ever writes to templates/out/ (a git-ignored scratch folder) — it
// never touches the real index.html / css / js / shop / brand at the repo
// root, so a plain "generate + push" silently leaves the live site stale.
// `node generate.js deploy` (or `publish`, which runs generate + deploy in
// one shot) closes that gap.
// ---------------------------------------------------------------------------

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function deploy() {
  if (!fs.existsSync(OUT_DIR)) {
    console.log('deploy   -> SKIPPED (templates/out/ is empty — run `node generate.js all` first)');
    return;
  }
  let fileCount = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else fileCount++;
    }
  };
  walk(OUT_DIR);

  copyRecursive(OUT_DIR, SITE_ROOT);
  console.log(`deploy   -> copied ${fileCount} files from templates/out/ to ${SITE_ROOT}`);
  console.log('           review with `git status`, then git add / commit / push as usual.');
}

function writeOut(relUrl, html) {
  // relUrl like "/shop/laptop-batteries/" -> out/shop/laptop-batteries/index.html
  const clean = relUrl.replace(/^\//, '').replace(/\/$/, '');
  const dir = path.join(OUT_DIR, clean);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html, 'utf8');
  return file;
}

function generateCategory(dataFile) {
  const shared = loadJson(path.join(DATA_DIR, 'shared.json'));
  const page = loadJson(dataFile);
  const tpl = fs.readFileSync(path.join(ROOT, 'category.template.html'), 'utf8');

  const nav = buildNav(shared, page.category.slug, null);
  const context = deepMerge({ store: shared.store }, {
    store: shared.store,
    ...nav,
    ...page,
  });

  const html = render(tpl, context);
  const outFile = writeOut(page.category.url, html);
  console.log('category ->', outFile);
}

function generatePdp(dataFile) {
  const shared = loadJson(path.join(DATA_DIR, 'shared.json'));
  const page = loadJson(dataFile);
  const tpl = fs.readFileSync(path.join(ROOT, 'pdp.template.html'), 'utf8');

  const nav = buildNav(shared, page.category.slug, page.product.brand_slug);
  const context = deepMerge({ store: shared.store }, {
    store: shared.store,
    ...nav,
    ...page,
  });

  const html = render(tpl, context);
  const outFile = writeOut(page.product.url, html);
  console.log('pdp      ->', outFile);
}

// ---------------------------------------------------------------------------
// Brand pages: auto-derived from the existing *.pdp.json files, no separate
// data files to author/maintain. Groups every product belonging to a brand
// into sections by part-type category, per
// laptop-parts-kenya-blueprint.md ("Brand pages -> all PDPs under that
// brand, grouped by part type").
// ---------------------------------------------------------------------------

function loadAllPdpPages() {
  return fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.pdp.json'))
    .map(f => loadJson(path.join(DATA_DIR, f)));
}

function stockInfoFromBadges(badges) {
  const stockBadge = (badges || []).find(b => /badge--(in-stock|low-stock|out-of-stock)/.test(b.class));
  if (!stockBadge) return { stock: 'in_stock', badge_class: 'badge--in-stock', badge_label: 'In Stock' };
  let stock = 'in_stock';
  if (stockBadge.class.includes('low-stock')) stock = 'low_stock';
  else if (stockBadge.class.includes('out-of-stock')) stock = 'out_of_stock';
  return { stock, badge_class: stockBadge.class, badge_label: stockBadge.label };
}

function mapPdpToProductCard(page) {
  const product = page.product;
  const { stock, badge_class, badge_label } = stockInfoFromBadges(product.badges);
  const cover = (product.images && product.images[0]) || {};
  const cta_class = stock === 'out_of_stock' ? 'btn--secondary' : 'btn--whatsapp';
  const cta_label = stock === 'out_of_stock' ? 'Ask About Restock' : 'Order on WhatsApp';
  return {
    name: product.name,
    url: product.url,
    image: cover.src || '',
    alt: cover.alt || product.name,
    badge_class,
    badge_label,
    stock,
    tags: (product.compatible_models || []).slice(0, 2),
    price: product.price,
    cta_class,
    cta_label,
    whatsapp_text: product.order_whatsapp_text,
  };
}

function buildBrandSections(shared, brandSlug) {
  const pages = loadAllPdpPages().filter(p => p.product && p.product.brand_slug === brandSlug);
  const byCategory = new Map(); // slug -> { slug, name, category_url, products: [] }

  for (const page of pages) {
    const catSlug = page.category.slug;
    if (!byCategory.has(catSlug)) {
      byCategory.set(catSlug, {
        slug: catSlug,
        name: page.category.name,
        category_url: page.category.url,
        products: [],
      });
    }
    byCategory.get(catSlug).products.push(mapPdpToProductCard(page));
  }

  // Order sections to match the canonical nav order in shared.json, not
  // file-scan order, so every brand page reads in the same category sequence.
  const ordered = [];
  for (const part of shared.parts) {
    if (byCategory.has(part.slug)) ordered.push(byCategory.get(part.slug));
  }
  return ordered;
}

function generateBrand(brandSlug) {
  const shared = loadJson(path.join(DATA_DIR, 'shared.json'));
  const brandInfo = shared.brands.find(b => b.slug === brandSlug);
  if (!brandInfo) {
    console.log('brand    -> SKIPPED (unknown brand slug in shared.json):', brandSlug);
    return;
  }

  const sections = buildBrandSections(shared, brandSlug);
  if (sections.length === 0) {
    console.log('brand    -> SKIPPED (no products found for brand):', brandSlug);
    return;
  }

  const resultCount = sections.reduce((sum, s) => sum + s.products.length, 0);
  const tpl = fs.readFileSync(path.join(ROOT, 'brand.template.html'), 'utf8');
  const nav = buildNav(shared, null, brandSlug);

  const context = {
    store: shared.store,
    ...nav,
    meta: {
      title: `${brandInfo.name} Laptop Parts in Kenya | ${shared.store.name}`,
      description: `Genuine replacement ${brandInfo.name} laptop parts — batteries, chargers, screens, keyboards, hinges, fans and casings. In-stock pricing in KES, warranty included, order on WhatsApp.`,
    },
    og: {
      title: `${brandInfo.name} Laptop Parts | ${shared.store.name}`,
      description: `Genuine ${brandInfo.name} laptop parts, in-stock pricing, warranty included, order on WhatsApp.`,
    },
    brand: {
      slug: brandInfo.slug,
      name: brandInfo.name,
      url: brandInfo.url,
      description: `Every genuine ${brandInfo.name} part we stock, grouped by category. Each listing shows exact compatible models, stock status and price before you message us.`,
      result_count: resultCount,
      section_count: sections.length,
      sections,
    },
    technician_cta: {
      heading: `Repair Technician? Get Bulk Pricing on ${brandInfo.name} Parts.`,
      body: 'Volume pricing, priority stock holds and credit terms for repair shops and businesses.',
      cta_label: 'Chat About Bulk Pricing',
      whatsapp_text: `Hi%2C%20I%27m%20a%20technician%20interested%20in%20bulk%20pricing%20on%20${encodeURIComponent(brandInfo.name)}%20parts.`,
    },
    faq_heading: `${brandInfo.name} Parts Questions`,
    faqs: [
      { question: `How do I know this part fits my ${brandInfo.name} laptop?`, answer: "Each listing shows exact compatible models. If you're unsure of your laptop's exact model, send us a photo of the sticker under your laptop on WhatsApp and we'll confirm." },
      { question: 'Are these genuine or compatible parts?', answer: "It's stated clearly on each product page — new OEM-equivalent by default, with genuine originals where available." },
      { question: 'What warranty comes with these parts?', answer: 'Most parts carry a 6-month warranty, listed on the individual product page.' },
    ],
    sticky_whatsapp: {
      text: `Hi%2C%20I%27d%20like%20to%20order%20a%20${encodeURIComponent(brandInfo.name)}%20laptop%20part.`,
    },
  };

  const html = render(tpl, context);
  const outFile = writeOut(brandInfo.url, html);
  console.log('brand    ->', outFile, `(${resultCount} products, ${sections.length} categories)`);
}

function generateAllBrands() {
  const shared = loadJson(path.join(DATA_DIR, 'shared.json'));
  for (const brand of shared.brands) {
    generateBrand(brand.slug);
  }
}

function generateHome(dataFile) {
  const shared = loadJson(path.join(DATA_DIR, 'shared.json'));
  const page = loadJson(dataFile);
  const tpl = fs.readFileSync(path.join(ROOT, 'home.template.html'), 'utf8');

  // No part/brand is "active" in nav on the homepage.
  const nav = buildNav(shared, null, null);
  const context = deepMerge({ store: shared.store }, {
    store: shared.store,
    ...nav,
    ...page,
  });

  const html = render(tpl, context);
  const outFile = writeOut('/', html);
  console.log('home     ->', outFile);
}

function main() {
  const [, , cmd, arg] = process.argv;

  if (cmd === 'category' && arg) {
    generateCategory(path.resolve(arg));
  } else if (cmd === 'pdp' && arg) {
    generatePdp(path.resolve(arg));
  } else if (cmd === 'home') {
    generateHome(path.resolve(arg || path.join(DATA_DIR, 'home.json')));
  } else if (cmd === 'brand' && arg) {
    generateBrand(arg);
  } else if (cmd === 'brand') {
    generateAllBrands();
  } else if (cmd === 'all') {
    if (fs.existsSync(path.join(DATA_DIR, 'home.json'))) generateHome(path.join(DATA_DIR, 'home.json'));
    for (const f of fs.readdirSync(DATA_DIR)) {
      if (f.endsWith('.category.json')) generateCategory(path.join(DATA_DIR, f));
      if (f.endsWith('.pdp.json')) generatePdp(path.join(DATA_DIR, f));
    }
    // Brand pages are derived from the *.pdp.json files above, so they must
    // be generated after the loop, once every product has been read.
    generateAllBrands();
  } else if (cmd === 'deploy') {
    deploy();
  } else if (cmd === 'publish') {
    if (fs.existsSync(path.join(DATA_DIR, 'home.json'))) generateHome(path.join(DATA_DIR, 'home.json'));
    for (const f of fs.readdirSync(DATA_DIR)) {
      if (f.endsWith('.category.json')) generateCategory(path.join(DATA_DIR, f));
      if (f.endsWith('.pdp.json')) generatePdp(path.join(DATA_DIR, f));
    }
    generateAllBrands();
    deploy();
  } else {
    console.log('Usage:');
    console.log('  node generate.js home [data/home.json]');
    console.log('  node generate.js category <data-file.category.json>');
    console.log('  node generate.js pdp <data-file.pdp.json>');
    console.log('  node generate.js brand <brand-slug>   e.g. node generate.js brand hp');
    console.log('  node generate.js brand                generates every brand in data/shared.json');
    console.log('  node generate.js all                  generates home + every category/pdp/brand page (into templates/out/ only)');
    console.log('  node generate.js deploy                copies templates/out/ up into the repo root (index.html, css/, js/, shop/, brand/)');
    console.log('  node generate.js publish               runs "all" then "deploy" in one shot -- use this before git add/commit/push');
    process.exit(1);
  }
}

main();