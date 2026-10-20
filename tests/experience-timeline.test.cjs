const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync, statSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');

const root = resolve(__dirname, '..');
const aboutPage = join(root, 'about-me-beta.html');
const aboutScript = join(root, 'js/about-me-beta.js');

const html = readFileSync(aboutPage, 'utf8');
const script = readFileSync(aboutScript, 'utf8');

const timelineMatch = html.match(/<section\b[^>]*\bid=["']timeline["'][^>]*>[\s\S]*?<\/section>/i);
assert.ok(timelineMatch, 'Missing #timeline section in about-me-beta.html');
const timeline = timelineMatch[0];

const frenchObjectMatch = script.match(/const\s+french\s*=\s*\{([\s\S]*?)\};/);
assert.ok(frenchObjectMatch, 'Missing french object in js/about-me-beta.js');
const frenchObject = frenchObjectMatch[1];

const timelineI18nKeys = new Set(
  [...html.matchAll(/data-beta-i18n="(tl\.[^"]+)"/g)].map(([, key]) => key)
);

const frenchKeys = new Set(
  [...frenchObject.matchAll(/'([^']+)'\s*:/g)].map(([, key]) => key)
);

const timelineImages = [...timeline.matchAll(/<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi)].map(([, , src]) => src);

const timelineItems = [...timeline.matchAll(/<li\b[^>]*class\s*=\s*(["'])[^"']*\btl-item\b[^"']*\1[^>]*>[\s\S]*?<\/li>/gi)].map((match) => match[0]);

const resolvePageAsset = (pagePath, rawPath) => {
  const pathname = decodeURIComponent(rawPath.split(/[?#]/, 1)[0]);
  if (pathname.startsWith('/personal-website-/')) {
    return join(root, pathname.slice('/personal-website-/'.length));
  }
  return resolve(dirname(pagePath), pathname);
};

test('every timeline i18n key in markup exists in french dictionary', () => {
  const missing = [...timelineI18nKeys].filter((key) => !frenchKeys.has(key));
  assert.deepEqual(missing, []);
});

test('timeline images reference files that exist', () => {
  const missing = timelineImages.filter((src) => {
    const target = resolvePageAsset(aboutPage, src);
    return !existsSync(target) || !statSync(target).isFile();
  });
  assert.deepEqual(missing, []);
});

test('timeline has five items with year, logo alt text, and label', () => {
  assert.equal(timelineItems.length, 5);

  timelineItems.forEach((item, index) => {
    assert.match(item, /class\s*=\s*(["'])[^"']*\btl-year\b[^"']*\1/i, `Timeline item ${index + 1} is missing .tl-year`);
    assert.match(item, /class\s*=\s*(["'])[^"']*\btl-label\b[^"']*\1/i, `Timeline item ${index + 1} is missing .tl-label`);

    const logoMatch = item.match(/<span\b[^>]*class\s*=\s*(["'])[^"']*\btl-logo\b[^"']*\1[^>]*>[\s\S]*?<img\b[^>]*\balt\s*=\s*(["'])(.*?)\2[\s\S]*?<\/span>/i);
    assert.ok(logoMatch, `Timeline item ${index + 1} is missing .tl-logo img`);
    assert.ok(logoMatch[3].trim().length > 0, `Timeline item ${index + 1} has empty logo alt text`);
  });
});
