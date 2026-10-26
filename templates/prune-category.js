#!/usr/bin/env node
'use strict';
/**
 * Removes products from category files when they have no product page (*.pdp.json), so customers
 * never land on a 404 from a category page.
 *   node prune-category.js           preview
 *   node prune-category.js --write   apply (also saves removed entries to removed-from-categories.json)
 */
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write'), DATA = path.join(__dirname, 'data');
const files = fs.readdirSync(DATA);
const pages = new Set(files.filter(f => f.endsWith('.pdp.json')).map(f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')).product.url));
let n = 0; const saved = [];
for (const f of files.filter(f => f.endsWith('.category.json'))) {
  const p = path.join(DATA, f), c = JSON.parse(fs.readFileSync(p, 'utf8'));
  const gone = (c.products || []).filter(x => !pages.has(x.url));
  if (!gone.length) continue;
  gone.forEach(x => { n++; saved.push({ category: c.category.slug, ...x }); console.log((WRITE ? 'removed ' : 'would remove ') + c.category.slug.padEnd(15) + x.name + '  KES ' + x.price); });
  c.products = c.products.filter(x => pages.has(x.url));
  if (WRITE) fs.writeFileSync(p, JSON.stringify(c, null, 2) + '\n', 'utf8');
}
if (WRITE && saved.length) fs.writeFileSync(path.join(__dirname, 'removed-from-categories.json'), JSON.stringify(saved, null, 2) + '\n', 'utf8');
console.log(`\n${n} product(s) ${WRITE ? 'removed. A copy is saved in templates\\removed-from-categories.json so you can restore them later.' : 'would be removed.'}`);
if (!WRITE) console.log('Preview only. Run "node prune-category.js --write" to apply.');
