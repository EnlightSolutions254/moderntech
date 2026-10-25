// Usage: node generate-sitemap.js <build-output-dir> [domain]
// Example: node generate-sitemap.js ./dist zanatechnologies.co.ke
// Walks the built site, lists every page, writes sitemap.xml into that folder.
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.');
const domain = process.argv[3] || 'zanatechnologies.co.ke';
const skip = /^(404|thank-you|offline)\.html$/i;
const urls = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (!/^(assets|css|js|node_modules|\.)/.test(f.name)) walk(p); continue; }
    if (!f.name.endsWith('.html') || skip.test(f.name)) continue;
    let rel = path.relative(root, p).split(path.sep).join('/');
    rel = rel === 'index.html' ? '' : rel.replace(/(^|\/)index\.html$/, '$1');
    const html = fs.readFileSync(p, 'utf8');
    if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) continue;
    urls.push({ loc: `https://${domain}/${rel}`, lastmod: fs.statSync(p).mtime.toISOString().slice(0, 10) });
  }
})(root);
urls.sort((a, b) => a.loc.length - b.loc.length || a.loc.localeCompare(b.loc));
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') + `\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log(`sitemap.xml written with ${urls.length} URLs`);
