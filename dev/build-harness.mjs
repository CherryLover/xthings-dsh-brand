#!/usr/bin/env node
/**
 * Regenerates dev/harness.html from dev/harness.template.html, reproducing the
 * way the DSH host builds index.html: one inline <style> plus three inline
 * <script> rows, in this order —
 *
 *   1. <script> lottie-web 5.12.2 build </script>          -> window.lottie
 *   2. <script> globalThis.__XTHINGS_LAUNCH_DATA__ = {…} </script>
 *   3. <script> assets/splash.js </script>
 *
 * Everything is inlined, so the harness behaves like the file:// app and the
 * overlay never needs a route. Run: node dev/build-harness.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const read = (relPath) => readFileSync(join(ROOT, relPath), 'utf8');

// An inlined `</script` inside JS/JSON source would close the row early.
const guard = (text) => text.replace(/<\/(script)/gi, '<\\/$1');

const lottie = read('assets/lottie.min.js');
const launchJson = read('assets/launch.json').trim();
const splash = read('assets/splash.js');
const css = read('assets/splash.css');
const template = read('dev/harness.template.html');

// Sanity: the data must be a plain object literal with layers to animate.
const launch = JSON.parse(launchJson);
if (!Array.isArray(launch.layers) || launch.w !== 800 || launch.h !== 500) {
  throw new Error('assets/launch.json is not the expected 800x500 Lottie');
}

const rows = [
  '<!-- row 1: lottie-web runtime; the UMD build self-assigns window.lottie -->',
  '<script>' + guard(lottie) + '</script>',
  '<!-- row 2: the animation data as a plain JS object -->',
  '<script>globalThis.__XTHINGS_LAUNCH_DATA__ = ' + guard(launchJson) + ';</script>',
  '<!-- row 3: the splash overlay itself (inlined, appended to <body>) -->',
  '<script>' + guard(splash) + '</script>',
].join('\n');

const CSS_MARK = '<!--@@XTHINGS_CSS@@-->';
const ROWS_MARK = '<!--@@XTHINGS_ROWS@@-->';
if (!template.includes(CSS_MARK) || !template.includes(ROWS_MARK)) {
  throw new Error('template is missing its injection markers');
}

// Function replacements: inline code is full of "$" sequences that a string
// replacement would reinterpret.
const html = template
  .replace(CSS_MARK, () => '<style>\n' + css + '</style>')
  .replace(ROWS_MARK, () => rows);

writeFileSync(join(ROOT, 'dev/harness.html'), html);

console.log('wrote ' + relative(process.cwd(), join(ROOT, 'dev/harness.html')));
console.log('  lottie.min.js  ' + Buffer.byteLength(lottie) + ' B');
console.log('  launch.json    ' + Buffer.byteLength(launchJson) + ' B');
console.log('  splash.js      ' + Buffer.byteLength(splash) + ' B');
console.log('  splash.css     ' + Buffer.byteLength(css) + ' B');
console.log('  harness.html   ' + Buffer.byteLength(html) + ' B');
