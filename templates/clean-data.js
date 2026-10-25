#!/usr/bin/env node
'use strict';
/**
 * One-off cleanup for every data/*.json file (product pages, categories, pages).
 *   node clean-data.js           dry run: shows what would change, writes nothing
 *   node clean-data.js --write   applies the changes (only files that change are rewritten)
 *
 * It removes warranty: spec rows, badges, FAQ entries, and ", warranty included" phrases in titles and
 * descriptions. It also replaces "[Store Name]" and the old Modern Tech name with Zanatechnologies and drops
 * "Genuine" in front of "replacement / backlit / non-backlit". Safe to run more than once.
 * Anything it cannot fix on its own is listed under REVIEW so you can edit it by hand.
 */
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write');
const DATA = path.join(__dirname, 'data');
const W = /warrant/i;
const up = s => s.charAt(0).toUpperCase() + s.slice(1);

function fixString(s) {
  s = s.replace(/\[Store Name\]/g, 'Zanatechnologies')
       .replace(/Modern ?tech(nologies)?/gi, 'Zanatechnologies').replace(/Modern%20Tech/g, 'Zanatechnologies')
       .replace(/, warranty included(?=[,.])/gi, '')
       .replace(/\bWarranty included, (\w)/g, (m, c) => up(c))
       .replace(/\bWarranty included\.\s*/g, '')
       .replace(/(^|[.!?]\s+)Genuine\s+(replacement|backlit|non-backlit)/g, (m, p, w) => p + up(w))
       .replace(/\bgenuine\s+(replacement|backlit|non-backlit)/g, '$1');
  // any remaining sentence that mentions a warranty is dropped whole (split only at ". " so 15.6" etc. stay intact)
  if (W.test(s)) {
    const parts = s.split(/(?<=[.!?])\s+/);
    const kept = parts.filter(x => !W.test(x));
    if (kept.length) s = kept.join(' ');
  }
  return s.replace(/\s+([.,])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}
const DROPPABLE = new Set(['specs', 'badges', 'faqs']);   // only these lists may lose entries
function fix(x, key) {
  if (typeof x === 'string') return fixString(x);
  if (Array.isArray(x)) {
    const mapped = x.map(i => fix(i));
    return DROPPABLE.has(key) ? mapped.filter(i => !W.test(JSON.stringify(i))) : mapped;
  }
  if (x && typeof x === 'object') { const o = {}; for (const k of Object.keys(x)) o[k] = fix(x[k], k); return o; }
  return x;
}
function leftovers(x, pathStr, out) {
  if (typeof x === 'string') { if (W.test(x) || /modern ?tech|\[store name\]/i.test(x)) out.push(pathStr + ': ' + x.slice(0, 120)); }
  else if (Array.isArray(x)) x.forEach((v, i) => leftovers(v, pathStr + '[' + i + ']', out));
  else if (x && typeof x === 'object') Object.keys(x).forEach(k => leftovers(x[k], pathStr + '.' + k, out));
}

let changed = 0, review = [];
for (const f of fs.readdirSync(DATA).filter(f => f.endsWith('.json')).sort()) {
  const p = path.join(DATA, f), raw = fs.readFileSync(p, 'utf8'), data = JSON.parse(raw);
  const out = fix(data), left = []; leftovers(out, f, left); review.push(...left);
  const text = JSON.stringify(out, null, 2) + '\n';
  if (JSON.stringify(data) !== JSON.stringify(out)) {
    changed++; console.log((WRITE ? 'fixed    ' : 'would fix ') + f);
    if (WRITE) fs.writeFileSync(p, text, 'utf8');
  }
}
console.log(`\n${WRITE ? 'Fixed' : 'Would fix'} ${changed} file(s).`);
if (review.length) { console.log('\nREVIEW (edit by hand):'); review.forEach(r => console.log('  ' + r)); }
else console.log('Nothing left to review: no warranty or old-brand text in data/.');
if (!WRITE) console.log('\nDry run only. Run "node clean-data.js --write" to apply.');
