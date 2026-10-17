// Submit every URL in the live sitemap to IndexNow (Bing, Yandex and others share submissions).
// Usage: npm run indexnow   (run after a deploy; SITE_ORIGIN overrides the origin)
// The key file lives in src/root/<key>.txt and is copied to the site root by build.mjs.
import fs from 'node:fs';

const origin = process.env.SITE_ORIGIN || 'https://gamedevaitools.com';
const keyFile = fs.readdirSync('src/root').find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.error('No IndexNow key file (src/root/<32 hex>.txt) found.'); process.exit(1); }
const key = fs.readFileSync(`src/root/${keyFile}`, 'utf8').trim();

const keyRes = await fetch(`${origin}/${keyFile}`);
if (!keyRes.ok || (await keyRes.text()).trim() !== key) { console.error(`Key file not live at ${origin}/${keyFile} (HTTP ${keyRes.status}). Deploy first.`); process.exit(1); }

const sm = await (await fetch(`${origin}/sitemap.xml`)).text();
const urlList = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const host = new URL(origin).host;
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${origin}/${keyFile}`, urlList }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs for ${host}: HTTP ${res.status} ${res.statusText}`);
const body = await res.text();
if (body) console.log(body.slice(0, 500));
// 200 = accepted, 202 = accepted (key validation pending); 4xx = problem (400 bad request, 403 key invalid, 422 URLs don't match host, 429 too many requests).
if (res.status >= 400) process.exit(1);
