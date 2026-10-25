#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageDir = path.join(root, 'integrations', 'chatgpt')
const schemaBase = 'https://agent-plugins.org/schemas/1.0.0/'
const expectedFiles = ['README.md', 'assets/icon.png', 'mcp.json', 'plugin.json']
const expectedMcpUrl = 'https://provamedborgarskap.se/api/mcp'

function object(value, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`)
  return value
}

function text(value, label, maximum) {
  assert.equal(typeof value, 'string', `${label} must be a string`)
  assert(value.trim(), `${label} must not be blank`)
  if (maximum) assert(value.length <= maximum, `${label} must be at most ${maximum} characters`)
  return value
}

function httpsUrl(value, label) {
  const url = new URL(text(value, label, 2048))
  assert.equal(url.protocol, 'https:', `${label} must use HTTPS`)
  assert(!url.username && !url.password, `${label} must not contain credentials`)
  return url
}

async function inventory(directory, relative = '') {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.join(relative, entry.name)
    if (entry.isDirectory()) files.push(...(await inventory(path.join(directory, entry.name), name)))
    else if (entry.isFile()) files.push(name.replaceAll(path.sep, '/'))
    else assert.fail(`unsupported package entry ${name}`)
  }
  return files.sort()
}

const [pluginText, mcpText, readme, files, icon] = await Promise.all([
  readFile(path.join(packageDir, 'plugin.json'), 'utf8'),
  readFile(path.join(packageDir, 'mcp.json'), 'utf8'),
  readFile(path.join(packageDir, 'README.md'), 'utf8'),
  inventory(packageDir),
  readFile(path.join(packageDir, 'assets', 'icon.png')),
])
const plugin = object(JSON.parse(pluginText), 'plugin.json')
const mcp = object(JSON.parse(mcpText), 'mcp.json')

assert.deepEqual(files, expectedFiles, 'ChatGPT package must use the explicit portable-file allowlist')
assert.equal(plugin.$schema, `${schemaBase}plugin.schema.json`)
assert.equal(text(plugin.name, 'name', 64), 'prova-medborgarskap')
assert.match(text(plugin.version, 'version', 64), /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/)
text(plugin.description, 'description', 4000)
assert.equal(text(object(plugin.author, 'author').name, 'author.name', 120), 'Adrian Martén')
assert.equal(httpsUrl(plugin.author.url, 'author.url').href, 'https://provamedborgarskap.se/om')
assert.equal(httpsUrl(plugin.homepage, 'homepage').href, 'https://provamedborgarskap.se/')
assert(Array.isArray(plugin.keywords) && plugin.keywords.length >= 3, 'keywords must be useful')

const openai = object(object(plugin.extensions, 'extensions')['com.openai'], 'extensions.com.openai')
const ui = object(openai.interface, 'extensions.com.openai.interface')
assert.equal(text(ui.displayName, 'displayName', 30), 'Prova medborgarskap')
text(ui.shortDescription, 'shortDescription', 30)
text(ui.longDescription, 'longDescription', 4000)
assert.equal(text(ui.developerName, 'developerName', 80), 'Adrian Martén')
assert.equal(text(ui.category, 'category', 120), 'Education & Research')
assert(Array.isArray(ui.capabilities) && ui.capabilities.length === 2, 'expected two read-only capabilities')
for (const url of [ui.websiteURL, ui.supportURL, ui.privacyPolicyURL, ui.termsOfServiceURL]) httpsUrl(url, 'publisher URL')
assert(Array.isArray(ui.defaultPrompt) && ui.defaultPrompt.length >= 1 && ui.defaultPrompt.length <= 3, 'use one to three starter prompts')
assert.match(text(ui.brandColor, 'brandColor', 7), /^#[0-9a-fA-F]{6}$/)
assert.equal(ui.composerIcon, './assets/icon.png')
assert.equal(ui.logo, './assets/icon.png')

assert(icon.length <= 5 * 1024 * 1024, 'icon must be 5 MiB or smaller')
assert(icon.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'icon must be PNG')
assert.equal(icon.toString('ascii', 12, 16), 'IHDR', 'icon must declare dimensions')
assert.equal(icon.readUInt32BE(16), icon.readUInt32BE(20), 'icon must be square')

assert.equal(mcp.$schema, `${schemaBase}mcp.schema.json`)
const servers = object(mcp.mcpServers, 'mcpServers')
assert.deepEqual(Object.keys(servers), ['prova-medborgarskap'])
const server = object(servers['prova-medborgarskap'], 'MCP server')
assert.equal(server.type, 'streamable-http')
assert.equal(httpsUrl(server.url, 'MCP URL').href, expectedMcpUrl)
assert.equal(object(object(server.extensions, 'MCP extensions')['com.openai'], 'MCP OpenAI extension').auth.type, 'none')

const review = object(openai.review, 'review')
assert.equal(review.commerce, false)
if (!process.argv.includes('--draft') || review.demo_recording_url) {
  assert.equal(httpsUrl(review.demo_recording_url, 'demo_recording_url').href, 'https://provamedborgarskap.se/integrations/chatgpt/review-1.0.0.html')
  const mediaRoot = path.join(root, 'public', 'integrations', 'chatgpt')
  const [reviewHtml, video, captions] = await Promise.all([
    readFile(path.join(mediaRoot, 'review-1.0.0.html'), 'utf8'),
    readFile(path.join(mediaRoot, 'walkthrough-1.0.0.mp4')),
    readFile(path.join(mediaRoot, 'walkthrough-1.0.0.vtt'), 'utf8'),
  ])
  assert(reviewHtml.includes('noindex, nofollow') && reviewHtml.includes('walkthrough-1.0.0.mp4'), 'review page must serve its noindex walkthrough')
  assert(video.length > 1024 && video.subarray(4, 8).toString() === 'ftyp', 'walkthrough must be a real MP4')
  assert(captions.startsWith('WEBVTT') && captions.includes('00:40.000'), 'walkthrough captions missing')
}

const cases = object(review.test_cases, 'review.test_cases')
assert.equal(cases.positive.length, 5, 'expected five positive review cases')
assert.equal(cases.negative.length, 3, 'expected three negative review cases')
const coveredTools = new Set()
for (const testCase of cases.positive) {
  text(testCase.prompt, 'positive test prompt')
  text(testCase.expected_behavior, 'positive expected behavior')
  for (const tool of text(testCase.tools_triggered, 'positive tools').split(',').map((name) => name.trim())) coveredTools.add(tool)
}
assert.deepEqual([...coveredTools].sort(), ['fetch', 'search'])
for (const testCase of cases.negative) {
  text(testCase.prompt, 'negative test prompt')
  text(testCase.expected_behavior, 'negative expected behavior')
}
text(object(openai.publication, 'publication').release_notes, 'release_notes')

const packageText = `${pluginText}\n${mcpText}\n${readme}`
assert(!/(?:api[_-]?key|authorization|bearer|client[_-]?secret|password)\s*[:=]/i.test(packageText), 'package contains credential-like configuration')
for (const phrase of ['zip -r', 'domain verification', 'review case']) assert(readme.includes(phrase), `README must document ${phrase}`)

console.log('ChatGPT package: manifest, endpoint declaration, icon, review coverage, and allowlisted inventory passed.')
