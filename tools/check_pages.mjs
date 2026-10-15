#!/usr/bin/env node
// Smoke-test demo pages in Chromium (Playwright).
//
//   python3 -m http.server 8000 &          # serve the repository root
//   node tools/check_pages.mjs [path ...]  # default: every chapters/**/*.html
//
// For each page: no uncaught errors or console errors (except on exercise starter pages), every code runner finishes,
// and on exercise "final" pages every test passes. Set SHOTS=dir to save light and dark screenshots.
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require('/opt/node22/lib/node_modules/playwright');
}

const ROOT = new URL('..', import.meta.url).pathname;
const BASE = process.env.BASE || 'http://localhost:8000/';
const SHOTS = process.env.SHOTS;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith('.html') ? [relative(ROOT, full)] : [];
  });
}

const pages = process.argv.length > 2 ? process.argv.slice(2) : walk(join(ROOT, 'chapters')).filter((p) => !p.includes('/_'));
const browser = await playwright.chromium.launch();
let failed = 0;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

for (const path of pages) {
  const problems = [];
  // Starter pages of exercises may be broken on purpose (that is the exercise)
  const brokenOnPurpose = /exercises\/\d+-start\.html$/.test(path);
  for (const scheme of SHOTS ? ['light', 'dark'] : ['light']) {
    const page = await browser.newPage({ viewport: { width: 960, height: 800 }, colorScheme: scheme });
    if (!brokenOnPurpose) {
      page.on('pageerror', (e) => problems.push('uncaught: ' + e.message));
      page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
    }
    await page.goto(BASE + path);
    // Wait until every code runner reports done (or give up after 8 s)
    const runners = await page.locator('.playground').count();
    if (runners) {
      await page.waitForFunction(
        (n) => document.querySelectorAll('.pg-status').length === n &&
          [...document.querySelectorAll('.pg-status')].every((s) => /Done|Stopped|Press Run/.test(s.textContent)),
        runners, { timeout: 8000 },
      ).catch(() => problems.push('a code runner did not finish within 8 s'));
    } else {
      await page.waitForTimeout(500);
    }
    if (scheme === 'light' && /exercises\/\d+-final\.html$/.test(path)) {
      const summaries = await page.$$eval('.pg-tests-summary', (els) => els.map((e) => e.textContent));
      // A page whose source has tests must report them: no summary means the code never got to run them
      const source = await (await page.request.get(BASE + path)).text();
      const testBlocks = (source.match(/class="tests"/g) || []).length;
      if (summaries.filter((s) => /\d+ \/ \d+/.test(s)).length < testBlocks) problems.push('tests did not run (look for an error in the output)');
      for (const s of summaries) {
        const m = s.match(/(\d+) \/ (\d+)/);
        if (m && m[1] !== m[2]) problems.push('tests failing: ' + s);
      }
    }
    if (SHOTS) await page.screenshot({ path: join(SHOTS, path.replace(/[/\\]/g, '__').replace(/\.html$/, `.${scheme}.png`)), fullPage: true });
    await page.close();
  }
  if (problems.length) {
    failed++;
    console.log('✗', path);
    for (const p of [...new Set(problems)]) console.log('   ', p);
  } else {
    console.log('✓', path);
  }
}
await browser.close();
console.log(failed ? `${failed} of ${pages.length} pages have problems` : `All ${pages.length} pages OK`);
process.exit(failed ? 1 : 0);
