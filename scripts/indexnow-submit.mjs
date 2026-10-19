#!/usr/bin/env node
/**
 * IndexNow: tell Bing, Yandex, Seznam, Naver and other IndexNow engines which URLs
 * changed, right after a production deploy. Run: `npm run indexnow` (or `bun run indexnow`).
 * Reads the live sitemap(s), so it submits exactly what is deployed. The key is public by
 * design (https://www.indexnow.org/documentation); it must match public/<KEY>.txt.
 * Optional: pass URLs as arguments to submit only those.
 */
const HOST = "medborgarskap.adrianmarten.net";
const KEY = "84e5541df3f62f44a95b40005d8ad68d";
const SITEMAPS = ["https://medborgarskap.adrianmarten.net/sitemap.xml"];
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function sitemapUrls(url) {
  const res = await fetch(url, { headers: { "User-Agent": "indexnow-submit" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

const args = process.argv.slice(2);
const urls = args.length
  ? args
  : [...new Set((await Promise.all(SITEMAPS.map(sitemapUrls))).flat())];
const own = urls.filter((u) => new URL(u).host === HOST);
if (own.length === 0) {
  console.error("indexnow: no URLs for", HOST);
  process.exit(1);
}

const keyRes = await fetch(`https://${HOST}/${KEY}.txt`);
const keyText = keyRes.ok ? (await keyRes.text()).trim() : "";
if (keyText !== KEY) {
  console.error(`indexnow: https://${HOST}/${KEY}.txt is not live yet (HTTP ${keyRes.status}); deploy first.`);
  process.exit(1);
}

let failed = false;
for (let i = 0; i < own.length; i += 10000) {
  const urlList = own.slice(i, i + 10000);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  console.log(`indexnow: ${urlList.length} URLs -> HTTP ${res.status}`);
  if (res.status !== 200 && res.status !== 202) {
    failed = true;
    console.error(await res.text());
  }
}
process.exit(failed ? 1 : 0);
