#!/usr/bin/env node
'use strict';
/**
 * Converts the product photos that exist as .jpg/.jpeg to .webp and points the site at the new files.
 *   npm install sharp            (once, inside the templates folder)
 *   node convert-jpg-to-webp.js           preview
 *   node convert-jpg-to-webp.js --write   convert and update references
 * Only assets/images/products is touched. The original .jpg files are kept (delete them yourself once you have
 * checked the site). placeholder-*.jpg is skipped because the site uses it as the fallback image.
 * Photos that do not exist cannot be converted, and stay as .jpg references (use remove-missing-photos.js for those).
 */
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write');
let sharp; try { sharp = require('sharp'); } catch (e) { console.log('Run "npm install sharp" in this folder first.'); process.exit(1); }
const SITE = path.resolve(__dirname, '..'), PRODUCTS = path.join(SITE, 'assets', 'images', 'products');
const jpgs = fs.readdirSync(PRODUCTS).filter(f => /\.jpe?g$/i.test(f) && !/^placeholder-/i.test(f));
(async () => {
  const done = [];
  let before = 0, after = 0;
  for (const f of jpgs) {
    const src = path.join(PRODUCTS, f), out = path.join(PRODUCTS, f.replace(/\.jpe?g$/i, '.webp'));
    if (fs.existsSync(out)) { done.push(f); continue; }          // a webp with this name already exists: just point to it
    if (WRITE) { await sharp(src).rotate().webp({ quality: 82 }).toFile(out); before += fs.statSync(src).size; after += fs.statSync(out).size; }
    done.push(f);
  }
  console.log(`${jpgs.length} jpg photo(s) found in assets\\images\\products.`);
  if (!WRITE) { console.log('Preview only. Run "node convert-jpg-to-webp.js --write" to convert them.'); return; }
  const files = [];
  (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'out' && e.name !== 'removed-products') walk(p); } else if (/\.(json|html|css|js)$/i.test(e.name) && p.startsWith(path.join(__dirname)) ) files.push(p); } })(__dirname);
  files.push(...fs.readdirSync(path.join(SITE, 'js')).filter(f => f.endsWith('.js')).map(f => path.join(SITE, 'js', f)));
  let refs = 0;
  for (const p of files) {
    if (/convert-jpg-to-webp\.js$/.test(p)) continue;
    let s = fs.readFileSync(p, 'utf8'), n = 0;
    for (const f of done) {
      const re = new RegExp('(/|")' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=["\\s)?#])', 'g');
      s = s.replace(re, (m, pre) => { n++; return pre + f.replace(/\.jpe?g$/i, '.webp'); });
    }
    if (n) { refs += n; fs.writeFileSync(p, s, 'utf8'); }
  }
  console.log(`Converted. Photos: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB. ${refs} reference(s) updated.`);
  console.log('Next: node generate.js publish, then open a few pages to check the photos.');
})();
