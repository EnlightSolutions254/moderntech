#!/usr/bin/env node
'use strict';
/**
 * Watermark product images with the Zanatechnologies mark.
 *
 * Run from the SITE ROOT (the folder that contains assets/, css/, templates/).
 * Every command is a DRY RUN (lists files, changes nothing) until you add --write.
 *
 * Pick the images ONE of these ways:
 *
 *   By two file names (best: matches how you sort by date modified in Explorer)
 *     node tools\watermark.js --newest "dell-mouse-ms111.webp" --oldest "wd-purple-surveillance-hdd-alt.webp"
 *     Selects every image whose date modified (down to the second) is between those
 *     two files, boundaries included.
 *
 *   By a time window (seconds are optional)
 *     node tools\watermark.js --from "2026-09-19 09:48:30" --to "2026-09-19 13:50"
 *
 *   Everything in the folder
 *     node tools\watermark.js --all
 *
 * Then add --write to apply it. To undo: node tools\watermark.js --restore --write
 *
 * Options
 *   --dir <folder>     images folder            (default: assets/images/products)
 *   --backup <folder>  where originals are kept (default: ../image-originals-backup,
 *                      i.e. OUTSIDE the site so unwatermarked files are never published)
 *   --size <0.1-1>     mark width as a fraction of the image width (default 0.42)
 *   --opacity <0-1>    multiply the mark's strength (default 1; try 0.7 for subtler)
 *   --mark <file>      which mark to use, from the tools folder (default watermark.png;
 *                      watermark-classic.png is the original bold, larger style, best
 *                      with --size 0.8)
 *   --write            actually make changes
 *
 * Safe to re-run: the mark is always applied to the backed-up ORIGINAL, so it never
 * doubles up. Each file keeps its original "date modified".
 */
const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('The "sharp" package is not installed yet.\nRun this once inside the tools folder:\n\n  cd tools\n  npm.cmd install\n');
  process.exit(1);
}

// ---------------------------------------------------------------- args
// Windows refuses to replace a file that libvips still has open, so never give sharp a
// file path for an image we are going to overwrite: read it into memory and hand over
// the bytes, and switch sharp's file cache off.
sharp.cache(false);

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };

if (flag('--help') || flag('-h')) {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^#!.*\n/, '').replace(/^\/\*\*?\n?/, ''));
  process.exit(0);
}

const WRITE = flag('--write');
const RESTORE = flag('--restore');
const ALL = flag('--all');
const CWD = process.cwd();
const DIR = path.resolve(CWD, opt('--dir', path.join('assets', 'images', 'products')));
const BACKUP = path.resolve(CWD, opt('--backup', path.join('..', 'image-originals-backup')));
const OPACITY = Math.min(1, Math.max(0.05, parseFloat(opt('--opacity', '1'))));
const SIZE = Math.min(1, Math.max(0.1, parseFloat(opt('--size', '0.42'))));
const WM_PATH = path.resolve(__dirname, opt('--mark', 'watermark.png'));
const WM_BUF = () => fs.readFileSync(WM_PATH);
const EXT = /\.(jpe?g|png|webp)$/i;

function die(msg) { console.error(msg); process.exit(1); }

function parseLocal(s, endOfWindow) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s || '');
  if (!m) die(`Could not read the time "${s}". Use the form "2026-09-19 13:50" or "2026-09-19 13:50:30".`);
  const hasSec = m[6] !== undefined;
  const sec = hasSec ? +m[6] : (endOfWindow ? 59 : 0);
  const ms = endOfWindow ? 999 : 0;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], sec, ms).getTime();
}

const fmt = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

if (!fs.existsSync(DIR)) die(`Images folder not found: ${DIR}\nRun this from the site root (the folder containing "assets"), or pass --dir.`);
if (!fs.existsSync(WM_PATH)) die(`Watermark file not found: ${WM_PATH}`);

// ---------------------------------------------------------------- restore
function restore() {
  if (!fs.existsSync(BACKUP)) die(`No backup folder found at ${BACKUP}`);
  const files = fs.readdirSync(BACKUP).filter((f) => EXT.test(f)).sort();
  console.log(`${files.length} backed-up original(s) in ${BACKUP}\n`);
  for (const f of files) {
    console.log('  restore', f);
    if (WRITE) {
      const src = path.join(BACKUP, f);
      const dst = path.join(DIR, f);
      const st = fs.statSync(src);
      fs.copyFileSync(src, dst);
      fs.utimesSync(dst, st.atime, st.mtime);
    }
  }
  console.log(WRITE ? `\nRestored ${files.length} file(s).` : '\nDry run only. Add --write to restore them.');
}

