'use strict';
/**
 * Adds product pages that exist but are not listed on any category page to the end of their category file.
 *   node add-orphans.js           preview: lists what would be added, changes nothing
 *   node add-orphans.js --write   adds them
 */
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write'), DATA = path.join(__dirname, 'data');
const load = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const files = fs.readdirSync(DATA);
const cats = {}, listed = new Set(), names = new Set();
const norm = n => String(n).toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, ' ').trim();
files.filter(f => f.endsWith('.category.json')).forEach(f => {
  const c = load(f); cats[c.category.slug] = { f, c };
  (c.products || []).forEach(p => { listed.add(p.url); names.add(c.category.slug + '|' + norm(p.name)); });
});
let added = 0; const skipped = [], dupes = [];
for (const f of files.filter(f => f.endsWith('.pdp.json'))) {
  const d = load(f), p = d.product;
  if (listed.has(p.url)) continue;
  const cat = cats[d.category && d.category.slug];
  if (!cat) { skipped.push(f + '  (no category file for "' + (d.category && d.category.slug) + '")'); continue; }
  if (names.has(cat.c.category.slug + '|' + norm(p.name))) { dupes.push(p.name + '  (' + f + ')'); continue; }
  names.add(cat.c.category.slug + '|' + norm(p.name));
  const models = p.compatible_models || [], img = (p.images || [])[0] || {}, badge = (p.badges || [])[0] || { class: 'badge--in-stock', label: 'In Stock' };
  const entry = {
    name: p.name, url: p.url, image: img.src || '', alt: img.alt || p.name, brand_slug: p.brand_slug || '',
    stock: 'in_stock', badge_class: badge.class, badge_label: badge.label, tags: models.slice(0, 2), price: p.price,
    cta_class: 'btn--whatsapp', cta_label: 'Order on WhatsApp', whatsapp_text: p.order_whatsapp_text, extra: false
  };
  if (models.length > 2) entry.tag_overflow = '+' + (models.length - 2) + ' more';
  cat.c.products.push(entry); cat.changed = true; added++;
  console.log((WRITE ? 'added ' : 'would add ') + cat.c.category.slug.padEnd(16) + p.name + '  KES ' + p.price);
}
if (WRITE) Object.values(cats).filter(x => x.changed).forEach(x => fs.writeFileSync(path.join(DATA, x.f), JSON.stringify(x.c, null, 2) + '\n', 'utf8'));
console.log(`\n${added} product(s) ${WRITE ? 'added to category pages' : 'would be added'}.`);
if (dupes.length) { console.log('\nNOT added, a product with the same name is already on the category page (probably a duplicate - delete its data file if so):'); dupes.forEach(s => console.log('  ' + s)); }
if (skipped.length) { console.log('\nSkipped:'); skipped.forEach(s => console.log('  ' + s)); }
if (!WRITE) console.log('\nPreview only. Check the list, then run "node add-orphans.js --write".');
