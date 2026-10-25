#!/usr/bin/env node
'use strict';
// Lists every line that still mentions warranty or the old brand name.
// Run from templates/:  node scan.js        (also scan the site root:  node scan.js ..)
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || __dirname);
const SKIP = new Set(['out', 'node_modules', '.git']);
const RE = /warrant|modern\s?tech/i;
let hits = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(f); continue; }
    if (!/\.(json|html|js|md|css|xml|txt)$/i.test(e.name) || /^(scan|rebrand)\.js$/.test(e.name)) continue;
    fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach((l, i) => {
      if (RE.test(l)) { hits++; console.log(`${path.relative(ROOT, f)}:${i + 1}  ${l.trim().slice(0, 150)}`); }
    });
  }
})(ROOT);
console.log(hits ? `\n${hits} line(s) still to fix.` : '\nClean: no warranty or Modern Tech mentions.');