// Replace a file's contents. Windows can refuse a rename-over (EPERM) when the file is
// read-only or held open by another program, so: clear the read-only flag, try the
// safe write-then-rename, and if that is blocked write straight over the file.
// A leftover .tmp file is always cleaned up.
function replaceFile(target, buf) {
  try { fs.chmodSync(target, 0o666); } catch (e) { /* not fatal */ }
  const tmp = target + '.tmp';
  try {
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, target);
    return;
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch (e2) { /* nothing to clean */ }
    if (!['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
  }
  fs.writeFileSync(target, buf);
}

// Remove .tmp files left behind by an interrupted or failed earlier run.
function sweepTemp() {
  let n = 0;
  for (const f of fs.readdirSync(DIR)) {
    if (/\.(jpe?g|png|webp)\.tmp$/i.test(f)) {
      try { fs.unlinkSync(path.join(DIR, f)); n++; } catch (e) { /* ignore */ }
    }
  }
  if (n) console.log(`Cleaned up ${n} leftover .tmp file(s) from an earlier run.\n`);
}

// ---------------------------------------------------------------- watermark one file
async function stamp(file) {
  const target = path.join(DIR, file);
  const bak = path.join(BACKUP, file);
  const before = fs.statSync(target);

  const meta = await sharp(fs.readFileSync(target)).metadata();
  if (meta.width < 100 || meta.height < 100) return 'skipped (image under 100px)';

  if (!fs.existsSync(bak)) {
    fs.mkdirSync(BACKUP, { recursive: true });
    fs.copyFileSync(target, bak);
    if (fs.statSync(bak).size !== before.size) throw new Error('backup copy is a different size, stopped');
    fs.utimesSync(bak, before.atime, before.mtime);
  }

  // Always work from the untouched original.
  const { data, info } = await sharp(fs.readFileSync(bak)).rotate().toBuffer({ resolveWithObject: true });
  if (info.width < 100 || info.height < 100) return 'skipped (image under 100px)';

  let wm = sharp(WM_BUF()).resize({
    width: Math.round(info.width * SIZE),
    height: Math.round(info.height * SIZE),
    fit: 'inside',
  });
  if (OPACITY < 1) wm = wm.ensureAlpha().linear([1, 1, 1, OPACITY], [0, 0, 0, 0]);
  const wmBuf = await wm.png().toBuffer();

  let out = sharp(data).composite([{ input: wmBuf, gravity: 'center' }]);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.webp') out = out.webp({ quality: 90 });
  else if (ext === '.png') out = out.png({ compressionLevel: 9 });
  else out = out.jpeg({ quality: 90, mozjpeg: true });

  const buf = await out.toBuffer();
  replaceFile(target, buf);
  fs.utimesSync(target, before.atime, before.mtime); // keep the original date modified
  return 'done';
}

// ---------------------------------------------------------------- main
async function main() {
  if (RESTORE) return restore();

  let lo = null, hi = null, how = 'all images';
  if (!ALL) {
    if (opt('--newest') || opt('--oldest')) {
      if (!opt('--newest') || !opt('--oldest')) die('Give BOTH --newest and --oldest file names.');
      const stat = (name) => {
        const p = path.join(DIR, name);
        if (!fs.existsSync(p)) die(`File not found in ${DIR}: ${name}`);
        return fs.statSync(p);
      };
      hi = stat(opt('--newest')).mtimeMs;
      lo = stat(opt('--oldest')).mtimeMs;
      if (lo > hi) die('The --oldest file is actually newer than the --newest file. Swap them.');
      how = `between "${opt('--oldest')}" and "${opt('--newest')}"`;
    } else if (opt('--from') && opt('--to')) {
      lo = parseLocal(opt('--from'), false);
      hi = parseLocal(opt('--to'), true);
      if (lo > hi) die('--from is later than --to.');
      how = `${fmt(new Date(lo))}  to  ${fmt(new Date(hi))}`;
    } else {
      die('Say which images to use: --newest "<file>" --oldest "<file>", or --from/--to, or --all.');
    }
  }

  const picked = fs.readdirSync(DIR)
    .filter((f) => EXT.test(f) && fs.statSync(path.join(DIR, f)).isFile())
    .map((f) => ({ f, ms: fs.statSync(path.join(DIR, f)).mtimeMs }))
    .filter(({ ms }) => ALL || (ms >= lo && ms <= hi))
    .sort((a, b) => b.ms - a.ms || a.f.localeCompare(b.f)); // newest first, like Explorer

  console.log(`Folder : ${DIR}`);
  console.log(`Range  : ${how}`);
  console.log(`Backup : ${BACKUP}\n`);

  if (!picked.length) { console.log('No images matched.'); return; }

  for (const { f, ms } of picked) {
    const has = fs.existsSync(path.join(BACKUP, f)) ? '  (already backed up)' : '';
    console.log(`  ${fmt(new Date(ms))}  ${f}${has}`);
  }
  console.log(`\n${picked.length} image(s) matched.`);
  console.log(`First (newest): ${picked[0].f}`);
  console.log(`Last  (oldest): ${picked[picked.length - 1].f}`);

  if (!WRITE) {
    console.log('\nDry run only. Check the count and the first/last names above, then add --write.');
    return;
  }

  console.log('');
  sweepTemp();
  let ok = 0, skipped = 0, failed = 0, streak = 0, lastCode = '';
  for (const { f } of picked) {
    try {
      const r = await stamp(f);
      streak = 0;
      if (r === 'done') ok++; else skipped++;
      console.log(`  ${r === 'done' ? 'ok     ' : 'skipped'} ${f}${r === 'done' ? '' : '  - ' + r}`);
    } catch (e) {
      failed++;
      streak = (e.code && e.code === lastCode) ? streak + 1 : 1;
      lastCode = e.code || '';
      console.log(`  FAILED  ${f}  - ${e.code || ''} ${e.message.split('\n')[0].slice(0, 160)}`);
      if (streak >= 5 && ok === 0) {
        console.log(`\nStopping: ${streak} files in a row failed with ${e.code || 'the same error'}.`);
        console.log('Nothing has been changed on those files. Try these, then run the same command again:');
        console.log('  1. Stop the local server (Ctrl+C in its window) and close Explorer\'s preview pane / any image viewer.');
        console.log('  2. Clear the read-only flag:   attrib -R assets\\images\\products\\*.*');
        console.log('  3. Pause antivirus scanning of this folder briefly, or check that Windows "Controlled folder access" is not blocking node.');
        process.exitCode = 1;
        break;
      }
    }
  }
  console.log(`\nWatermarked ${ok}, skipped ${skipped}, failed ${failed}.`);
  if (ok) console.log(`Originals are safe in ${BACKUP}`);
  if (ok) console.log('Refresh your browser with Ctrl+F5 to see the new images.');
  if (failed) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
