#!/usr/bin/env node
/**
 * Downloads Sverige i fokus (or reads a local file) and writes its text per page as JSON:
 * { "source": "<url or path>", "pages": { "1": "...", "2": "..." } }. Printed page numbers match
 * PDF page numbers in this document. Used by the quote check and the weekly source check.
 *
 * Usage: node scripts/extract-pdf-text.mjs [--pdf <path-or-url>] [--out <file>] [--hashes <file>] [--strict]
 * --hashes writes one SHA-256 per page, so the weekly check can say which pages changed without
 * storing UHR's text anywhere.
 * Without --strict a failed download only warns, so a slow uhr.se does not block pull requests;
 * the quote test is then skipped. The weekly source check runs with --strict.
 */
import { createHash } from 'node:crypto'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const DEFAULT_PDF =
  'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const pdf = arg('pdf', DEFAULT_PDF)
const out = arg('out', 'sverige-i-fokus.pages.json')

const strict = process.argv.includes('--strict')

async function load() {
  if (!/^https?:/.test(pdf)) return new Uint8Array(await readFile(pdf))
  const res = await fetch(pdf, { signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${pdf}`)
  return new Uint8Array(await res.arrayBuffer())
}

let data
try {
  data = await load()
} catch (err) {
  const message = `PDF_DOWNLOAD_FAILED: ${err instanceof Error ? err.message : err}`
  if (strict) {
    console.error(message)
    process.exit(1)
  }
  // Remove an earlier extract so the quote test skips instead of checking stale text.
  await rm(out, { force: true })
  console.warn(`${message} (skipping the quote check)`)
  process.exit(0)
}

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
// Hash before parsing: pdf.js takes over the buffer.
const pdfSha = sha(Buffer.from(data))
const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise
const pages = {}
for (let n = 1; n <= doc.numPages; n++) {
  const page = await doc.getPage(n)
  const content = await page.getTextContent()
  pages[n] = content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : '') : '')).join('')
}
await writeFile(out, JSON.stringify({ source: pdf, numPages: doc.numPages, pages }, null, 1))
const hashes = arg('hashes', null)
if (hashes) {
  const lines = Object.entries(pages).map(([n, text]) => `sida ${n}: ${sha(text.replace(/\s+/g, ' ').trim())}`)
  await writeFile(hashes, [`sidor: ${doc.numPages}`, `pdf: ${pdfSha}`, ...lines].join('\n') + '\n')
}
console.log(`extract-pdf-text ok (${doc.numPages} pages) -> ${out}`)
