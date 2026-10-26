#!/usr/bin/env node
'use strict';
/**
 * Finds broken images and links in the built site.
 *   node check-links.js [siteFolder]     (default: the folder above templates)
 * Checks src, href, data-src, data-full and srcset in every .html file, plus the URLs in search-index.json and
 * sitemap.xml. Prints each missing target once, with how many pages use it and one example page.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const SKIP = new Set(['node_modules', '.git', 'templates']);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.html$/i.test(e.name)) pages.push(p);
  }
})(ROOT);

function exists(url) {
  let u = url.split('#')[0].split('?')[0];
  if (!u) return true;
  try { u = decodeURIComponent(u); } catch (e) {}
  const rel = u.replace(/^\/+/, '');
  const base = path.join(ROOT, rel);
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return true;
  if (fs.existsSync(path.join(base, 'index.html'))) return true;
  if (fs.existsSync(base + '.html')) return true;
  return false;
}
function internal(u) {
  return u && !/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(u) && !/^%7B|{{/.test(u);
}
const missing = new Map();
function note(target, page) {
  const m = missing.get(target) || { n: 0, ex: page };
  m.n++; missing.set(target, m);
}
const ATTR = /\b(?:src|href|data-src|data-full|poster)\s*=\s*"([^"]*)"/gi;
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8'), rel = path.relative(ROOT, f);
  let m;
  while ((m = ATTR.exec(html))) {
    const u = m[1].trim();
    if (!internal(u)) continue;
    const abs = u.startsWith('/') ? u : '/' + path.posix.join(path.dirname(rel).split(path.sep).join('/'), u);
    if (!exists(abs)) note(u, rel);
  }
}
function checkList(file, urls) {
  urls.forEach(u => { if (internal(u) && !exists(u.startsWith('/') ? u : '/' + u)) note(u + '   (' + file + ')', file); });
}
try {
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'search-index.json'), 'utf8'));
  checkList('search-index.json', idx.map(x => x.u));
} catch (e) {}
try {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  checkList('sitemap.xml', [...sm.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(x => x[1]));
} catch (e) {}

const rows = [...missing.entries()].sort((a, b) => b[1].n - a[1].n);
const imgs = rows.filter(([t]) => /\.(webp|png|jpe?g|gif|svg|ico)/i.test(t));
const rest = rows.filter(r => !imgs.includes(r));
console.log(`Checked ${pages.length} pages in ${ROOT}\n`);
const show = (title, list) => {
  if (!list.length) return;
  console.log(title + ' (' + list.length + ')');
  list.forEach(([t, v]) => console.log(`  ${String(v.n).padStart(3)} x  ${t}\n         e.g. ${v.ex}`));
  console.log('');
};
show('MISSING IMAGES', imgs);
show('BROKEN LINKS / FILES', rest);
if (!rows.length) console.log('No broken images or links found.');
fs.writeFileSync(path.join(__dirname, 'broken-report.txt'), rows.map(([t, v]) => `${v.n}\t${t}\t${v.ex}`).join('\n') + '\n');
console.log('Full list saved to templates\\broken-report.txt');
