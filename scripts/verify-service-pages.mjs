// Check the built public pages, not just the source data. Run after npm run build.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('dist/client');
const core = ['diagnostics', 'engine-maintenance', 'brake-services', 'suspension-alignment', 'electrical-systems', 'presale-inspection', 'general-repairs'];
const added = ['tires', 'air-conditioning', 'transmission', 'exhaust', 'glass', 'body-trim', 'detailing', 'paintless-dent-repair', 'car-key-replacement', 'windshield-replacement'];
const slugs = [...core, ...added];
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const attr = (tag, name) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);
const meta = (html, key, value) => attr(tags(html, 'meta').find((tag) => attr(tag, key) === value) ?? '', 'content');
const sitemap = readdirSync(root).filter((name) => /^sitemap.*\.xml$/.test(name)).map(read).join('\n');
const index = read('services/index.html');
const titles = new Set();
const descriptions = new Set();

for (const slug of slugs) {
  const route = `/services/${slug}/`;
  const html = read(`${route.slice(1)}index.html`);
  assert.equal(tags(html, 'h1').length, 1, `${slug}: exactly one H1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = meta(html, 'name', 'description');
  assert(title && !titles.has(title), `${slug}: unique title`);
  assert(description && !descriptions.has(description), `${slug}: unique description`);
  titles.add(title); descriptions.add(description);
  const canonical = tags(html, 'link').find((tag) => attr(tag, 'rel') === 'canonical');
  assert.equal(attr(canonical ?? '', 'href'), `https://budgetautosrepair.com${route}`);
  assert(!meta(html, 'name', 'robots')?.includes('noindex'), `${slug}: indexable page`);
  assert(sitemap.includes(`https://budgetautosrepair.com${route}`), `${slug}: present in sitemap`);
  assert(index.includes(`href="${route}"`), `${slug}: linked from service index`);
  const graphs = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const service = graphs.find((graph) => graph['@type'] === 'Service');
  assert.equal(service?.url, `https://budgetautosrepair.com${route}`);
  assert.equal(service?.provider?.['@id'], 'https://budgetautosrepair.com/#business');
  assert(graphs.some((graph) => graph['@type'] === 'BreadcrumbList'));
  for (const id of ['overview', 'what-we-check', 'your-visit', 'cost-and-timing', 'service-faq']) {
    assert(html.includes(`id="${id}"`), `${slug}: missing ${id}`);
  }
  assert(tags(html, 'details').length >= 4, `${slug}: useful FAQs`);
  for (const img of tags(html, 'img').filter((tag) => attr(tag, 'src')?.startsWith('/_astro/'))) {
    const src = attr(img, 'src');
    assert(attr(img, 'alt'), `${slug}: descriptive image alt`);
    assert(attr(img, 'width') && attr(img, 'height'), `${slug}: reserved image dimensions`);
    assert(existsSync(resolve(root, src.slice(1))), `${slug}: missing image ${src}`);
  }
  const share = meta(html, 'property', 'og:image');
  assert(share, `${slug}: social image`);
  assert.equal(meta(html, 'property', 'og:image:width'), '1200');
  assert(existsSync(resolve(root, new URL(share).pathname.slice(1))), `${slug}: published social image`);
  for (const tag of tags(html, 'video')) {
    assert.equal(attr(tag, 'preload'), 'none', `${slug}: video must be click-to-play`);
    assert(!/\bautoplay\b/.test(tag), `${slug}: no auto-download video`);
    assert(existsSync(resolve(root, attr(tag, 'poster').slice(1))), `${slug}: video poster exists`);
  }
  for (const tag of tags(html, 'a')) {
    const href = attr(tag, 'href');
    if (/^\/(blog|services|quote)\//.test(href ?? '')) {
      assert(existsSync(resolve(root, href.split(/[?#]/)[0].slice(1), 'index.html')), `${slug}: broken link ${href}`);
    }
  }
  const quote = read(`quote/${slug}/index.html`);
  assert(meta(quote, 'name', 'robots')?.includes('noindex'), `${slug}: quote form stays out of search`);
  assert(!sitemap.includes(`https://budgetautosrepair.com/quote/${slug}/`));
  if (added.includes(slug)) assert(!html.includes(`/book/?service=${slug}`), `${slug}: no unconfigured booking event`);
  else assert(html.includes(`/book/?service=${slug}`), `${slug}: existing booking preserved`);
  console.log(`PASS ${route} — content, metadata, schema, media, links, and quote route`);
}
console.log(`Verified all ${slugs.length} complete service pages.`);
