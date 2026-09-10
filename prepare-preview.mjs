import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const directory = new URL('.', import.meta.url).pathname;
const output = join(directory, 'dist');
await mkdir(output, { recursive: true });
const pages = ['index.html', 'why-sustainability-matters.html', 'hobbies.html', 'co2-tracker.html', 'about-me-beta.html', '404.html'];
const resources = ['style.css', 'script.js', 'i18n.js', 'editorial-base.css', 'editorial.css', 'editorial.js', 'editorial-copy.js', 'about-me-beta.css', 'about-me-beta.js', 'favicon.svg', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml'];
for (const file of [...pages, ...resources]) await cp(join(directory, file), join(output, file));
async function assets(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.endsWith('.md')) continue;
    const from = join(source, entry.name), to = join(destination, entry.name);
    if (entry.isDirectory()) await assets(from, to);
    else await cp(from, to);
  }
}
await assets(join(directory, 'assets'), join(output, 'assets'));
const notFound = join(output, '404.html');
await writeFile(notFound, (await readFile(notFound, 'utf8')).replaceAll('/personal-website-/', '/'));
console.log('Public site assets staged.');
