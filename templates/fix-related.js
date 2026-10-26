#!/usr/bin/env node
'use strict';
/**
 * Removes "related product" links that point to pages that do not exist, and lists category products that
 * have no product page. Run from the templates folder.
 *   node fix-related.js           preview
 *   node fix-related.js --write   apply (rewrites only files that change)
 */
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write'), DATA = path.join(__dirname, 'data');
const files = fs.readdirSync(DATA).filter(f => f.endsWith('.json'));
const pdps = files.filter(f => f.endsWith('.pdp.json'));
const pages = new Set(pdps.map(f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')).product.url));
let removed = 0, touched = 0;
for (const f of pdps) {
  const p = path.join(DATA, f), d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const rel = d.product.related || [], keep = rel.filter(r => pages.has(r.url));
  if (keep.length !== rel.length) {
    removed += rel.length - keep.length; touched++;
    console.log((WRITE ? 'fixed    ' : 'would fix ') + f + '  (-' + (rel.length - keep.length) + ')');
    d.product.related = keep;
    if (WRITE) fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  }
}
console.log(`\n${removed} dead related link(s) in ${touched} file(s)${WRITE ? ' removed' : ''}.`);
const nopage = [];
files.filter(f => f.endsWith('.category.json')).forEach(f => {
  (JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')).products || []).forEach(pr => { if (!pages.has(pr.url)) nopage.push(f.replace('.category.json', '') + '  ' + pr.name + '  ' + pr.url); });
});
if (nopage.length) { console.log('\nListed on a category page but NO product page (customers get a 404):'); nopage.forEach(x => console.log('  ' + x)); console.log('Send me those products\' *.pdp.json files, or remove them from the category file.'); }
if (!WRITE) console.log('\nPreview only. Run "node fix-related.js --write" to apply.');
