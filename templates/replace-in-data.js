'use strict';
const fs = require('fs'), path = require('path');
const [, , from, to] = process.argv, WRITE = process.argv.includes('--write'), DATA = path.join(__dirname, 'data');
if (!from || !to) { console.log('Usage: node replace-in-data.js "old" "new" [--write]'); process.exit(1); }
let total = 0;
for (const f of fs.readdirSync(DATA).filter(f => f.endsWith('.json'))) {
  const p = path.join(DATA, f), s = fs.readFileSync(p, 'utf8'), n = s.split(from).length - 1;
  if (!n) continue;
  total += n; console.log((WRITE ? 'fixed    ' : 'would fix ') + f + '  (' + n + ')');
  if (WRITE) fs.writeFileSync(p, s.split(from).join(to), 'utf8');
}
console.log(total + ' replacement(s)' + (WRITE ? ' made' : ' found') + '.');
