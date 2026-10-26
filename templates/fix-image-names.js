#!/usr/bin/env node
'use strict';
/**
 * Fixes image references in data/*.json whose file is missing but exists with a different extension
 * (e.g. data says toshiba-charger-65w.jpg, the file is toshiba-charger-65w.webp). Only an exact name match is changed.
 *   node fix-image-names.js           preview
 *   node fix-image-names.js --write   apply
 */
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write');
const DATA = path.join(__dirname, 'data'), ROOT = path.resolve(__dirname, '..');
const EXT = ['.webp', '.jpg', '.jpeg', '.png'];
const IMG = /(\/?assets\/images\/[^"\s]+?)(\.(?:webp|jpe?g|png))/gi;
let changes = 0, files = 0;
for (const f of fs.readdirSync(DATA).filter(f => f.endsWith('.json'))) {
  const p = path.join(DATA, f); let s = fs.readFileSync(p, 'utf8'), n = 0;
  s = s.replace(IMG, (m, stem, ext) => {
    const full = path.join(ROOT, stem.replace(/^\//, '') + ext);
    if (fs.existsSync(full)) return m;
    for (const e of EXT) if (e !== ext.toLowerCase() && fs.existsSync(path.join(ROOT, stem.replace(/^\//, '') + e))) { n++; return stem + e; }
    return m;
  });
  if (n) { files++; changes += n; console.log((WRITE ? 'fixed    ' : 'would fix ') + f + '  (' + n + ')'); if (WRITE) fs.writeFileSync(p, s, 'utf8'); }
}
console.log(`\n${changes} image name(s) in ${files} file(s)${WRITE ? ' fixed' : ' can be fixed'}.`);
if (!WRITE) console.log('Preview only. Run "node fix-image-names.js --write" to apply.');
