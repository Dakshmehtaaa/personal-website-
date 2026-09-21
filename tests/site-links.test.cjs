const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync, readdirSync, statSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');

const root = resolve(__dirname, '..');
const pages = [
  ...readdirSync(root).filter((name) => name.endsWith('.html')).map((name) => join(root, name)),
  ...readdirSync(join(root, 'concepts')).filter((name) => name.endsWith('.html')).map((name) => join(root, 'concepts', name)),
];

test('published pages do not link to missing local files', () => {
  const missing = [];
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    for (const [, , , raw] of html.matchAll(/\b(href|src)\s*=\s*(["'])(.*?)\2/gi)) {
      if (!raw || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(raw)) continue;
      const pathname = decodeURIComponent(raw.split(/[?#]/, 1)[0]);
      if (!pathname) continue;
      const target = pathname.startsWith('/personal-website-/')
        ? join(root, pathname.slice('/personal-website-/'.length))
        : resolve(dirname(page), pathname);
      const publishedFile = existsSync(target) &&
        (statSync(target).isFile() || (statSync(target).isDirectory() && existsSync(join(target, 'index.html'))));
      if (!publishedFile) {
        missing.push(`${page.slice(root.length + 1)}: ${raw}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test('stylesheets do not reference missing local assets', () => {
  const missing = [];
  const cssDir = join(root, 'css');
  for (const name of readdirSync(cssDir).filter((file) => file.endsWith('.css'))) {
    const stylesheet = join(cssDir, name);
    const css = readFileSync(stylesheet, 'utf8');
    for (const [, quoted, bare] of css.matchAll(/url\(\s*(?:["']([^"']+)["']|([^)]*?))\s*\)/gi)) {
      const raw = (quoted || bare || '').trim();
      if (!raw || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(raw)) continue;
      const target = resolve(cssDir, decodeURIComponent(raw.split(/[?#]/, 1)[0]));
      if (!existsSync(target) || !statSync(target).isFile()) missing.push(`${name}: ${raw}`);
    }
  }
  assert.deepEqual(missing, []);
});
