#!/usr/bin/env node
'use strict';
/**
 * For every missing image in broken-report.txt, suggests the closest existing file in assets/images/products
 * (same words, different spelling/extension), so you can rename instead of hunting.
 *   node templates/match-images.js          (run from the site folder after check-links.js)
 */
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'assets', 'images', 'products');
const have = fs.readdirSync(dir);
const tok = s => new Set(s.toLowerCase().replace(/\.(webp|jpe?g|png)$/, '').split(/[^a-z0-9]+/).filter(Boolean));
const rows = fs.readFileSync(path.join(__dirname, 'broken-report.txt'), 'utf8').split('\n').filter(Boolean)
  .map(l => l.split('\t')).filter(r => /\/assets\/images\/products\//.test(r[1]));
let sugg = 0, none = [];
for (const [n, url] of rows) {
  const name = url.split('/').pop(), a = tok(name);
  let best = null, bs = 0;
  for (const h of have) {
    const b = tok(h); let c = 0; a.forEach(t => { if (b.has(t)) c++; });
    const s = c / Math.max(a.size, b.size);
    if (s > bs) { bs = s; best = h; }
  }
  if (best && bs >= 0.6) { sugg++; console.log(`${name}\n   -> maybe ${best}  (${Math.round(bs * 100)}%)`); } else none.push(name);
}
console.log(`\n${sugg} with a likely match. ${none.length} with no similar file (the photo is probably not uploaded yet):`);
none.forEach(n => console.log('  ' + n));
