#!/usr/bin/env node
/**
 * Deployment readiness check for the built site.
 *
 * GitHub Actions proves the app builds; it does not prove the *output* is
 * deployable. Vercel serves `dist` as-is with a SPA fallback, so a missing
 * asset or an unemitted resource page becomes a broken link in production while
 * CI stays green. This script asserts the things Vercel actually depends on.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(process.argv[2] ?? join(repoRoot, "dist"));
const resourcesRoot = join(repoRoot, "resources");

const errors = [];
const warnings = [];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

// Vercel serves this directory directly; without it every route 404s.
const indexPath = join(distDir, "index.html");
if (!existsSync(indexPath)) {
  fail(`missing ${join(distDir, "index.html")} - check outputDirectory in vercel.json`);
}

if (errors.length === 0) {
  const html = readFileSync(indexPath, "utf8");

  // Every same-origin reference in the shell must resolve inside dist.
  for (const [, url] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (
        /<script[^>]+src=["']?https?:/i.test(html) &&
        new RegExp(`src=["']?${escapeRe(url)}`).test(html)
      ) {
        fail(`index.html loads an external script: ${url}`);
      }
      warn(`index.html has an external dependency: ${url}`);
      continue;
    }
    if (url.startsWith("/")) {
      const target = join(distDir, url);
      if (!existsSync(target) || statSync(target).isDirectory()) {
        fail(`index.html references ${url} but it is not in ${distDir}`);
      }
    }
  }

  // An external <script> anywhere in the shell breaks the self-contained rule.
  for (const [, url] of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    if (/^https?:/i.test(url)) fail(`index.html loads an external script: ${url}`);
  }

  // A remote webfont is a render-blocking request to a domain that is
  // unreachable from mainland China, which stalls first paint until timeout.
  for (const [, url] of html.matchAll(/<link[^>]+href="(https?:\/\/[^"]+)"/g)) {
    if (/fonts\.(googleapis|gstatic)\.com/i.test(url)) {
      fail(
        `index.html loads a remote webfont: ${url} - use a system font stack or self-host under public/fonts/`,
      );
    }
  }

  // Belt-and-braces: a stray @font-face pointing at a CDN would slip past the
  // index.html check.
  const cssFiles = readdirSync(join(distDir, "assets")).filter((f) => f.endsWith(".css"));
  for (const file of cssFiles) {
    const css = readFileSync(join(distDir, "assets", file), "utf8");
    for (const [, url] of css.matchAll(/url\((?:"|')?(https?:\/\/[^)"']+)(?:"|')?\)/g)) {
      if (/fonts\.(googleapis|gstatic)\.com/i.test(url)) {
        fail(`dist/assets/${file} references a remote webfont: ${url}`);
      }
    }
  }
}

// Every published study/slide page must survive the build.
const sources = [];
for (const resourceId of readdirSync(resourcesRoot).sort()) {
  for (const kind of ["studies", "slides"]) {
    const dir = join(resourcesRoot, resourceId, kind);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).sort()) {
      if (file.endsWith(".html")) sources.push({ resourceId, slug: file.replace(/\.html$/, "") });
    }
  }
}

const emitted = existsSync(join(distDir, "assets"))
  ? readdirSync(join(distDir, "assets")).filter((f) => f.endsWith(".html"))
  : [];

for (const { resourceId, slug } of sources) {
  if (!emitted.some((name) => name === `${slug}.html` || name.startsWith(`${slug}-`))) {
    fail(`resources/${resourceId}/${slug}.html was not emitted into dist/assets`);
  }
}
if (emitted.length !== sources.length) {
  fail(`dist/assets holds ${emitted.length} html files but resources/ defines ${sources.length}`);
}

const bytes = directorySize(distDir);
console.log(`dist: ${distDir}`);
console.log(`  html sources=${sources.length} emitted=${emitted.length}`);
console.log(`  total size=${(bytes / 1e6).toFixed(1)} MB`);
for (const message of new Set(warnings)) console.log(`  warn  ${message}`);
for (const message of new Set(errors)) console.log(`  ERROR ${message}`);

if (errors.length > 0) {
  console.log(`\n${errors.length} deployment readiness problem(s) found.`);
  process.exit(1);
}
console.log(`\ndist is deployable (${warnings.length} warning(s)).`);

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function directorySize(path) {
  return readdirSync(path).reduce((total, entry) => {
    const child = join(path, entry);
    return total + (statSync(child).isDirectory() ? directorySize(child) : statSync(child).size);
  }, 0);
}
