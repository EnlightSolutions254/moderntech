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
  } else if (cmd === 'all') {
    if (fs.existsSync(path.join(DATA_DIR, 'home.json'))) generateHome(path.join(DATA_DIR, 'home.json'));
    for (const f of fs.readdirSync(DATA_DIR)) {
      if (f.endsWith('.category.json')) generateCategory(path.join(DATA_DIR, f));
      if (f.endsWith('.pdp.json')) generatePdp(path.join(DATA_DIR, f));
    }
  } else {
    console.log('Usage:');
    console.log('  node generate.js home [data/home.json]');
    console.log('  node generate.js category <data-file.category.json>');
    console.log('  node generate.js pdp <data-file.pdp.json>');
    console.log('  node generate.js all');
    process.exit(1);
  }
}

main();
