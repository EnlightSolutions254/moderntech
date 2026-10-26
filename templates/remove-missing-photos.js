#!/usr/bin/env node
'use strict';
/**
 * Removes every product whose main photo is a .jpg/.jpeg that is NOT on the site.
 * Products whose .jpg exists are kept. Run from the templates folder.
 *   node remove-missing-photos.js           preview (lists what would go)
 *   node remove-missing-photos.js --write   apply
 * On --write it: moves the product's data file to templates\removed-products\ (backup), removes it from the
 * category pages, deletes its built page folder in the site folder, and drops any "related" links to it.
 */
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write');
const DATA = path.join(__dirname, 'data'), SITE = path.resolve(__dirname, '..'), BACKUP = path.join(__dirname, 'removed-products');
const load = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const pdps = fs.readdirSync(DATA).filter(f => f.endsWith('.pdp.json'));
const gone = new Map();   // url -> file
for (const f of pdps) {
  const d = load(path.join(DATA, f)), img = d.product.images && d.product.images[0];
  if (!img || !/\.jpe?g$/i.test(img.src)) continue;
  if (fs.existsSync(path.join(SITE, img.src.replace(/^\//, '')))) continue;
  gone.set(d.product.url, f);
  console.log((WRITE ? 'removed ' : 'would remove ') + d.category.slug.padEnd(15) + d.product.name.replace(/&amp;/g, '&') + '  KES ' + d.product.price);
}
// products that stay but list extra .jpg photos that are not on the site: those extra photos are dropped
const extras = [];
for (const f of pdps) {
  if ([...gone.values()].includes(f)) continue;
  const d = load(path.join(DATA, f)), imgs = d.product.images || [];
  const bad = imgs.slice(1).filter(i => /\.jpe?g$/i.test(i.src) && !fs.existsSync(path.join(SITE, i.src.replace(/^\//, ''))));
  if (bad.length) extras.push({ f, bad });
}
if (extras.length) console.log(`\n${extras.reduce((n, e) => n + e.bad.length, 0)} missing extra .jpg photo(s) on ${extras.length} product(s) that stay ${WRITE ? 'were dropped' : 'would be dropped'}.`);
if (WRITE) for (const e of extras) {
  const p = path.join(DATA, e.f), d = load(p), badSrc = new Set(e.bad.map(i => i.src));
  d.product.images = d.product.images.filter((i, n) => n === 0 || !badSrc.has(i.src));
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
}
console.log(`\n${gone.size} product(s) ${WRITE ? 'removed' : 'would be removed'}; ${pdps.length - gone.size} stay.`);
if (WRITE && gone.size) {
  fs.mkdirSync(BACKUP, { recursive: true });
  for (const [url, f] of gone) {
    fs.renameSync(path.join(DATA, f), path.join(BACKUP, f));
    const dir = path.join(SITE, url.replace(/^\/|\/$/g, '').split('/').join(path.sep));
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
  for (const f of fs.readdirSync(DATA).filter(f => f.endsWith('.json'))) {
    const p = path.join(DATA, f), d = load(p); let ch = false;
    if (Array.isArray(d.products)) { const k = d.products.filter(x => !gone.has(x.url)); if (k.length !== d.products.length) { d.products = k; ch = true; } }
    if (d.product && Array.isArray(d.product.related)) { const k = d.product.related.filter(x => !gone.has(x.url)); if (k.length !== d.product.related.length) { d.product.related = k; ch = true; } }
    if (ch) fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  }
  console.log('Backups are in templates\\removed-products\\ . Now run: node generate.js publish');
} else if (!WRITE) console.log('Preview only. Run "node remove-missing-photos.js --write" to apply.');
