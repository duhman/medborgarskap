#!/usr/bin/env node
import assert from 'node:assert/strict'

const base = (process.env.BASE_URL ?? process.argv[2] ?? 'https://provamedborgarskap.se').replace(/\/$/, '')
const origin = 'https://provamedborgarskap.se'
const read = async (path, headers = {}) => {
  const response = await fetch(`${base}${path}`, { headers, signal: AbortSignal.timeout(20000) })
  return { response, text: await response.text() }
}
const sitemap = await read('/sitemap.xml')
assert.equal(sitemap.response.status, 200)
assert.match(sitemap.response.headers.get('content-type') ?? '', /xml/)
const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
assert.equal(urls.length, 36, 'Every public route must remain in the sitemap')
assert.equal(new Set(urls).size, urls.length)
for (const url of urls) {
  assert.equal(new URL(url).origin, origin, `Sitemap host: ${url}`)
  const { response, text } = await read(new URL(url).pathname)
  assert.equal(response.status, 200, url)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/, url)
  assert.equal([...text.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)].length, 1, url)
  assert.ok(text.includes(`rel="canonical" href="${url}"`), `Canonical mismatch: ${url}`)
  assert.equal([...text.matchAll(/<title>/g)].length, 1, url)
  assert.equal([...text.matchAll(/<meta\b[^>]*name="description"[^>]*>/g)].length, 1, url)
  assert.doesNotMatch(text, /(?:name="robots"[^>]*content="[^"]*noindex|medborgarskap\.adrianmarten\.net)/, url)
  assert.match(text, /<h1\b/, `No prerendered content: ${url}`)
  assert.ok(text.match(/<main\b[\s\S]*?<\/main>/)?.[0].replace(/<[^>]*>/g, '').length > 100, url)
  const schemas = [...text.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  assert.ok(schemas.length, `No structured data: ${url}`)
  for (const schema of schemas) assert.ok(JSON.parse(schema[1])['@context'])
}
const robots = await read('/robots.txt')
assert.equal(robots.response.status, 200)
assert.ok(robots.text.includes(`Sitemap: ${origin}/sitemap.xml`))
assert.doesNotMatch(robots.text, /^Disallow:\s*\/\s*$/m)
const agents = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Google-Extended', 'GPTBot']
for (const agent of agents) {
  const { response, text } = await read('/kapitel/landet-sverige', { 'User-Agent': agent })
  assert.equal(response.status, 200, agent)
  assert.match(text, /Sverige ligger i Norden/, `Crawler lacks chapter text: ${agent}`)
  assert.doesNotMatch(response.headers.get('x-robots-tag') ?? '', /noindex/i)
}
const llms = await read('/llms.txt')
assert.equal(llms.response.status, 200)
assert.match(llms.response.headers.get('content-type') ?? '', /text\/plain/)
assert.ok(llms.text.includes(`${origin}/kapitel/landet-sverige`))
assert.doesNotMatch(llms.text, /medborgarskap\.adrianmarten\.net/)
for (const path of ['/does-not-exist', '/kapitel/does-not-exist', '/ovning/does-not-exist', '/assets/missing.js', '/api/not-a-tool']) {
  const { response } = await read(path)
  assert.equal(response.status, 404, `Invalid URL must return 404: ${path}`)
}
if (base === origin) {
  for (const host of ['https://medborgarskap.adrianmarten.net', 'https://www.provamedborgarskap.se']) {
    const response = await fetch(`${host}/kapitel/landet-sverige?source=redirect-check`, { redirect: 'manual' })
    assert.ok([301, 308].includes(response.status), `Permanent old-host redirect: ${host}`)
    assert.equal(response.headers.get('location'), `${origin}/kapitel/landet-sverige?source=redirect-check`)
  }
}
console.log(`search visibility passed: ${urls.length} prerendered URLs, ${agents.length} crawlers, sitemap/robots/llms, five invalid paths${base === origin ? ', two host redirects' : ''}`)
